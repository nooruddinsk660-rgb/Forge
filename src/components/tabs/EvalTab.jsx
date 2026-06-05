import { useState } from "react";
import { makeTheme, EVAL_DATA } from "../../core/cost.js";

export const EvalTab = ({ dark, onSelectPreset }) => {
  const t = makeTheme(dark);
  const [filter, setFilter] = useState("all"); // all, real, edge

  const filteredData = EVAL_DATA.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div style={{
      maxWidth: 850, margin: "24px auto", padding: "0 20px",
      display: "flex", flexDirection: "column", gap: 20,
      animation: "fadeIn 0.3s ease", color: t.txt
    }}>
      {/* Tab Header & Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, color: t.dim, letterSpacing: "0.12em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
          }}>
            EVALUATION CORPUS presets
          </span>
          <span style={{ fontSize: 11, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Benchmark compile jobs against real app templates or boundary edge cases.
          </span>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all", label: "All Prompts" },
            { id: "real", label: "Real Products" },
            { id: "edge", label: "Edge Cases" }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              style={{
                padding: "6px 12px", borderRadius: 6, background: filter === btn.id ? t.blue : t.card,
                border: `1px solid ${filter === btn.id ? t.blue : t.bdr2}`,
                color: filter === btn.id ? "#FFF" : t.txt, fontSize: 10,
                cursor: "pointer", transition: "all 0.15s", fontFamily: "'Space Grotesk', sans-serif"
              }}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of presets */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16
      }}>
        {filteredData.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPreset(item.prompt)}
            style={{
              background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 12,
              padding: 16, cursor: "pointer", display: "flex", flexDirection: "column",
              gap: 8, transition: "all 0.2s", hover: { transform: "translateY(-2px)" }
            }}
            className="preset-card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 8, padding: "2px 6px", borderRadius: 4,
                background: item.type === "edge" ? `${t.amber}15` : `${t.blue}15`,
                color: item.type === "edge" ? t.amber : t.blue,
                fontWeight: 800, fontFamily: "'JetBrains Mono', monospace"
              }}>
                {item.type.toUpperCase()}
              </span>
            </div>
            <p style={{
              fontSize: 11, color: t.sub, margin: 0, lineHeight: 1.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              "{item.prompt}"
            </p>
            <span style={{
              fontSize: 8, color: t.dim, display: "flex",
              alignItems: "center", gap: 4, marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              🚀 Click to compile this prompt template
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default EvalTab;
