// Model pricing (Anthropic API, per 1M tokens)
export const STAGES = [
  { id: "lexer",     n: "01", name: "Lexer",     tag: "Intent Tokenization",      color: "#F59E0B", darkBg: "#F59E0B0D" },
  { id: "parser",    n: "02", name: "Parser",    tag: "AST Construction",         color: "#10B981", darkBg: "#10B9810D" },
  { id: "ir",        n: "03", name: "IR Build",  tag: "Intermediate Representation", color: "#06B6D4", darkBg: "#06B6D40D" },
  { id: "semantic",  n: "04", name: "Semantic",  tag: "Role & Logic Analysis",    color: "#6366F1", darkBg: "#6366F10D" },
  { id: "codegen",   n: "05", name: "Codegen",   tag: "4-Schema Emission",        color: "#EC4899", darkBg: "#EC48990D" },
  { id: "linker",    n: "06", name: "Linker",    tag: "Cross-Layer Binding",      color: "#14B8A6", darkBg: "#14B8A60D" },
  { id: "validator", n: "07", name: "Validator", tag: "Contract Enforcement",     color: "#F97316", darkBg: "#F973160D" },
  { id: "repair",    n: "08", name: "Repair",    tag: "Surgical Patch Engine",    color: "#8B5CF6", darkBg: "#8B5CF60D" },
  { id: "verify",    n: "09", name: "Verify",    tag: "Post-Repair Verification", color: "#10B981", darkBg: "#10B9810D" },
];

export const MODEL_PRICING = {
  "claude-haiku-4-5-20251001":      { input: 0.80,  output: 4.00,  label: "Haiku 4.5",  tier: "fast"    },
  "claude-sonnet-4-6":              { input: 3.00,  output: 15.00, label: "Sonnet 4.6", tier: "balanced" },
  "claude-opus-4-6":                { input: 15.00, output: 75.00, label: "Opus 4.6",   tier: "best"    },
  "gemini-1.5-flash":               { input: 0.00,  output: 0.00,  label: "Gemini 1.5 Flash (Free)", tier: "fast" },
  "gemini-1.5-pro":                 { input: 0.00,  output: 0.00,  label: "Gemini 1.5 Pro (Free)", tier: "best" },
  "groq-llama-3.1-70b":             { input: 0.00,  output: 0.00,  label: "Llama 3.1 70B via Groq (Free)", tier: "best" },
  "groq-gemma-2-9b":                { input: 0.00,  output: 0.00,  label: "Gemma 2 9B via Groq (Free)", tier: "fast" },
  "openrouter-llama-3.1-8b":        { input: 0.00,  output: 0.00,  label: "Llama 3.1 8B via OpenRouter (Free)", tier: "fast" },
  "openrouter-qwen-2.5-72b":        { input: 0.00,  output: 0.00,  label: "Qwen 2.5 72B via OpenRouter (Free)", tier: "best" },
  "ollama-local":                   { input: 0.00,  output: 0.00,  label: "Ollama Local (Free)", tier: "balanced" },
};
export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const USD_TO_INR = 86;

export const TIER_META = {
  fast:     { label: "Fast",     color: "#10B981", note: "Lower quality, cheapest" },
  balanced: { label: "Balanced", color: "#6366F1", note: "Best cost-quality ratio" },
  best:     { label: "Best",     color: "#F59E0B", note: "Highest quality, slowest" },
};

export const createCostTracker = () => {
  const records = {};

  const record = (stageId, modelId, inputTokens, outputTokens) => {
    const pricing = MODEL_PRICING[modelId] || MODEL_PRICING[DEFAULT_MODEL];
    const inputCostUSD  = (inputTokens  * pricing.input)  / 1_000_000;
    const outputCostUSD = (outputTokens * pricing.output) / 1_000_000;
    const totalUSD      = inputCostUSD + outputCostUSD;
    const totalINR      = totalUSD * USD_TO_INR;

    records[stageId] = {
      stageId,
      modelId,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUSD: parseFloat(totalUSD.toFixed(6)),
      costINR: parseFloat(totalINR.toFixed(4)),
    };
    return records[stageId];
  };

  const summary = () => {
    const all = Object.values(records);
    const totalTokens  = all.reduce((s, r) => s + r.totalTokens, 0);
    const totalUSD     = all.reduce((s, r) => s + r.costUSD, 0);
    const totalINR     = totalUSD * USD_TO_INR;
    return {
      records,
      totalTokens,
      totalUSD:  parseFloat(totalUSD.toFixed(6)),
      totalINR:  parseFloat(totalINR.toFixed(4)),
    };
  };

  return { record, summary, records };
};

