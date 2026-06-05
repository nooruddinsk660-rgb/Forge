import { useEffect, useRef } from "react";

export const LogTerminal = ({ logs, t }) => {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div style={{
      height: 160, background: "#050508", borderTop: `1px solid ${t.bdr}`,
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace", position: "relative"
    }}>
      {/* Scanner laser overlay effect */}
      <div className="terminal-scanner" />

      {/* High-Tech Terminal Top Bar */}
      <div style={{
        padding: "6px 16px", borderBottom: `1px solid ${t.bdr}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 9, color: t.sub, background: "rgba(10, 10, 15, 0.9)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
      }}>
        {/* macOS Style Window controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#FF5F56", border: "1px solid #E0443E" }} />
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E", border: "1px solid #DEA123" }} />
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#27C93F", border: "1px solid #1AAB29" }} />
          </div>
          <span style={{ fontSize: 9, color: t.dim, letterSpacing: "0.08em", fontWeight: 700 }}>
            forge@compiler-host: ~/workspace/ir-logs
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 8, background: "rgba(16, 185, 129, 0.08)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
            ACTIVE FEED
          </span>
          <span style={{ color: t.dim }}>{logs.length} Lines</span>
        </div>
      </div>

      <div style={{
        flex: 1, padding: "12px 16px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 3,
        fontSize: 10, lineHeight: 1.5, color: t.txt
      }}>
        {logs.map((log, index) => {
          let color = "#E4E4E7"; // Off-white/zinc
          let background = "transparent";
          let padding = "0px";
          let borderRadius = "0px";
          let fontWeight = "500";
          
          if (log.includes("[ERROR]")) {
            color = "#EF4444";
            background = "rgba(239, 68, 68, 0.08)";
            padding = "2px 6px";
            borderRadius = "4px";
          } else if (log.includes("[WARN]")) {
            color = "#F59E0B";
            background = "rgba(245, 158, 11, 0.08)";
            padding = "2px 6px";
            borderRadius = "4px";
          } else if (log.includes("[SUCCESS]")) {
            color = "#10B981";
            background = "rgba(16, 185, 129, 0.08)";
            padding = "2px 6px";
            borderRadius = "4px";
            fontWeight = "700";
          } else if (log.includes("[STAGE]")) {
            color = "#6366F1";
            fontWeight = "800";
          } else if (log.includes("[LLM]")) {
            color = "#8B5CF6";
            fontWeight = "600";
          } else if (log.includes("[COMPILER]")) {
            color = "#8B5CF6";
          }


          return (
            <div key={index} style={{ color, background, padding, borderRadius, fontWeight, whiteSpace: "pre-wrap", display: "inline-block", alignSelf: "flex-start", width: "100%" }}>
              {log}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
export default LogTerminal;
