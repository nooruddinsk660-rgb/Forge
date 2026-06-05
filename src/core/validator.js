import { IR_NAMING } from "./ir.js";

// ─────────────────────────────────────────────────────────────────────────────
//  CROSS-LAYER VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────
export const crossLayerValidate = (stageOutputs) => {
  const issues = [];
  const warnings = [];
  const passes = [];

  const codegen   = stageOutputs["codegen"]?.data || {};
  const tables    = codegen.db_schema?.tables || [];
  const endpoints = codegen.api_schema?.endpoints || [];
  const pages     = codegen.ui_schema?.pages || [];
  const authSchema= codegen.auth_schema || {};
  const semantic  = stageOutputs["semantic"]?.data?.semantic_model || {};

  // Build lookup maps
  const tableNames  = new Set(tables.map(t => t.name));
  const columnMap   = {};
  tables.forEach(t => { columnMap[t.name] = new Set((t.columns||[]).map(c => c.name)); });
  const endpointIds = new Set(endpoints.map(e => e.id));
  const epPaths     = new Set(endpoints.map(e => e.path));
  const roleNames   = new Set((semantic.roles||[]).map(r => r.name));

  // ── CHECK 1: API response fields exist in DB ──────────────────────────────
  endpoints.forEach(ep => {
    const res = ep.res200 || {};
    const fkPattern = /^[a-z_]+_id$/;
    Object.keys(res).forEach(field => {
      if (field === "token" || field === "message" || field === "success") return;
      const colFound = tables.some(t => columnMap[t.name]?.has(field));
      if (!colFound && !fkPattern.test(field)) {
        warnings.push({
          code: "API_DB_DRIFT",
          layer: "API↔DB",
          msg: `Endpoint ${ep.id} returns "${field}" not found in any DB table`,
          fixable: true,
          hint: `Add "${field}" column to relevant table or remove from response`,
        });
      }
    });
    // Check request body fields too
    const body = ep.body || {};
    Object.keys(body).forEach(field => {
      if (["password","token","confirm_password"].includes(field)) return;
      const colFound = tables.some(t => columnMap[t.name]?.has(field));
      if (!colFound) {
        warnings.push({
          code: "API_BODY_DB_DRIFT",
          layer: "API↔DB",
          msg: `Endpoint ${ep.id} request body field "${field}" not mapped in DB`,
          fixable: true,
          hint: `Ensure "${field}" exists in the relevant table`,
        });
      }
    });
  });

  // ── CHECK 2: UI page data bindings reference valid endpoints ─────────────
  pages.forEach(page => {
    (page.binds || []).forEach(epId => {
      if (epId && !endpointIds.has(epId)) {
        issues.push({
          code: "UI_ORPHAN_BINDING",
          layer: "UI↔API",
          msg: `Page "${page.name}" binds to unknown endpoint "${epId}"`,
          fixable: true,
          hint: `Create endpoint ${epId} or fix the binding`,
        });
      }
    });
  });

  // ── CHECK 3: Page role guards match defined roles ─────────────────────────
  pages.forEach(page => {
    (page.roles || []).forEach(role => {
      if (roleNames.size > 0 && !roleNames.has(role) && !["admin","user","public"].includes(role.toLowerCase())) {
        warnings.push({
          code: "UNDEFINED_ROLE",
          layer: "UI↔Auth",
          msg: `Page "${page.name}" references undefined role "${role}"`,
          fixable: true,
          hint: `Add "${role}" to semantic roles or fix page role guard`,
        });
      }
    });
  });

  // ── CHECK 4: Endpoint role guards match defined roles ────────────────────
  endpoints.forEach(ep => {
    (ep.roles || []).forEach(role => {
      if (roleNames.size > 0 && !roleNames.has(role) && !["admin","user","public"].includes(role.toLowerCase())) {
        warnings.push({
          code: "EP_UNDEFINED_ROLE",
          layer: "API↔Auth",
          msg: `Endpoint "${ep.id}" references undefined role "${role}"`,
          fixable: true,
          hint: `Add "${role}" to semantic roles or fix endpoint role guard`,
        });
      }
    });
  });

  // ── CHECK 5: Auth routes exist in API endpoints ───────────────────────────
  const authRoutes = Object.values(authSchema.routes || {});
  const hasLoginEp = authRoutes.some(r => r.includes("/login")) || epPaths.has("/api/v1/auth/login") || endpoints.some(e => e.path?.includes("login"));
  if (!hasLoginEp) {
    issues.push({
      code: "MISSING_AUTH_ENDPOINT",
      layer: "Auth↔API",
      msg: "No login endpoint found in API schema",
      fixable: true,
      hint: "Add POST /api/v1/auth/login to endpoints",
    });
  } else {
    passes.push({ code: "AUTH_LOGIN_EXISTS", layer: "Auth↔API", msg: "Login endpoint present" });
  }

  // ── CHECK 6: Every entity has a DB table ─────────────────────────────────
  const irData = stageOutputs["ir"]?.data;
  if (irData?.entities) {
    irData.entities.forEach(entity => {
      const expectedTable = IR_NAMING.toTableName(entity);
      if (!tableNames.has(expectedTable)) {
        issues.push({
          code: "MISSING_ENTITY_TABLE",
          layer: "IR↔DB",
          msg: `Entity "${entity}" has no DB table (expected "${expectedTable}")`,
          fixable: true,
          hint: `Add table "${expectedTable}" to db_schema`,
        });
      } else {
        passes.push({ code: "ENTITY_TABLE_EXISTS", layer: "IR↔DB", msg: `Table "${expectedTable}" present for entity "${entity}"` });
      }
    });
  }

  // ── CHECK 7: All tables have primary key ─────────────────────────────────
  tables.forEach(table => {
    const hasPK = (table.columns || []).some(c => c.primary === true || c.name === "id");
    if (!hasPK) {
      issues.push({
        code: "MISSING_PRIMARY_KEY",
        layer: "DB",
        msg: `Table "${table.name}" has no primary key`,
        fixable: true,
        hint: `Add "id uuid PRIMARY KEY" column to "${table.name}"`,
      });
    } else {
      passes.push({ code: "PK_EXISTS", layer: "DB", msg: `Table "${table.name}" has primary key` });
    }
  });

  // ── CHECK 8: Payments = at least one payment-related table ───────────────
  if (irData?.hasPayments) {
    const hasPaymentTable = tables.some(t => /payment|subscription|invoice|billing|order/i.test(t.name));
    if (!hasPaymentTable) {
      warnings.push({
        code: "MISSING_PAYMENT_TABLE",
        layer: "IR↔DB",
        msg: "Payments feature detected but no payment/subscription table found",
        fixable: true,
        hint: "Add payments or subscriptions table",
      });
    }
  }

  const score = Math.max(0, Math.round(
    100 - (issues.length * 15) - (warnings.length * 5)
  ));

  return {
    issues,
    warnings,
    passes,
    score,
    status: issues.length > 0 ? "FAIL" : warnings.length > 0 ? "WARN" : "PASS",
    summary: { pass: passes.length, warn: warnings.length, fail: issues.length, total: passes.length + warnings.length + issues.length }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  STAGE SCHEMA VALIDATOR (Zod-style, pure JS)
// ─────────────────────────────────────────────────────────────────────────────
export const SCHEMA_RULES = {
  lexer: {
    required: ["stage", "tokens", "confidence"],
    nested: { tokens: ["app_type", "core_features", "entities", "roles"] },
    types: { confidence: "number", "tokens.core_features": "array", "tokens.entities": "array" },
  },
  parser: {
    required: ["stage", "intent_ast"],
    nested: { intent_ast: ["app_name", "entities", "user_flows"] },
    types: { "intent_ast.entities": "array", "intent_ast.user_flows": "array" },
  },
  ir: {
    required: ["stage", "ir"],
    nested: { ir: ["appName", "entities", "roles", "tables"] },
    types: { "ir.entities": "array", "ir.roles": "array", "ir.tables": "array" },
  },
  semantic: {
    required: ["stage", "semantic_model"],
    nested: { semantic_model: ["roles", "permission_matrix", "business_rules"] },
    types: { "semantic_model.roles": "array" },
  },
  codegen: {
    required: ["stage", "db_schema", "api_schema", "ui_schema", "auth_schema"],
    nested: { db_schema: ["tables"], api_schema: ["endpoints"], ui_schema: ["pages"] },
    types: { "db_schema.tables": "array", "api_schema.endpoints": "array", "ui_schema.pages": "array" },
  },
  linker: {
    required: ["stage", "linkage", "resolved"],
    nested: { resolved: ["app_name", "stack"] },
    types: {},
  },
  validator: {
    required: ["stage", "report"],
    nested: { report: ["status", "score", "checks", "summary"] },
    types: { "report.score": "number", "report.checks": "array" },
  },
  repair: {
    required: ["stage", "patches", "final"],
    nested: { final: ["app_name", "status", "score", "meta"] },
    types: { "final.score": "number", "patches": "array" },
  },
  verify: {
    required: ["stage", "result"],
    nested: { result: ["status", "score", "improvement"] },
    types: { "result.score": "number" },
  },
};

export const validateSchema = (stageId, data) => {
  const rules = SCHEMA_RULES[stageId];
  if (!rules) return { valid: true, errors: [], warnings: [], score: 100 };

  const errors = [], warnings = [];

  // Required top-level
  (rules.required || []).forEach(field => {
    if (data[field] === undefined || data[field] === null) {
      errors.push({ code: "MISSING_FIELD", field, msg: `Required "${field}" is missing` });
    }
  });

  // Required nested
  Object.entries(rules.nested || {}).forEach(([parent, fields]) => {
    if (data[parent]) {
      fields.forEach(field => {
        if (data[parent][field] === undefined) {
          errors.push({ code: "MISSING_NESTED", field: `${parent}.${field}`, msg: `"${parent}.${field}" is missing` });
        }
      });
    }
  });

  // Type checks
  Object.entries(rules.types || {}).forEach(([path, expectedType]) => {
    const parts = path.split(".");
    let val = data;
    for (const p of parts) val = val?.[p];
    if (val !== undefined) {
      const actual = Array.isArray(val) ? "array" : typeof val;
      if (actual !== expectedType) {
        errors.push({ code: "TYPE_ERROR", field: path, msg: `"${path}" must be ${expectedType}, got ${actual}` });
      }
    }
  });

  // Range checks
  if (stageId === "lexer" && typeof data.confidence === "number") {
    if (data.confidence < 0 || data.confidence > 1) {
      errors.push({ code: "RANGE_ERROR", field: "confidence", msg: "confidence must be 0-1" });
    }
  }
  if ((stageId === "validator" || stageId === "repair") && typeof data.report?.score === "number") {
    if (data.report.score < 0 || data.report.score > 100) {
      errors.push({ code: "RANGE_ERROR", field: "report.score", msg: "score must be 0-100" });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 25 - warnings.length * 10),
  };
};
