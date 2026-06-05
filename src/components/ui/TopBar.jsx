import { makeTheme } from "../../core/cost.js";

// UI primitives used here
const Dot = ({ color, pulse, size = 6 }) => (
  <span style={{
    display: "inline-block", width: size, height: size, borderRadius: "50%",
    background: color, flexShrink: 0,
    animation: pulse ? "blink 1s ease-in-out infinite" : undefined
  }} />
);

const Tag = ({ label, color, size = "sm" }) => {
  const fs = size === "xs" ? 8 : 9;
  return (
    <span style={{
      fontSize: fs, padding: "1px 6px", borderRadius: 3,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
      letterSpacing: "0.05em", display: "inline-flex", alignItems: "center",
      whiteSpace: "nowrap"
    }}>{label}</span>
  );
};

export const TopBar = ({ dark, setDark, screen, resetAll, running, done, appName, score }) => {
  const t = makeTheme(dark);
  return (
    <div style={{
      height: 54, background: dark ? "rgba(6, 6, 9, 0.85)" : "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",
      borderBottom: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, zIndex: 50,
      position: "relative",
      boxShadow: dark ? "0 4px 30px rgba(0, 0, 0, 0.4)" : "0 4px 30px rgba(0, 0, 0, 0.02)"
    }}>
      {/* Dynamic line glow */}
      <div style={{
        position: "absolute", bottom: -1, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.25) 15%, rgba(255, 26, 74, 0.25) 85%, transparent)"
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {screen !== "home" && (
          <button onClick={resetAll}
            title="Return to Dashboard"
            style={{
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${t.bdr2}`, color: t.txt,
              borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease",
              fontFamily: "monospace", fontSize: 13, marginRight: 4
            }}
            className="tab-btn"
          >
            ←
          </button>
        )}
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 13, color: "#FFF",
          boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          F
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{
            fontWeight: 900, fontSize: 13, letterSpacing: "0.05em", color: t.txt,
            fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6
          }}>
            FORGE
            <span style={{ fontSize: 9, fontWeight: 500, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>
              v4.0
            </span>
          </span>
        </div>

        <Tag label="IR-PIPELINE" color={t.blue} size="xs" />

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <Dot color="#10B981" pulse size={5} />
          <span style={{ fontSize: 9, color: t.dim, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
            ENGINE ONLINE
          </span>
        </div>

        {appName && screen === "compile" && (
          <>
            <div style={{ width: 1, height: 16, background: t.bdr2, margin: "0 4px" }} />
            <span style={{
              fontSize: 11, color: t.sub, maxWidth: 250, fontWeight: 700,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "'Plus Jakarta Sans', sans-serif", background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              padding: "3px 10px", borderRadius: 6, border: `1px solid ${t.bdr2}`
            }}>
              PROJECT: {appName.toUpperCase()}
            </span>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {running && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 8,
            background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.25)"
          }}>
            <div className="spinner-icon" />
            <span style={{ fontSize: 9, color: "#6366F1", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, letterSpacing: "0.08em" }}>
              COMPILING ENGINE PASS...
            </span>
          </div>
        )}
        {done && !running && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 8,
            background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)"
          }}>
            <Dot color="#10B981" size={5} />
            <span style={{ fontSize: 9, color: "#10B981", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, letterSpacing: "0.08em" }}>
              PASS // SCORE {score || 100}/100
            </span>
          </div>
        )}

        <button onClick={() => setDark(!dark)}
          style={{
            padding: "6px 14px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "#FFF",
            border: `1px solid ${t.bdr2}`, color: t.txt, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
            fontFamily: "'Space Grotesk', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#6366F1";
            e.currentTarget.style.backgroundColor = dark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.bdr2;
            e.currentTarget.style.backgroundColor = dark ? "rgba(255,255,255,0.03)" : "#FFF";
          }}
        >
          {dark ? "☀ LIGHT MODE" : "🌙 DARK MODE"}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
