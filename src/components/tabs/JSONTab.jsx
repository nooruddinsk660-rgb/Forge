import { makeTheme, STAGES } from "../../core/cost.js";

export const JSONTab = ({ dark, stageData, jsonStage, setJsonStage, stageValid }) => {
  const t = makeTheme(dark);

  const selectedStageConfig = STAGES.find(s => s.id === jsonStage);
  const selectedStageData = stageData[jsonStage]?.data || { info: "Stage not compiled yet." };
  const validation = stageValid?.[jsonStage] || { valid: true, score: 100, errors: [] };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "200px 1fr", height: "100%",
      animation: "fadeIn 0.3s ease", color: t.txt
    }}>
      {/* Sidebar for choosing stage */}
      <div style={{
        borderRight: `1px solid ${t.bdr}`, padding: "16px 12px",
        display: "flex", flexDirection: "column", gap: 12, background: t.paper
      }}>
        <div style={{
          fontSize: 8, fontWeight: 800, color: t.dim, letterSpacing: "0.12em",
          textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
        }}>
          PIPELINE STAGE OUTS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STAGES.map(s => {
            const hasData = !!stageData[s.id];
            const active = jsonStage === s.id;
            return (
              <div
                key={s.id}
                onClick={() => hasData && setJsonStage(s.id)}
                style={{
                  padding: "8px 12px", borderRadius: 8,
                  cursor: hasData ? "pointer" : "default",
                  background: active ? `${s.color}18` : "transparent",
                  border: `1px solid ${active ? s.color + "30" : "transparent"}`,
                  color: active ? t.txt : hasData ? t.sub : t.dim,
                  display: "flex", alignItems: "center", justifyBetween: "space-between",
                  transition: "all 0.15s", opacity: hasData ? 1 : 0.45
                }}>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.name}
                </span>
                {hasData && (
                  <span style={{
                    fontSize: 8, marginLeft: "auto",
                    color: validation.valid ? t.green : t.amber
                  }}>
                    ●
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Viewer */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Stage Status Toolbar */}
        <div style={{
          padding: "10px 16px", borderBottom: `1px solid ${t.bdr}`,
          background: t.paper, display: "flex", justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: selectedStageConfig?.color || t.blue
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {selectedStageConfig?.name} Schema Outputs
            </span>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 4,
              background: validation.valid ? `${t.green}18` : `${t.amber}18`,
              color: validation.valid ? t.green : t.amber,
              fontWeight: 800, fontFamily: "'JetBrains Mono', monospace"
            }}>
              {validation.valid ? "SCHEMA VALID" : "VALIDATION DRIFT"}
            </span>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.sub }}>
              Score: {validation.score}/100
            </span>
          </div>
        </div>

        {/* Validation Errors Header (if invalid) */}
        {!validation.valid && validation.errors.length > 0 && (
          <div style={{
            background: `${t.amber}08`, borderBottom: `1px solid ${t.amber}20`,
            padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: t.amber, fontFamily: "'JetBrains Mono', monospace" }}>
              CRITICAL AST ERRORS RESOLVED IN CODEGEN:
            </span>
            {validation.errors.map((err, idx) => (
              <div key={idx} style={{ fontSize: 10, color: t.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                - {err.field}: {err.msg}
              </div>
            ))}
          </div>
        )}

        {/* JSON Code Viewer */}
        <div style={{
          flex: 1, overflow: "auto", background: t.code,
          padding: 20, margin: 0, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, lineHeight: 1.5, color: t.txt
        }}>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(selectedStageData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
export default JSONTab;
