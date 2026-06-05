import { makeTheme } from "../core/cost.js";
import StageRail from "./ui/StageRail.jsx";
import LogTerminal from "./ui/LogTerminal.jsx";

// Import tabs
import PreviewTab from "./tabs/PreviewTab.jsx";
import ReportTab from "./tabs/ReportTab.jsx";
import JSONTab from "./tabs/JSONTab.jsx";
import MetricsTab from "./tabs/MetricsTab.jsx";
import EvalTab from "./tabs/EvalTab.jsx";

// Primitives used locally
const ScoreRing = ({ score, size = 64, t }) => {
  const r = (size - 6) / 2, C = 2 * Math.PI * r;
  const color = score >= 80 ? t.green : score >= 60 ? t.amber : t.red;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.bdr} strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={C} strokeDashoffset={C - (Math.max(0, Math.min(100, score)) / 100) * C}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>
          {score}
        </span>
      </div>
    </div>
  );
};

export const CompileScreen = ({
  dark,
  running,
  done,
  activeStage,
  activeTab,
  setActiveTab,
  jsonStage,
  setJsonStage,
  stageData,
  stageValid,
  logs,
  metrics,
  costSummary,
  onRecompile,
  onApplyRepair
}) => {
  const t = makeTheme(dark);

  // Find active stage config details
  const repairData = stageData["repair"]?.data || {};
  const finalMeta = repairData.final || {};
  const finalScore = finalMeta.score || 0;

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "preview":
        return <PreviewTab dark={dark} stageData={stageData} />;
      case "report":
        return <ReportTab dark={dark} stageData={stageData} onApplyRepair={onApplyRepair} />;
      case "json":
        return <JSONTab dark={dark} stageData={stageData} jsonStage={jsonStage} setJsonStage={setJsonStage} stageValid={stageValid} />;
      case "metrics":
        return <MetricsTab dark={dark} stageData={stageData} costSummary={costSummary} metrics={metrics} />;
      case "presets":
        return <EvalTab dark={dark} onSelectPreset={onRecompile} />;
      default:
        return <PreviewTab dark={dark} stageData={stageData} />;
    }
  };

  return (
    <div style={{
      display: "flex", flex: 1, height: "calc(100vh - 54px)", overflow: "hidden",
      background: dark ? "#050508" : "#FBFBFA", color: t.txt
    }}>
      {/* Left Sidebar */}
      <StageRail
        stageData={stageData}
        stageValid={stageValid}
        activeStage={activeStage}
        metrics={metrics}
        done={done}
        setActiveTab={setActiveTab}
        setJsonStage={setJsonStage}
        t={t}
        costSummary={costSummary}
      />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Background Ambient Blobs */}
        <div className="ambient-glow-blob blob-violet" style={{ top: "15%", left: "15%", width: 320, height: 320 }} />
        <div className="ambient-glow-blob blob-rose" style={{ bottom: "15%", right: "15%", width: 350, height: 350 }} />

        {/* Compiler Running view */}
        {running && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 36, padding: 32,
            background: dark ? "rgba(6,6,9,0.3)" : "#FAFAF9",
            animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative", zIndex: 1
          }}>
            {/* Split layout: center container */}
            <div style={{
              display: "flex", gap: 48, alignItems: "center", justifyContent: "center",
              maxWidth: 920, width: "100%", flexWrap: "wrap"
            }}>
              {/* Left Side: Circular pulse gauge & current status */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 24, flex: 1, minWidth: 280, textAlign: "center"
              }}>
                <div className="breathing-pulse-container" style={{ width: 130, height: 130 }}>
                  <div className="breathing-pulse-outer" style={{
                    animation: "compilerPulse 1.4s infinite ease-in-out",
                    background: "rgba(99, 102, 241, 0.2)"
                  }} />
                  <div className="breathing-pulse-inner" style={{ width: 80, height: 80, background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 100%)", boxShadow: "0 0 25px rgba(99, 102, 241, 0.45)" }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: "#FFF", fontFamily: "'Space Grotesk', sans-serif" }}>F</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 900, color: t.blue, letterSpacing: "0.25em",
                    textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
                    background: `${t.blue}12`, border: `1px solid ${t.blue}25`,
                    padding: "4px 14px", borderRadius: 6, alignSelf: "center"
                  }}>
                    COMPILING INSTANCE SCHEMA
                  </span>
                  <h3 style={{
                    fontSize: 24, fontWeight: 900, margin: "6px 0 0 0",
                    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em",
                    background: "linear-gradient(135deg, #FFF 0%, rgba(255,255,255,0.7) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: dark ? "transparent" : "inherit"
                  }}>
                    Active Pass: {activeStage ? activeStage.toUpperCase() : "LEXER"}
                  </h3>
                  <p style={{
                    fontSize: 12, color: t.sub, lineHeight: 1.6,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0
                  }}>
                    Synthesizing code representations, binding endpoint validation targets, and verifying contract schemas.
                  </p>
                </div>

                <div style={{ width: "100%", maxWidth: 260, height: 4, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 2, overflow: "hidden", border: `1px solid ${t.bdr2}` }}>
                  <div className="compiler-loading-bar" />
                </div>
              </div>

              {/* Right Side: Active Pipeline Stepper */}
              <div className={dark ? "glass-card" : "glass-card-light"} style={{
                padding: "28px 32px", flex: 1.1, minWidth: 340, display: "flex", flexDirection: "column", gap: 18,
                border: `1.5px solid ${t.bdr2}`, background: dark ? "rgba(10, 10, 15, 0.45)" : "#FFF",
                boxSizing: "border-box", borderRadius: 16
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 900, color: t.dim, letterSpacing: "0.12em",
                  textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
                  borderBottom: `1px solid ${t.bdr2}`, paddingBottom: 12, marginBottom: 4
                }}>
                  COMPILER CORE STAGES
                </span>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(() => {
                    const COMPILER_STAGES = [
                      { id: "lexer", label: "AST Lexer & Tokenizer" },
                      { id: "parser", label: "IR Entity Graph Linker" },
                      { id: "validator", label: "Schema Constraints Validator" },
                      { id: "repair", label: "Surgical Drift Repair Engine" },
                      { id: "verify", label: "Contract Consistency Verifier" },
                      { id: "codegen", label: "Source Code Generation Stack" }
                    ];
                    const activeIndex = COMPILER_STAGES.findIndex(s => s.id === activeStage);
                    
                    return COMPILER_STAGES.map((stage, idx) => {
                      const isCompleted = idx < activeIndex;
                      const isActive = idx === activeIndex || (activeIndex === -1 && idx === 0);
                      
                      return (
                        <div
                          key={stage.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "10px 14px", borderRadius: 10,
                            border: `1.5px solid ${isActive ? `${t.blue}30` : "transparent"}`,
                            background: isActive ? `${t.blue}08` : "transparent",
                            transition: "all 0.3s ease",
                            position: "relative",
                            paddingLeft: 38
                          }}
                        >
                          {/* Connector line */}
                          {idx < COMPILER_STAGES.length - 1 && (
                            <div style={{
                              position: "absolute", left: 21, top: 32, width: 2, height: 24,
                              background: isCompleted ? "#10B981" : "rgba(255,255,255,0.06)",
                              zIndex: 1
                            }} />
                          )}
                          {/* Circle Badge */}
                          <div style={{
                            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                            width: 20, height: 20, borderRadius: "50%",
                            border: `1.5px solid ${isCompleted ? "#10B981" : (isActive ? t.blue : t.dim)}`,
                            background: isCompleted ? "#10B981" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 900, color: isCompleted || isActive ? "#FFF" : t.sub,
                            zIndex: 2,
                            boxShadow: isActive ? "0 0 10px rgba(99,102,241,0.3)" : "none"
                          }}>
                            {isCompleted ? "✓" : ""}
                          </div>
                          {/* Text */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <span style={{
                              fontSize: 12, fontWeight: isActive ? 800 : 600,
                              color: isActive ? t.txt : (isCompleted ? t.txt : t.sub),
                              fontFamily: "'Space Grotesk', sans-serif",
                              letterSpacing: "0.01em"
                            }}>
                              {stage.label}
                            </span>
                            {isActive && (
                              <span style={{ fontSize: 8, color: t.blue, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
                                EXECUTING STAGE ANALYSIS PASS...
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Live Console Logs — rolling 4-line window */}
            <div style={{
              background: "rgba(5, 5, 8, 0.90)", border: `1.5px solid ${t.bdr2}`, borderRadius: 12,
              padding: "14px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              maxWidth: 700, width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)"
            }}>
              {/* ticker header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, borderBottom: `1px solid ${t.bdr2}`, paddingBottom: 8 }}>
                <span style={{ color: "#EF4444", fontWeight: 900, animation: "blink 1.2s infinite" }}>●</span>
                <span style={{ color: t.dim, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em" }}>[LIVE RUNSTREAM]</span>
                <span style={{ color: t.sub, fontSize: 9, marginLeft: "auto" }}>{logs.length} events</span>
              </div>
              {/* last 4 log lines */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(logs.length === 0 ? ["Initializing AST token stream..."] : logs.slice(-4)).map((line, i, arr) => {
                  const isLatest = i === arr.length - 1;
                  const color = line.includes("[ERROR]") ? "#EF4444"
                              : line.includes("[WARN]")  ? "#F59E0B"
                              : line.includes("[SUCCESS]") ? "#10B981"
                              : line.includes("[STAGE]") ? "#6366F1"
                              : line.includes("[LLM]")   ? "#8B5CF6"
                              : "#A1A1AA";
                  return (
                    <div key={i} style={{
                      color: isLatest ? "#E4E4E7" : color,
                      opacity: isLatest ? 1 : 0.45 + (i / arr.length) * 0.4,
                      fontSize: isLatest ? 11 : 10,
                      fontWeight: isLatest ? 700 : 400,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      <span style={{ color, flexShrink: 0 }}>›</span>
                      {line}
                      {isLatest && (
                        <span style={{ display: "inline-block", width: 6, height: 13, background: "#6366F1", marginLeft: 2, animation: "blink 0.9s infinite", verticalAlign: "middle", borderRadius: 1 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {/* Compiler Finished view */}
        {done && !running && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
            {/* Top Workspace Header */}
            <div style={{
              padding: "20px 28px", background: dark ? "rgba(10, 10, 15, 0.6)" : "rgba(255, 255, 255, 0.8)",
              borderBottom: `1px solid ${t.bdr2}`,
              display: "flex", gap: 24, alignItems: "center", justifyContent: "space-between",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <ScoreRing score={finalScore} t={t} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 style={{
                      fontSize: 20, fontWeight: 900, margin: 0,
                      fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em"
                    }}>
                      {finalMeta.app_name || "App Schema Layout"}
                    </h2>
                    <span style={{
                      fontSize: 8, padding: "2px 8px", borderRadius: 4,
                      background: finalMeta.status === "PRODUCTION_READY" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                      color: finalMeta.status === "PRODUCTION_READY" ? "#10B981" : "#F59E0B",
                      border: `1px solid ${finalMeta.status === "PRODUCTION_READY" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                      fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em"
                    }}>
                      {finalMeta.status || "COMPILED"}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                    Stack Summary: <strong style={{ color: t.txt }}>{finalMeta.stack_summary || "React + NodeJS + PostgreSQL"}</strong>
                  </span>
                </div>
              </div>

              {/* Quick stats grid */}
              <div style={{ display: "flex", gap: 24, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.bdr2}` }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    TOTAL COST
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#6366F1", fontFamily: "'JetBrains Mono', monospace" }}>
                    ₹{costSummary?.totalINR?.toFixed(3)}
                  </span>
                </div>
                <div style={{ width: 1, height: 24, background: t.bdr2, alignSelf: "center" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    TOKENS
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.txt, fontFamily: "'JetBrains Mono', monospace" }}>
                    {costSummary?.totalTokens?.toLocaleString()}
                  </span>
                </div>
                <div style={{ width: 1, height: 24, background: t.bdr2, alignSelf: "center" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    LATENCY
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.txt, fontFamily: "'JetBrains Mono', monospace" }}>
                    {metrics?.totalTime}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div style={{
              display: "flex", background: dark ? "rgba(10, 10, 15, 0.85)" : "#FFF", borderBottom: `1px solid ${t.bdr}`,
              padding: "0 20px", height: 44, alignItems: "center", flexShrink: 0, gap: 6,
              backdropFilter: "blur(10px)"
            }}>
              {[
                { id: "preview", label: "Generated Code" },
                { id: "report",  label: "Validator Checks" },
                { id: "metrics", label: "Costs & Analytics" },
                { id: "json",    label: "Raw Stage JSON" },
                { id: "presets", label: "Evaluation Presets" }
              ].map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${active ? "tab-btn-active" : ""}`}
                    style={{
                      height: "100%", padding: "0 18px", background: "transparent",
                      border: "none",
                      color: active ? t.txt : t.sub, cursor: "pointer",
                      fontSize: 11, fontWeight: 800, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em"
                    }}>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Panel viewport */}
            <div style={{ flex: 1, overflowY: "auto", background: t.bg }}>
              {renderTabContent()}
            </div>
          </div>
        )}
        {/* Live Logs Bottom terminal */}
        <LogTerminal logs={logs} t={t} />
      </div>
    </div>
  );
};

export default CompileScreen;
