import { makeTheme } from "../../core/cost.js";

export const ReportTab = ({ dark, stageData, onApplyRepair }) => {
  const t = makeTheme(dark);
  
  const validatorData = stageData["validator"]?.data?.report || {
    status: "PASS",
    score: 100,
    checks: [],
    issues: [],
    warnings: [],
    passes: [],
    summary: { pass: 0, warn: 0, fail: 0, total: 0 }
  };

  const repairData = stageData["repair"]?.data || {};

  // Group items
  const passes = validatorData.passes || [];
  const warnings = validatorData.warnings || [];
  const issues = validatorData.issues || [];

  const totalChecks = passes.length + warnings.length + issues.length;

  return (
    <div style={{
      maxWidth: 800, margin: "24px auto", padding: "0 20px",
      display: "flex", flexDirection: "column", gap: 24,
      animation: "fadeIn 0.3s ease", color: t.txt
    }}>
      {/* Overview Card */}
      <div style={{
        background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16,
        padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, color: t.dim, letterSpacing: "0.12em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            CROSS-LAYER CONSISTENCY SCORE
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontSize: 32, fontWeight: 900,
              color: validatorData.score >= 80 ? t.green : validatorData.score >= 60 ? t.amber : t.red,
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              {validatorData.score}/100
            </span>
            <span style={{ fontSize: 12, color: t.sub }}>
              ({validatorData.status})
            </span>
          </div>
          <span style={{ fontSize: 11, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Total constraints tested: {totalChecks} | Verified: {passes.length} | Drifting: {issues.length + warnings.length}
          </span>
        </div>

        {/* Repair CTA if there are issues */}
        {(issues.length > 0 || warnings.length > 0) && (
          <button
            onClick={onApplyRepair}
            style={{
              padding: "12px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              color: "#FFF", fontSize: 12, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.25)",
              fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s"
            }}>
            🔧 Apply Surgical Repairs
          </button>
        )}
      </div>

      {/* Repairs Applied list if Verify stage ran */}
      {repairData.patches && repairData.patches.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: t.dim, letterSpacing: "0.1em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            APPLIED REPAIRS & VERIFICATION PATIENT RECORD
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {repairData.patches.map((patch) => (
              <div key={patch.id} style={{
                background: `${t.green}05`, border: `1px dashed ${t.green}40`,
                borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "start"
              }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.green, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Patch {patch.id}: {patch.action} (Resolves {patch.fixes})
                  </span>
                  <p style={{ fontSize: 10, color: t.sub, margin: 0, lineHeight: 1.4 }}>
                    {patch.desc} — {patch.after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues list (Failures) */}
      {issues.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: t.red, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            CRITICAL LAYER DRIFT ERRORS ({issues.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {issues.map((issue, idx) => (
              <div key={idx} style={{
                background: `${t.red}05`, border: `1px solid ${t.red}25`,
                borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "start"
              }}>
                <span style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 4,
                  background: `${t.red}20`, color: t.red, fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace", marginTop: 2
                }}>
                  {issue.layer}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>
                    {issue.msg}
                  </h4>
                  <span style={{ fontSize: 10, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>
                    Fix Hint: {issue.hint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings list */}
      {warnings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: t.amber, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            SCHEMA WARNINGS ({warnings.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {warnings.map((warn, idx) => (
              <div key={idx} style={{
                background: `${t.amber}05`, border: `1px solid ${t.amber}25`,
                borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "start"
              }}>
                <span style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 4,
                  background: `${t.amber}20`, color: t.amber, fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace", marginTop: 2
                }}>
                  {warn.layer}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>
                    {warn.msg}
                  </h4>
                  <span style={{ fontSize: 10, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>
                    Fix Hint: {warn.hint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passes list */}
      {passes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: t.green, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            VERIFIED STACK CONTRACTS ({passes.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {passes.map((pass, idx) => (
              <div key={idx} style={{
                background: `${t.green}04`, border: `1px solid ${t.bdr}`,
                borderRadius: 12, padding: 14, display: "flex", gap: 12, alignItems: "center"
              }}>
                <span style={{ color: t.green, fontSize: 12 }}>✓</span>
                <span style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 4,
                  background: `${t.green}12`, color: t.green, fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {pass.layer}
                </span>
                <span style={{ fontSize: 11, fontWeight: 500, color: t.sub }}>
                  {pass.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportTab;
