import { STAGES } from "../../core/cost.js";

const Dot = ({ color, pulse, size = 6 }) => (
  <span style={{
    display: "inline-block", width: size, height: size, borderRadius: "50%",
    background: color, flexShrink: 0,
    animation: pulse ? "blink 1s ease-in-out infinite" : undefined
  }} />
);

export const StageRail = ({ stageData, stageValid, activeStage, metrics, done, setActiveTab, setJsonStage, t, costSummary }) => {
  const meta = stageData["repair"]?.data?.final?.meta || {};
  const score = stageData["repair"]?.data?.final?.score || 0;

  return (
    <div style={{
      width: 196, flexShrink: 0, borderRight: `1px solid ${t.bdr}`,
      background: t.paper, display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Stage list */}
      <div style={{
        padding: "12px 12px 6px",
        fontSize: 8, fontFamily: "'JetBrains Mono',monospace",
        letterSpacing: "0.14em", color: t.dim, textTransform: "uppercase"
      }}>PIPELINE</div>

      <div style={{ flex: 1, overflowY: "auto", padding: "2px 8px 8px" }}>
        {STAGES.map(s => {
          const sd = stageData[s.id];
          const isR = activeStage === s.id;
          const isD = sd?.status === "done";
          const isE = sd?.status === "error";
          const valid = stageValid?.[s.id];
          const cost = costSummary?.records?.[s.id];
          return (
            <div key={s.id}
              onClick={() => isD && (setActiveTab("json"), setJsonStage(s.id))}
              style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                borderRadius: 6, marginBottom: 4,
                background: isR ? s.darkBg : "transparent",
                border: `1px solid ${isR ? s.color + "55" : isD ? t.bdr : "transparent"}`,
                cursor: isD ? "pointer" : "default", transition: "all 0.15s"
              }}>

              {/* Status badge */}
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                background: isD ? `${s.color}18` : isR ? `${s.color}28` : t.muted,
                border: `1px solid ${isD ? s.color + "44" : isR ? s.color : isE ? t.red + "44" : t.bdr}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
                color: isD ? s.color : isR ? s.color : isE ? t.red : t.dim,
                transition: "all 0.25s", marginTop: 1
              }}>
                {isR ? <span style={{ animation: "blink 0.7s infinite" }}>◈</span>
                  : isD ? "✓" : isE ? "✗" : s.n}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: isD ? t.txt : isR ? t.txt : t.sub,
                  letterSpacing: "-0.01em"
                }}>{s.name}</div>
                {/* Validation score */}
                {isD && valid && (
                  <div style={{
                    fontSize: 8, fontFamily: "'JetBrains Mono',monospace",
                    color: valid.valid ? t.green : t.amber, marginTop: 1
                  }}>
                    {valid.valid ? `✓ valid ${valid.score}/100` : `⚠ ${valid.errors.length} err`}
                  </div>
                )}
                {/* Cost in ₹ */}
                {isD && cost && (
                  <div style={{
                    fontSize: 8, fontFamily: "'JetBrains Mono',monospace",
                    color: t.dim, marginTop: 1
                  }}>₹{cost.costINR.toFixed(3)}</div>
                )}
                {/* Time */}
                {isD && metrics?.times?.[s.id] && (
                  <div style={{
                    fontSize: 8, fontFamily: "'JetBrains Mono',monospace",
                    color: t.dim
                  }}>{metrics.times[s.id]}ms</div>
                )}
              </div>

              {isR && <Dot color={s.color} pulse size={5} />}
            </div>
          );
        })}
      </div>

      {/* Quick stats footer */}
      {done && (
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${t.bdr}`, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { l: "Endpoints", v: meta.endpoints || "—", c: t.blue },
            { l: "Pages",     v: meta.pages || "—",     c: t.amber },
            { l: "Tables",    v: meta.tables || "—",    c: t.teal },
            { l: "Score",     v: `${score}/100`,        c: score >= 80 ? t.green : t.amber }
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: t.dim, fontFamily: "'Space Grotesk',sans-serif" }}>{item.l}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: item.c, fontFamily: "'JetBrains Mono',monospace" }}>{item.v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default StageRail;