// Estimate token count from a string (~4 chars per token)
export const estimateTokens = (str) => Math.ceil((str || "").length / 4);

// THEME SYSTEM
export const makeTheme = (dark) => ({
  bg:     dark ? "#050508" : "#F8F8F7",
  paper:  dark ? "#0B0B0F" : "#FFFFFF",
  card:   dark ? "rgba(16, 16, 22, 0.75)" : "rgba(255, 255, 255, 0.9)",
  panel:  dark ? "#0D0D12" : "#FBFBFA",
  bdr:    dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
  bdr2:   dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
  txt:    dark ? "#F3F4F6" : "#111827",
  sub:    dark ? "#9CA3AF" : "#4B5563",
  dim:    dark ? "#4B5563" : "#9CA3AF",
  muted:  dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
  // semantic
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#EF4444",
  blue:   "#6366F1",
  teal:   "#14B8A6",
  pink:   "#EC4899",
  orange: "#F97316",
  purple: "#8B5CF6",
  cyan:   "#06B6D4",
  // code bg
  code:   dark ? "#020204" : "#F9F9FB",
});

export const EVAL_DATA = [
  // Real product prompts
  { type: "real", label: "CRM",         prompt: "CRM with contacts, deals pipeline, RBAC for admin/manager/sales, analytics, Stripe" },
  { type: "real", label: "E-Commerce",  prompt: "Online store: products, cart, Stripe checkout, order management, seller dashboard" },
  { type: "real", label: "LMS",         prompt: "Learning platform: courses, quizzes, progress tracking, instructor tools, subscriptions" },
  { type: "real", label: "Job Board",   prompt: "Job board: company profiles, listings, ATS, applicant tracking, paid posts" },
  { type: "real", label: "Healthcare",  prompt: "Clinic management: patients, appointments, doctor schedules, billing, prescriptions" },
  { type: "real", label: "Analytics",   prompt: "SaaS analytics: event tracking, funnels, cohorts, API keys, team workspaces, billing" },
  { type: "real", label: "Marketplace", prompt: "Two-sided marketplace: buyer/seller profiles, listings, escrow payments, reviews, disputes" },
  { type: "real", label: "Delivery",    prompt: "Food delivery: restaurants, menus, cart, real-time tracking, driver assignment, earnings" },
  { type: "real", label: "Social",      prompt: "Social platform: profiles, posts, follows, DMs, notifications, content moderation" },
  { type: "real", label: "Booking",     prompt: "Appointment booking: service providers, calendars, reminders, payments, reviews" },
  // Edge cases
  { type: "edge", label: "Vague",       prompt: "Build me an app for my business" },
  { type: "edge", label: "Conflict",    prompt: "Free app with payments. All users are admins but also need restrictions." },
  { type: "edge", label: "Minimal",     prompt: "Need login and a dashboard" },
  { type: "edge", label: "Overloaded",  prompt: "Simple todo but also CRM, billing, analytics, AI marketplace, blockchain" },
  { type: "edge", label: "Contradict",  prompt: "No login required but show each user their private data with HIPAA compliance" },
  { type: "edge", label: "One Word",    prompt: "CRM" },
  { type: "edge", label: "Foreign",     prompt: "Construire une application de gestion with users and orders" },
  { type: "edge", label: "Tech Only",   prompt: "PostgreSQL + FastAPI + React with JWT, Redis caching, WebSockets, Celery" },
  { type: "edge", label: "No Entity",   prompt: "Build a booking system where users can book things and get notified" },
  { type: "edge", label: "Scope Creep", prompt: "Simple todo app but needs CRM, billing, analytics, user management, API marketplace" },
];


