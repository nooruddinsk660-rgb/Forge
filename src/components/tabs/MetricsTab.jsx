import { makeTheme, STAGES, MODEL_PRICING } from "../../core/cost.js";

// Helper components for visual data
const ProgressBar = ({ pct, color, height = 4 }) => (
  <div style={{ height, background: "rgba(128,128,128,0.12)", borderRadius: height, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${Math.max(0, Math.min(100, pct))}%`,
      background: color, borderRadius: height,
      transition: "width 1s ease"
    }} />
  </div>
);

export const MetricsTab = ({ dark, costSummary, metrics }) => {
  const t = makeTheme(dark);

  const records = costSummary?.records || {};
  const times = metrics?.times || {};

  // Find max cost for relative scaling
  const allINR = Object.values(records).map(r => r.costINR || 0.0001);
  const maxINR = Math.max(...allINR, 0.0001);

  return (
    <div style={{
      maxWidth: 800, margin: "24px auto", padding: "0 20px",
      display: "flex", flexDirection: "column", gap: 28,
      animation: "fadeIn 0.3s ease", color: t.txt
    }}>
      {/* Overview stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16
      }}>
        {[
          { label: "Token Consumption", val: costSummary?.totalTokens?.toLocaleString() || "0", sub: "Input + Output tokens", col: t.blue },
          { label: "Accumulated Cost (₹)", val: `₹${costSummary?.totalINR?.toFixed(4) || "0.0000"}`, sub: `Equals $${costSummary?.totalUSD?.toFixed(5) || "0.000"} USD`, col: t.green },
          { label: "Compiler Efficiency", val: `${metrics?.totalTime || "0"}ms`, sub: "Execution duration", col: t.purple }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 12,
            padding: 16, borderTop: `3px solid ${stat.col}`
          }}>
            <span style={{ fontSize: 9, color: t.dim, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              {stat.label}
            </span>
            <div style={{
              fontSize: 22, fontWeight: 900, color: stat.col,
              fontFamily: "'JetBrains Mono', monospace", margin: "6px 0"
            }}>
              {stat.val}
            </div>
            <span style={{ fontSize: 9, color: t.sub }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Stage Cost breakdown table */}
      <div style={{
        background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16,
        padding: 20, display: "flex", flexDirection: "column", gap: 16
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: t.dim, letterSpacing: "0.12em",
          textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
        }}>
          PIPELINE STAGE METRICS BREAKDOWN
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.bdr}`, color: t.dim }}>
                <th style={{ padding: "8px 12px 12px 12px", fontFamily: "'Space Grotesk', sans-serif" }}>STAGE</th>
                <th style={{ padding: "8px 12px 12px 12px", fontFamily: "'Space Grotesk', sans-serif" }}>TIME</th>
                <th style={{ padding: "8px 12px 12px 12px", fontFamily: "'Space Grotesk', sans-serif" }}>TOKENS (IN/OUT)</th>
                <th style={{ padding: "8px 12px 12px 12px", fontFamily: "'Space Grotesk', sans-serif" }}>COST (INR)</th>
                <th style={{ padding: "8px 12px 12px 12px", fontFamily: "'Space Grotesk', sans-serif", width: 120 }}>RATIO</th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map(s => {
                const rec = records[s.id] || {};
                const time = times[s.id] || 0;
                const costINR = rec.costINR || 0;
                const ratio = (costINR / maxINR) * 100;
                
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${t.bdr}`, opacity: rec.totalTokens ? 1 : 0.5 }}>
                    <td style={{ padding: 12, fontWeight: 700 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                        {s.name}
                      </div>
                    </td>
                    <td style={{ padding: 12, fontFamily: "'JetBrains Mono', monospace" }}>{time}ms</td>
                    <td style={{ padding: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                      {rec.totalTokens ? `${rec.inputTokens}/${rec.outputTokens}` : "—"}
                    </td>
                    <td style={{ padding: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                      {costINR ? `₹${costINR.toFixed(4)}` : "—"}
                    </td>
                    <td style={{ padding: 12 }}>
                      {costINR ? <ProgressBar pct={ratio} color={s.color} /> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Pricing rate card */}
      <div style={{
        background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16,
        padding: 20, display: "flex", flexDirection: "column", gap: 12
      }}>
        <div style={{
          fontSize: 9, fontWeight: 800, color: t.dim, letterSpacing: "0.1em",
          textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
        }}>
          ANTHROPIC API REFERENCE MODEL RATES
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Object.entries(MODEL_PRICING).map(([key, item]) => (
            <div key={key} style={{
              background: t.panel, border: `1px solid ${t.bdr}`, borderRadius: 10,
              padding: 12, display: "flex", flexDirection: "column", gap: 4
            }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{item.label}</span>
              <div style={{ fontSize: 9, color: t.sub, fontFamily: "'JetBrains Mono', monospace", display: "flex", flexDirection: "column" }}>
                <span>Input: ${item.input}/1M tkn</span>
                <span>Output: ${item.output}/1M tkn</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MetricsTab;
