/* global process */
import { useState } from "react";
import { makeTheme, MODEL_PRICING, TIER_META, EVAL_DATA } from "../core/cost.js";

const hasAnthropicKey = (credentials) => {
  return !!(
    credentials.apiKey ||
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY)) ||
    (typeof process !== "undefined" && process.env && (process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY))
  );
};

const hasGeminiKey = (credentials) => {
  return !!(
    credentials.geminiApiKey ||
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY)) ||
    (typeof process !== "undefined" && process.env && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY))
  );
};

const hasGroqKey = (credentials) => {
  return !!(
    credentials.groqApiKey ||
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY)) ||
    (typeof process !== "undefined" && process.env && (process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY))
  );
};

const hasOpenRouterKey = (credentials) => {
  return !!(
    credentials.openRouterApiKey ||
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY)) ||
    (typeof process !== "undefined" && process.env && (process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY))
  );
};

const hasAnyKey = (credentials) => {
  return hasAnthropicKey(credentials) || hasGeminiKey(credentials) || hasGroqKey(credentials) || hasOpenRouterKey(credentials);
};

export const HomeScreen = ({
  dark,
  prompt,
  setPrompt,
  modelId,
  setModelId,
  options,
  setOptions,
  credentials,
  updateCredential,
  onCompile
}) => {
  const t = makeTheme(dark);
  const [presetTab, setPresetTab] = useState("real"); // real, edge
  const [modelTab, setModelTab] = useState("free"); // paid, free, local
  const [activeStep, setActiveStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectPreset = (p) => {
    setPrompt(p);
    setMaxStepReached(prev => Math.max(prev, 2));
    setActiveStep(2);
  };

  const modelGroups = [
    {
      title: "Paid Cloud Tiers",
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-6"]
    },
    {
      title: "Free Cloud Tiers",
      models: [
        "gemini-1.5-flash", "gemini-1.5-pro",
        "groq-llama-3.1-70b", "groq-gemma-2-9b",
        "openrouter-llama-3.1-8b", "openrouter-qwen-2.5-72b"
      ]
    },
    {
      title: "Local Offline Tiers",
      models: ["ollama-local"]
    }
  ];

  const getModelGlowColor = (key) => {
    if (key.includes("claude")) return "#F59E0B"; // gold/orange
    if (key.includes("gemini")) return "#6366F1"; // indigo
    if (key.includes("groq")) return "#EC4899"; // pink/rose
    if (key.includes("openrouter")) return "#14B8A6"; // teal
    return "#06B6D4"; // cyan
  };

  const filteredPresets = EVAL_DATA.filter(item => item.type === presetTab);

  const characterCount = prompt.length;
  const wordCount = prompt.trim() === "" ? 0 : prompt.trim().split(/\s+/).length;

  const canGoToStep = (targetStep) => {
    if (targetStep === 1) return true;
    if (targetStep >= 2 && !prompt.trim()) return false;
    return targetStep <= maxStepReached;
  };

  const getOptionsSummary = () => {
    const activeOpts = [];
    if (options.enableValidator) activeOpts.push("Validation");
    if (options.enableRepair) activeOpts.push("Surgical Repair");
    if (options.enableDiff) activeOpts.push("Diff Mode");
    if (options.injectValidationErrors) activeOpts.push("Drift Sim");
    return activeOpts.length > 0 ? activeOpts.join(" | ") : "No features active";
  };

  return (
    <div className="cyber-grid-bg" style={{
      minHeight: "100%", width: "100%", boxSizing: "border-box",
      padding: "50px 24px", color: t.txt, animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      position: "relative", overflow: "hidden", background: dark ? "#050508" : "#FBFBFA"
    }}>
      {/* Background Ambient Blobs */}
      <div className="ambient-glow-blob blob-violet" style={{ top: "5%", left: "10%", width: 400, height: 400 }} />
      <div className="ambient-glow-blob blob-rose" style={{ bottom: "10%", right: "5%", width: 500, height: 500 }} />
      <div className="ambient-glow-blob blob-teal" style={{ top: "35%", right: "20%", width: 300, height: 300 }} />

      <div style={{ maxWidth: 850, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36, position: "relative", zIndex: 1 }}>
        
        {/* Editorial Header Splash & System Stats Panel */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: `4px solid #FF1A4A`, paddingLeft: 24, flex: 2, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 900, color: "#FF1A4A", letterSpacing: "0.25em",
                fontFamily: "'JetBrains Mono', monospace", background: "rgba(255, 26, 74, 0.08)",
                padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255, 26, 74, 0.15)"
              }}>
                FORGE COMPILER WORKSPACE V4.0
              </span>
            </div>
            <h1 style={{
              fontSize: 44, fontWeight: 900, margin: 0,
              background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 50%, #10B981 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", lineHeight: 1.1
            }}>
              Natural Language → App Compiler
            </h1>
            <p style={{
              fontSize: 14, color: t.sub, maxWidth: 650, margin: "6px 0 0 0",
              lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              Convert natural language app descriptions into verified IR schemas, coordinate front-to-back layers, and auto-patch architectural drift.
            </p>
          </div>

          {/* High-Tech Uptime Panel */}
          <div className={dark ? "glass-card" : "glass-card-light"} style={{
            flex: 1.2, minWidth: 240, padding: 16, borderRadius: 12, border: `1px solid ${t.bdr2}`,
            display: "flex", flexDirection: "column", gap: 10, background: dark ? "rgba(10, 10, 15, 0.5)" : "#FFF",
            boxSizing: "border-box"
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: t.dim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
              COMPILER SYSTEM STATS
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: t.sub }}>Pipeline Core:</span>
                <span style={{ fontWeight: 800, color: "#10B981" }}>ONLINE (100% OK)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: t.sub }}>Drift Auto-Repair:</span>
                <span style={{ fontWeight: 800, color: t.txt }}>INTEGRATED</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: t.sub }}>Target Framework:</span>
                <span style={{ fontWeight: 800, color: "#6366F1", fontFamily: "'JetBrains Mono', monospace" }}>JSON IR-SPEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Progression Stepper */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative" }}>
          
          {/* STEP 1: SPECIFICATION INPUT */}
          <div style={{ position: "relative" }}>
            {activeStep !== 1 && prompt.trim() && (
              <div className="stepper-timeline-connector stepper-timeline-connector-gradient" />
            )}
            {activeStep === 1 && (
              <div className="stepper-timeline-connector" style={{
                background: "linear-gradient(to bottom, rgba(99,102,241,0.2), transparent)"
              }} />
            )}
            
            <div className={activeStep === 1 ? (dark ? "glass-card active-wizard-step" : "glass-card-light active-wizard-step-light") : (dark ? "glass-card" : "glass-card-light")} style={{
              border: `1px solid ${activeStep === 1 ? "#6366F1" : (prompt.trim() ? "rgba(16, 185, 129, 0.3)" : t.bdr2)}`,
              boxShadow: activeStep === 1 ? (dark ? "0 0 50px rgba(99, 102, 241, 0.08)" : "0 0 50px rgba(99, 102, 241, 0.02)") : "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              zIndex: 2
            }}>
              {/* Header */}
              <div
                onClick={() => {
                  if (canGoToStep(1)) {
                    setActiveStep(1);
                  }
                }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "22px 28px", cursor: canGoToStep(1) ? "pointer" : "default",
                  borderBottom: activeStep === 1 ? `1px solid ${t.bdr2}` : "none",
                  background: activeStep === 1 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.008)") : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={activeStep === 1 ? "stepper-halo-active" : ""} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: (prompt.trim() && activeStep !== 1) ? "#10B981" : (activeStep === 1 ? "#6366F1" : "transparent"),
                    border: `1.5px solid ${(prompt.trim() && activeStep !== 1) ? "#10B981" : (activeStep === 1 ? "#6366F1" : t.dim)}`,
                    color: (prompt.trim() && activeStep !== 1) || activeStep === 1 ? "#FFF" : t.sub,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                    transition: "all 0.3s ease"
                  }}>
                    {(prompt.trim() && activeStep !== 1) ? "✓" : "01"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, color: activeStep === 1 ? t.txt : t.sub,
                      letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                      01 // SYSTEM FUNCTIONAL SPECIFICATION
                      {activeStep === 1 && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1", animation: "blink 1s infinite" }} />}
                    </span>
                    {activeStep !== 1 && (
                      <span style={{ fontSize: 10, color: t.dim, fontFamily: "'Plus Jakarta Sans', sans-serif", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 500 }}>
                        {prompt.trim() ? `"${prompt.substring(0, 75)}${prompt.length > 75 ? '...' : ''}"` : "Empty specification details..."}
                      </span>
                    )}
                  </div>
                </div>
                {activeStep !== 1 && prompt.trim() && (
                  <button style={{
                    background: dark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    border: `1px solid rgba(99, 102, 241, 0.3)`, color: "#6366F1", fontSize: 9,
                    fontWeight: 900, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                    padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em"
                  }}>
                    MODIFY SPEC
                  </button>
                )}
              </div>

              {/* Body */}
              {activeStep === 1 && (
                <div style={{
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20,
                  animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Describe modular entities, authorization roles, payment logic, and UI elements.
                    </span>
                    <div style={{ fontSize: 9, color: t.dim, fontFamily: "'JetBrains Mono', monospace", display: "flex", gap: 12 }}>
                      <span style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", padding: "2px 6px", borderRadius: 4 }}>WORDS: {wordCount}</span>
                      <span style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", padding: "2px 6px", borderRadius: 4 }}>CHARS: {characterCount}</span>
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. E-learning portal with student/instructor roles, Stripe paywalled courses, quiz validation triggers, and analytics dashboard..."
                      className={dark ? "cyber-input" : "cyber-input-light"}
                      style={{
                        width: "100%", height: 180, background: dark ? "rgba(0,0,0,0.5)" : "#FBFBFA",
                        border: `1px solid ${t.bdr2}`, borderRadius: 12, padding: 18,
                        fontSize: 14, lineHeight: 1.6, color: t.txt, resize: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <div style={{
                      position: "absolute", bottom: 12, right: 12, pointerEvents: "none",
                      fontSize: 8, fontWeight: 900, color: prompt.trim().length > 15 ? "#10B981" : "#F59E0B",
                      background: prompt.trim().length > 15 ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
                      border: `1px solid ${prompt.trim().length > 15 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
                      padding: "3px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.05em"
                    }}>
                      {prompt.trim().length > 15 ? "✓ VALID LENGTH" : "AWAITING MIN SPEC"}
                    </div>
                  </div>

                  {/* Presets Library */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{
                        fontSize: 9, fontWeight: 900, color: t.dim, letterSpacing: "0.12em",
                        textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        PRE-CONFIGURED BLUEPRINTS
                      </div>
                      <div style={{ display: "flex", gap: 4, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", padding: 4, borderRadius: 8 }}>
                        <button
                          onClick={() => setPresetTab("real")}
                          style={{
                            background: presetTab === "real" ? (dark ? "rgba(255,255,255,0.06)" : "#FFF") : "transparent",
                            border: "none", color: presetTab === "real" ? t.txt : t.sub,
                            fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6,
                            cursor: "pointer", transition: "all 0.15s"
                          }}>
                          SaaS Systems
                        </button>
                        <button
                          onClick={() => setPresetTab("edge")}
                          style={{
                            background: presetTab === "edge" ? (dark ? "rgba(255,255,255,0.06)" : "#FFF") : "transparent",
                            border: "none", color: presetTab === "edge" ? t.txt : t.sub,
                            fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6,
                            cursor: "pointer", transition: "all 0.15s"
                          }}>
                          Edge Mismatches
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
                      gap: 10, maxHeight: 160, overflowY: "auto", paddingRight: 4
                    }}>
                      {filteredPresets.map((item, idx) => {
                        const active = prompt === item.prompt;
                        const borderColor = active ? "#FF1A4A" : t.bdr2;
                        const shadow = active ? "0 0 15px rgba(255, 26, 74, 0.12)" : "none";
                        const leftStripColor = presetTab === "real" ? "#6366F1" : "#FF1A4A";
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectPreset(item.prompt)}
                            className={`preset-card-hover`}
                            style={{
                              padding: "12px 14px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.01)" : "#FFF",
                              border: `1px solid ${borderColor}`, color: t.txt,
                              fontSize: 11, cursor: "pointer", display: "flex", flexDirection: "column",
                              gap: 6, justifyContent: "space-between", minHeight: 68, boxSizing: "border-box",
                              boxShadow: shadow, position: "relative", paddingLeft: 18, overflow: "hidden"
                            }}>
                            {/* Visual indicator tag line */}
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: leftStripColor }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 800, fontSize: 11, color: active ? leftStripColor : t.txt }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>[LOAD]</span>
                            </div>
                            <span style={{
                              fontSize: 8, color: t.sub, whiteSpace: "nowrap", overflow: "hidden",
                              textOverflow: "ellipsis", fontFamily: "'JetBrains Mono', monospace"
                            }}>
                              {item.prompt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Nav */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <button
                      onClick={() => {
                        setMaxStepReached(prev => Math.max(prev, 2));
                        setActiveStep(2);
                      }}
                      disabled={!prompt.trim()}
                      style={{
                        background: !prompt.trim() ? t.muted : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                        color: !prompt.trim() ? t.dim : "#FFF",
                        border: "none", padding: "12px 28px", borderRadius: 10,
                        fontSize: 11, fontWeight: 900, cursor: !prompt.trim() ? "default" : "pointer",
                        boxShadow: !prompt.trim() ? "none" : "0 4px 15px rgba(99, 102, 241, 0.25)",
                        transition: "all 0.25s", fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.08em", textTransform: "uppercase"
                      }}>
                      Confirm & Select Model →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: MODEL SELECTION */}
          <div style={{ position: "relative" }}>
            {activeStep !== 2 && maxStepReached >= 2 && (
              <div className="stepper-timeline-connector stepper-timeline-connector-gradient" />
            )}
            {activeStep === 2 && (
              <div className="stepper-timeline-connector" style={{
                background: "linear-gradient(to bottom, rgba(99,102,241,0.2), transparent)"
              }} />
            )}
            
            <div className={activeStep === 2 ? (dark ? "glass-card active-wizard-step" : "glass-card-light active-wizard-step-light") : (dark ? "glass-card" : "glass-card-light")} style={{
              border: `1px solid ${activeStep === 2 ? "#6366F1" : (maxStepReached >= 2 ? "rgba(16, 185, 129, 0.3)" : t.bdr2)}`,
              boxShadow: activeStep === 2 ? (dark ? "0 0 50px rgba(99, 102, 241, 0.08)" : "0 0 50px rgba(99, 102, 241, 0.02)") : "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: 16,
              overflow: "hidden",
              opacity: canGoToStep(2) ? 1 : 0.4,
              position: "relative",
              zIndex: 2
            }}>
              {/* Header */}
              <div
                onClick={() => {
                  if (canGoToStep(2)) {
                    setActiveStep(2);
                  }
                }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "22px 28px", cursor: canGoToStep(2) ? "pointer" : "default",
                  borderBottom: activeStep === 2 ? `1px solid ${t.bdr2}` : "none",
                  background: activeStep === 2 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.008)") : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={activeStep === 2 ? "stepper-halo-active" : ""} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: (maxStepReached >= 2 && activeStep !== 2) ? "#10B981" : (activeStep === 2 ? "#6366F1" : "transparent"),
                    border: `1.5px solid ${(maxStepReached >= 2 && activeStep !== 2) ? "#10B981" : (activeStep === 2 ? "#6366F1" : t.dim)}`,
                    color: (maxStepReached >= 2 && activeStep !== 2) || activeStep === 2 ? "#FFF" : t.sub,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                    transition: "all 0.3s ease"
                  }}>
                    {(maxStepReached >= 2 && activeStep !== 2) ? "✓" : "02"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, color: activeStep === 2 ? t.txt : t.sub,
                      letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                      02 // COMPILATION LAYER ENGINE
                      {activeStep === 2 && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1", animation: "blink 1s infinite" }} />}
                    </span>
                    {activeStep !== 2 && maxStepReached >= 2 && (
                      <span style={{ fontSize: 10, color: t.dim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Active: {MODEL_PRICING[modelId]?.label || modelId}
                      </span>
                    )}
                  </div>
                </div>
                {activeStep !== 2 && maxStepReached >= 2 && (
                  <button style={{
                    background: dark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    border: `1px solid rgba(99, 102, 241, 0.3)`, color: "#6366F1", fontSize: 9,
                    fontWeight: 900, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                    padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em"
                  }}>
                    CHANGE MODEL
                  </button>
                )}
              </div>

              {/* Body */}
              {activeStep === 2 && (
                <div style={{
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20,
                  animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Select synthesized intelligence tier. Paid offers precise schema compliance, free is high-speed.
                    </span>
                    <div style={{ display: "flex", gap: 4, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", padding: 4, borderRadius: 8 }}>
                      <button
                        onClick={() => setModelTab("paid")}
                        style={{
                          background: modelTab === "paid" ? (dark ? "rgba(255,255,255,0.06)" : "#FFF") : "transparent",
                          border: "none", color: modelTab === "paid" ? t.txt : t.sub,
                          fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6,
                          cursor: "pointer", transition: "all 0.15s"
                        }}>
                        Paid Cloud
                      </button>
                      <button
                        onClick={() => setModelTab("free")}
                        style={{
                          background: modelTab === "free" ? (dark ? "rgba(255,255,255,0.06)" : "#FFF") : "transparent",
                          border: "none", color: modelTab === "free" ? t.txt : t.sub,
                          fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6,
                          cursor: "pointer", transition: "all 0.15s"
                        }}>
                        Free Cloud
                      </button>
                      <button
                        onClick={() => setModelTab("local")}
                        style={{
                          background: modelTab === "local" ? (dark ? "rgba(255,255,255,0.06)" : "#FFF") : "transparent",
                          border: "none", color: modelTab === "local" ? t.txt : t.sub,
                          fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6,
                          cursor: "pointer", transition: "all 0.15s"
                        }}>
                        Local Offline
                      </button>
                    </div>
                  </div>

                  <div>
                    {(() => {
                      const groupMap = {
                        paid: modelGroups[0],
                        free: modelGroups[1],
                        local: modelGroups[2]
                      };
                      const group = groupMap[modelTab] || modelGroups[1];
                      
                      const gridCols = modelTab === "free" ? "1fr 1fr" : "1fr";
                      
                      return (
                        <div style={{
                          display: "grid", gridTemplateColumns: gridCols, gap: 10,
                          animation: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}>
                          {group.models.map(key => {
                            const pricing = MODEL_PRICING[key];
                            if (!pricing) return null;
                            const meta = TIER_META[pricing.tier];
                            const active = modelId === key;
                            const color = getModelGlowColor(key);
                            
                            // Speed / accuracy descriptions
                            const getModelDetails = (mId) => {
                              if (mId.includes("opus")) return { speed: "Slower", acc: "Deep Reasoning 99%" };
                              if (mId.includes("sonnet")) return { speed: "Fast", acc: "Premium Balanced 95%" };
                              if (mId.includes("haiku")) return { speed: "Instant", acc: "Standard 85%" };
                              if (mId.includes("gemini-1.5-pro")) return { speed: "Moderate", acc: "Large Context 90%" };
                              if (mId.includes("gemini-1.5-flash")) return { speed: "Instant", acc: "Standard 80%" };
                              if (mId.includes("groq")) return { speed: "Sub-Second", acc: "Standard 80%" };
                              if (mId.includes("openrouter")) return { speed: "Fast", acc: "Standard 82%" };
                              return { speed: "Local", acc: "Standard 75%" };
                            };
                            const details = getModelDetails(key);

                            return (
                              <div
                                key={key}
                                onClick={() => setModelId(key)}
                                className={active ? "model-card-hover-active model-card-active" : "model-card-hover"}
                                style={{
                                  border: `1.5px solid ${active ? color : t.bdr2}`,
                                  borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                                  background: active ? `${color}0b` : dark ? "rgba(255,255,255,0.01)" : "#FFF",
                                  transition: "all 0.2s ease", display: "flex", flexDirection: "column",
                                  gap: 10, position: "relative",
                                  boxShadow: active ? `0 0 15px ${color}15` : "none",
                                  boxSizing: "border-box"
                                }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <span style={{
                                    fontSize: 12, fontWeight: 800,
                                    color: active ? color : t.txt,
                                    fontFamily: "'Space Grotesk', sans-serif"
                                  }}>
                                    {pricing.label}
                                  </span>
                                  {active && <span style={{ fontSize: 12, color, animation: "blink 1.5s infinite" }}>●</span>}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ display: "flex", gap: 8, fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span>SPEED: {details.speed.toUpperCase()}</span>
                                    <span>ACC: {details.acc}</span>
                                  </div>
                                  <span style={{
                                    fontSize: 8, padding: "2px 6px", borderRadius: 4,
                                    background: `${meta.color}15`, color: meta.color, fontWeight: 900,
                                    fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase"
                                  }}>
                                    {meta.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Footer Nav */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <button
                      onClick={() => setActiveStep(1)}
                      style={{
                        background: "transparent", border: `1px solid ${t.bdr2}`,
                        color: t.txt, padding: "10px 20px", borderRadius: 10,
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        setMaxStepReached(prev => Math.max(prev, 3));
                        setActiveStep(3);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                        color: "#FFF",
                        border: "none", padding: "12px 24px", borderRadius: 10,
                        fontSize: 11, fontWeight: 900, cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
                        transition: "all 0.25s", fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.08em", textTransform: "uppercase"
                      }}>
                      Confirm & Select Features →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: ENGINE FEATURES */}
          <div style={{ position: "relative" }}>
            {activeStep !== 3 && maxStepReached >= 3 && (
              <div className="stepper-timeline-connector stepper-timeline-connector-gradient" />
            )}
            {activeStep === 3 && (
              <div className="stepper-timeline-connector" style={{
                background: "linear-gradient(to bottom, rgba(99,102,241,0.2), transparent)"
              }} />
            )}
            
            <div className={activeStep === 3 ? (dark ? "glass-card active-wizard-step" : "glass-card-light active-wizard-step-light") : (dark ? "glass-card" : "glass-card-light")} style={{
              border: `1px solid ${activeStep === 3 ? "#6366F1" : (maxStepReached >= 3 ? "rgba(16, 185, 129, 0.3)" : t.bdr2)}`,
              boxShadow: activeStep === 3 ? (dark ? "0 0 50px rgba(99, 102, 241, 0.08)" : "0 0 50px rgba(99, 102, 241, 0.02)") : "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: 16,
              overflow: "hidden",
              opacity: canGoToStep(3) ? 1 : 0.4,
              position: "relative",
              zIndex: 2
            }}>
              {/* Header */}
              <div
                onClick={() => {
                  if (canGoToStep(3)) {
                    setActiveStep(3);
                  }
                }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "22px 28px", cursor: canGoToStep(3) ? "pointer" : "default",
                  borderBottom: activeStep === 3 ? `1px solid ${t.bdr2}` : "none",
                  background: activeStep === 3 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.008)") : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={activeStep === 3 ? "stepper-halo-active" : ""} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: (maxStepReached >= 3 && activeStep !== 3) ? "#10B981" : (activeStep === 3 ? "#6366F1" : "transparent"),
                    border: `1.5px solid ${(maxStepReached >= 3 && activeStep !== 3) ? "#10B981" : (activeStep === 3 ? "#6366F1" : t.dim)}`,
                    color: (maxStepReached >= 3 && activeStep !== 3) || activeStep === 3 ? "#FFF" : t.sub,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                    transition: "all 0.3s ease"
                  }}>
                    {(maxStepReached >= 3 && activeStep !== 3) ? "✓" : "03"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, color: activeStep === 3 ? t.txt : t.sub,
                      letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                      03 // COMPILER ENGINE ENGINE OPTIONS
                      {activeStep === 3 && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1", animation: "blink 1s infinite" }} />}
                    </span>
                    {activeStep !== 3 && maxStepReached >= 3 && (
                      <span style={{ fontSize: 10, color: t.dim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Options: {getOptionsSummary()}
                      </span>
                    )}
                  </div>
                </div>
                {activeStep !== 3 && maxStepReached >= 3 && (
                  <button style={{
                    background: dark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    border: `1px solid rgba(99, 102, 241, 0.3)`, color: "#6366F1", fontSize: 9,
                    fontWeight: 900, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                    padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em"
                  }}>
                    MODIFY OPTIONS
                  </button>
                )}
              </div>

              {/* Body */}
              {activeStep === 3 && (
                <div style={{
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20,
                  animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <div style={{ fontSize: 12, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Enable specific validation, patching, and repair systems to run in parallel.
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* Option 1 */}
                    <div
                      onClick={() => toggleOption("enableValidator")}
                      className={`toggle-card toggle-card-validation`}
                      style={{
                        padding: "14px 16px", border: `1.5px solid ${options.enableValidator ? t.blue : t.bdr2}`,
                        borderRadius: 12, background: options.enableValidator ? `${t.blue}0a` : "transparent",
                        display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
                        boxShadow: options.enableValidator ? `0 0 15px ${t.blue}12` : "none"
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: options.enableValidator ? t.txt : t.sub, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Schema Validation Binds
                        </span>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${options.enableValidator ? t.blue : t.dim}`,
                          background: options.enableValidator ? t.blue : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#FFF",
                          transition: "all 0.2s ease"
                        }}>✓</div>
                      </div>
                      <span style={{ fontSize: 9, color: t.dim, lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Verify consistency between endpoints, databases, schemas, and API contracts.
                      </span>
                    </div>

                    {/* Option 2 */}
                    <div
                      onClick={() => toggleOption("enableRepair")}
                      className={`toggle-card toggle-card-repair`}
                      style={{
                        padding: "14px 16px", border: `1.5px solid ${options.enableRepair ? t.purple : t.bdr2}`,
                        borderRadius: 12, background: options.enableRepair ? `${t.purple}0a` : "transparent",
                        display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
                        boxShadow: options.enableRepair ? `0 0 15px ${t.purple}12` : "none"
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: options.enableRepair ? t.txt : t.sub, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Surgical Drift Repair
                        </span>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${options.enableRepair ? t.purple : t.dim}`,
                          background: options.enableRepair ? t.purple : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#FFF",
                          transition: "all 0.2s ease"
                        }}>✓</div>
                      </div>
                      <span style={{ fontSize: 9, color: t.dim, lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Surgically synchronize database schemas and patch broken route definitions.
                      </span>
                    </div>

                    {/* Option 3 */}
                    <div
                      onClick={() => toggleOption("enableDiff")}
                      className={`toggle-card toggle-card-diff`}
                      style={{
                        padding: "14px 16px", border: `1.5px solid ${options.enableDiff ? t.teal : t.bdr2}`,
                        borderRadius: 12, background: options.enableDiff ? `${t.teal}0a` : "transparent",
                        display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
                        boxShadow: options.enableDiff ? `0 0 15px ${t.teal}12` : "none"
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: options.enableDiff ? t.txt : t.sub, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Compiler Delta Diff
                        </span>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${options.enableDiff ? t.teal : t.dim}`,
                          background: options.enableDiff ? t.teal : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#FFF",
                          transition: "all 0.2s ease"
                        }}>✓</div>
                      </div>
                      <span style={{ fontSize: 9, color: t.dim, lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Identify code delta additions compared to previous specification versions.
                      </span>
                    </div>

                    {/* Option 4 */}
                    <div
                      onClick={() => toggleOption("injectValidationErrors")}
                      className={`toggle-card toggle-card-drift`}
                      style={{
                        padding: "14px 16px", border: `1.5px solid ${options.injectValidationErrors ? t.red : t.bdr2}`,
                        borderRadius: 12, background: options.injectValidationErrors ? `${t.red}0a` : "transparent",
                        display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
                        boxShadow: options.injectValidationErrors ? `0 0 15px ${t.red}12` : "none"
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: options.injectValidationErrors ? t.txt : t.sub, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Drift Simulator
                        </span>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${options.injectValidationErrors ? t.red : t.dim}`,
                          background: options.injectValidationErrors ? t.red : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#FFF",
                          transition: "all 0.2s ease"
                        }}>✓</div>
                      </div>
                      <span style={{ fontSize: 9, color: t.dim, lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Inject artificial schema drift mismatch to demonstrate compiler repair functionality.
                      </span>
                    </div>
                  </div>

                  {/* Footer Nav */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <button
                      onClick={() => setActiveStep(2)}
                      style={{
                        background: "transparent", border: `1px solid ${t.bdr2}`,
                        color: t.txt, padding: "10px 20px", borderRadius: 10,
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        setMaxStepReached(prev => Math.max(prev, 4));
                        setActiveStep(4);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                        color: "#FFF",
                        border: "none", padding: "12px 24px", borderRadius: 10,
                        fontSize: 11, fontWeight: 900, cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
                        transition: "all 0.25s", fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.08em", textTransform: "uppercase"
                      }}>
                      Confirm & Open Vault →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: VAULT CREDENTIALS */}
          <div style={{ position: "relative" }}>
            {activeStep !== 4 && maxStepReached >= 4 && (
              <div className="stepper-timeline-connector stepper-timeline-connector-gradient" />
            )}
            {activeStep === 4 && (
              <div className="stepper-timeline-connector" style={{
                background: "linear-gradient(to bottom, rgba(99,102,241,0.2), transparent)"
              }} />
            )}
            
            <div className={activeStep === 4 ? (dark ? "glass-card active-wizard-step" : "glass-card-light active-wizard-step-light") : (dark ? "glass-card" : "glass-card-light")} style={{
              border: `1px solid ${activeStep === 4 ? "#6366F1" : (maxStepReached >= 4 ? "rgba(16, 185, 129, 0.3)" : t.bdr2)}`,
              boxShadow: activeStep === 4 ? (dark ? "0 0 50px rgba(99, 102, 241, 0.08)" : "0 0 50px rgba(99, 102, 241, 0.02)") : "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: 16,
              overflow: "hidden",
              opacity: canGoToStep(4) ? 1 : 0.4,
              position: "relative",
              zIndex: 2
            }}>
              {/* Header */}
              <div
                onClick={() => {
                  if (canGoToStep(4)) {
                    setActiveStep(4);
                  }
                }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "22px 28px", cursor: canGoToStep(4) ? "pointer" : "default",
                  borderBottom: activeStep === 4 ? `1px solid ${t.bdr2}` : "none",
                  background: activeStep === 4 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.008)") : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={activeStep === 4 ? "stepper-halo-active" : ""} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: (maxStepReached >= 4 && activeStep !== 4) ? "#10B981" : (activeStep === 4 ? "#6366F1" : "transparent"),
                    border: `1.5px solid ${(maxStepReached >= 4 && activeStep !== 4) ? "#10B981" : (activeStep === 4 ? "#6366F1" : t.dim)}`,
                    color: (maxStepReached >= 4 && activeStep !== 4) || activeStep === 4 ? "#FFF" : t.sub,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                    transition: "all 0.3s ease"
                  }}>
                    {(maxStepReached >= 4 && activeStep !== 4) ? "✓" : "04"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, color: activeStep === 4 ? t.txt : t.sub,
                      letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                      04 // VAULT CREDENTIALS MANAGER
                      {activeStep === 4 && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1", animation: "blink 1s infinite" }} />}
                    </span>
                    {activeStep !== 4 && maxStepReached >= 4 && (
                      <span style={{ fontSize: 10, color: t.dim, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Status: {hasAnyKey(credentials) ? "🔐 Active API Keys Saved" : "⚡ Fallback Sandbox Mode"}
                      </span>
                    )}
                  </div>
                </div>
                {activeStep !== 4 && maxStepReached >= 4 && (
                  <button style={{
                    background: dark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    border: `1px solid rgba(99, 102, 241, 0.3)`, color: "#6366F1", fontSize: 9,
                    fontWeight: 900, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                    padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em"
                  }}>
                    MANAGE VAULT
                  </button>
                )}
              </div>

              {/* Body */}
              {activeStep === 4 && (
                <div style={{
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20,
                  animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  {/* Sandbox Safety Banner */}
                  <div style={{
                    padding: "14px 18px", borderRadius: 12,
                    background: dark ? "rgba(16, 185, 129, 0.04)" : "rgba(16, 185, 129, 0.02)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    display: "flex", gap: 12, alignItems: "start"
                  }}>
                    <span style={{ fontSize: 16, marginTop: 1 }}>🛡️</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: dark ? "#34D399" : "#059669", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em" }}>
                        SECURE LOCAL SANDBOX ENCRYPTED BIND
                      </span>
                      <p style={{ fontSize: 10, color: t.sub, margin: 0, lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        API keys are stored strictly in client-side local sandbox (localStorage). They are never saved to a database, never logged, and are sent directly to the model endpoints.
                      </p>
                    </div>
                  </div>

                  {/* Grid of keys */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Anthropic Key */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px",
                      background: dark ? "rgba(255,255,255,0.01)" : "#FBFBFA",
                      border: `1.5px solid ${hasAnthropicKey(credentials) ? "rgba(245, 158, 11, 0.3)" : t.bdr2}`,
                      borderRadius: 12, transition: "all 0.2s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.txt, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                          Anthropic key
                          <span style={{ fontSize: 8, color: credentials.apiKey ? "#10B981" : t.dim }}>
                            {credentials.apiKey ? "[SET]" : "[EMPTY]"}
                          </span>
                        </span>
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 8, color: "#F59E0B", textDecoration: "none", fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace"
                        }} className="vault-link">
                          GET KEY ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        value={credentials.apiKey || ""}
                        onChange={(e) => updateCredential("apiKey", e.target.value)}
                        placeholder="sk-ant-..."
                        className={dark ? "cyber-input" : "cyber-input-light"}
                        style={{
                          background: dark ? "rgba(0,0,0,0.5)" : "#FFF", border: `1px solid ${t.bdr2}`,
                          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.txt,
                          fontFamily: "'JetBrains Mono', monospace", outline: "none", width: "100%", boxSizing: "border-box"
                        }}
                      />
                    </div>

                    {/* Gemini Key */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px",
                      background: dark ? "rgba(255,255,255,0.01)" : "#FBFBFA",
                      border: `1.5px solid ${hasGeminiKey(credentials) ? "rgba(99, 102, 241, 0.3)" : t.bdr2}`,
                      borderRadius: 12, transition: "all 0.2s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.txt, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1" }} />
                          Gemini key
                          <span style={{ fontSize: 8, color: credentials.geminiApiKey ? "#10B981" : t.dim }}>
                            {credentials.geminiApiKey ? "[SET]" : "[EMPTY]"}
                          </span>
                        </span>
                        <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 8, color: "#6366F1", textDecoration: "none", fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace"
                        }} className="vault-link">
                          GET KEY ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        value={credentials.geminiApiKey || ""}
                        onChange={(e) => updateCredential("geminiApiKey", e.target.value)}
                        placeholder="AIzaSy..."
                        className={dark ? "cyber-input" : "cyber-input-light"}
                        style={{
                          background: dark ? "rgba(0,0,0,0.5)" : "#FFF", border: `1px solid ${t.bdr2}`,
                          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.txt,
                          fontFamily: "'JetBrains Mono', monospace", outline: "none", width: "100%", boxSizing: "border-box"
                        }}
                      />
                    </div>

                    {/* Groq Key */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px",
                      background: dark ? "rgba(255,255,255,0.01)" : "#FBFBFA",
                      border: `1.5px solid ${hasGroqKey(credentials) ? "rgba(236, 72, 153, 0.3)" : t.bdr2}`,
                      borderRadius: 12, transition: "all 0.2s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.txt, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#EC4899" }} />
                          Groq key
                          <span style={{ fontSize: 8, color: credentials.groqApiKey ? "#10B981" : t.dim }}>
                            {credentials.groqApiKey ? "[SET]" : "[EMPTY]"}
                          </span>
                        </span>
                        <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 8, color: "#EC4899", textDecoration: "none", fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace"
                        }} className="vault-link">
                          GET KEY ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        value={credentials.groqApiKey || ""}
                        onChange={(e) => updateCredential("groqApiKey", e.target.value)}
                        placeholder="gsk_..."
                        className={dark ? "cyber-input" : "cyber-input-light"}
                        style={{
                          background: dark ? "rgba(0,0,0,0.5)" : "#FFF", border: `1px solid ${t.bdr2}`,
                          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.txt,
                          fontFamily: "'JetBrains Mono', monospace", outline: "none", width: "100%", boxSizing: "border-box"
                        }}
                      />
                    </div>

                    {/* OpenRouter Key */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px",
                      background: dark ? "rgba(255,255,255,0.01)" : "#FBFBFA",
                      border: `1.5px solid ${hasOpenRouterKey(credentials) ? "rgba(20, 184, 166, 0.3)" : t.bdr2}`,
                      borderRadius: 12, transition: "all 0.2s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.txt, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#14B8A6" }} />
                          OpenRouter key
                          <span style={{ fontSize: 8, color: credentials.openRouterApiKey ? "#10B981" : t.dim }}>
                            {credentials.openRouterApiKey ? "[SET]" : "[EMPTY]"}
                          </span>
                        </span>
                        <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 8, color: "#14B8A6", textDecoration: "none", fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace"
                        }} className="vault-link">
                          GET KEY ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        value={credentials.openRouterApiKey || ""}
                        onChange={(e) => updateCredential("openRouterApiKey", e.target.value)}
                        placeholder="sk-or-v1-..."
                        className={dark ? "cyber-input" : "cyber-input-light"}
                        style={{
                          background: dark ? "rgba(0,0,0,0.5)" : "#FFF", border: `1px solid ${t.bdr2}`,
                          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.txt,
                          fontFamily: "'JetBrains Mono', monospace", outline: "none", width: "100%", boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: 9, color: t.dim, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.4 }}>
                    🔒 Keys left empty will automatically fall back to backend process environment variables defined in the system.
                  </div>

                  {/* Footer Nav */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <button
                      onClick={() => setActiveStep(3)}
                      style={{
                        background: "transparent", border: `1px solid ${t.bdr2}`,
                        color: t.txt, padding: "10px 20px", borderRadius: 10,
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        setMaxStepReached(prev => Math.max(prev, 5));
                        setActiveStep(5);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                        color: "#FFF",
                        border: "none", padding: "12px 24px", borderRadius: 10,
                        fontSize: 11, fontWeight: 900, cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.25)",
                        transition: "all 0.25s", fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.08em", textTransform: "uppercase"
                      }}>
                      Review & Compile →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: REVIEW & COMPILE */}
          <div style={{ position: "relative" }}>
            <div className={activeStep === 5 ? (dark ? "glass-card active-wizard-step" : "glass-card-light active-wizard-step-light") : (dark ? "glass-card" : "glass-card-light")} style={{
              border: `1px solid ${activeStep === 5 ? "#6366F1" : t.bdr2}`,
              boxShadow: activeStep === 5 ? (dark ? "0 0 50px rgba(99, 102, 241, 0.08)" : "0 0 50px rgba(99, 102, 241, 0.02)") : "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: 16,
              overflow: "hidden",
              opacity: canGoToStep(5) ? 1 : 0.4,
              position: "relative",
              zIndex: 2
            }}>
              {/* Header */}
              <div
                onClick={() => {
                  if (canGoToStep(5)) {
                    setActiveStep(5);
                  }
                }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "22px 28px", cursor: canGoToStep(5) ? "pointer" : "default",
                  borderBottom: activeStep === 5 ? `1px solid ${t.bdr2}` : "none",
                  background: activeStep === 5 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.008)") : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={activeStep === 5 ? "stepper-halo-active" : ""} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: activeStep === 5 ? "#6366F1" : "transparent",
                    border: `1.5px solid ${activeStep === 5 ? "#6366F1" : t.dim}`,
                    color: activeStep === 5 ? "#FFF" : t.sub,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0
                  }}>
                    05
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: activeStep === 5 ? t.txt : t.sub,
                    letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    05 // REVIEW CONFIG & LAUNCH
                    {activeStep === 5 && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366F1", animation: "blink 1s infinite" }} />}
                  </span>
                </div>
              </div>

              {/* Body */}
              {activeStep === 5 && (
                <div style={{
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24,
                  animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <div style={{ fontSize: 12, color: t.sub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Confirm final compiler pipeline deployment targets:
                  </div>

                  {/* Blueprint summary dashboard */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24,
                    background: dark ? "rgba(0, 0, 0, 0.3)" : "#FBFBFA",
                    padding: 20, borderRadius: 12, border: `1.5px solid ${t.bdr2}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
                  }}>
                    {/* Spec details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: t.dim, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>
                        APP SPECIFICATION TARGET
                      </span>
                      <div style={{
                        fontSize: 12, color: t.txt, lineHeight: 1.6,
                        background: dark ? "rgba(0,0,0,0.4)" : "#FFF",
                        padding: 14, borderRadius: 10, border: `1px solid ${t.bdr2}`,
                        height: 110, overflowY: "auto", fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                        {prompt}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 9, color: t.dim, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span>Words: {wordCount}</span>
                        <span>Chars: {characterCount}</span>
                      </div>
                    </div>

                    {/* Config details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: t.dim, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>
                        COMPILER PARAMETERS
                      </span>

                      {/* Target Model */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                        <span style={{ color: t.sub }}>Synthesis Intelligence:</span>
                        <span style={{
                          fontWeight: 850, color: getModelGlowColor(modelId),
                          background: `${getModelGlowColor(modelId)}15`,
                          border: `1px solid ${getModelGlowColor(modelId)}30`,
                          padding: "3px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9
                        }}>
                          {MODEL_PRICING[modelId]?.label || modelId}
                        </span>
                      </div>

                      {/* Engine Features */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: t.sub, fontSize: 11 }}>Active Compiler Modules:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                          {options.enableValidator && (
                            <span style={{ fontSize: 8, background: `${t.blue}15`, color: t.blue, border: `1px solid ${t.blue}30`, padding: "3px 8px", borderRadius: 4, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                              VALIDATOR
                            </span>
                          )}
                          {options.enableRepair && (
                            <span style={{ fontSize: 8, background: `${t.purple}15`, color: t.purple, border: `1px solid ${t.purple}30`, padding: "3px 8px", borderRadius: 4, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                              AUTO-REPAIR
                            </span>
                          )}
                          {options.enableDiff && (
                            <span style={{ fontSize: 8, background: `${t.teal}15`, color: t.teal, border: `1px solid ${t.teal}30`, padding: "3px 8px", borderRadius: 4, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                              DIFF
                            </span>
                          )}
                          {options.injectValidationErrors && (
                            <span style={{ fontSize: 8, background: `${t.red}15`, color: t.red, border: `1px solid ${t.red}30`, padding: "3px 8px", borderRadius: 4, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                              DRIFT SIM
                            </span>
                          )}
                          {!options.enableValidator && !options.enableRepair && !options.enableDiff && !options.injectValidationErrors && (
                            <span style={{ fontSize: 8, color: t.dim }}>No modules selected</span>
                          )}
                        </div>
                      </div>

                      {/* Credentials State */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, borderTop: `1px solid ${t.bdr2}`, paddingTop: 12 }}>
                        <span style={{ color: t.sub }}>Auth Vault Target:</span>
                        <span style={{
                          fontSize: 9, padding: "3px 10px", borderRadius: 6,
                          background: hasAnyKey(credentials) ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: hasAnyKey(credentials) ? "#10B981" : "#F59E0B",
                          border: `1px solid ${hasAnyKey(credentials) ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                          fontWeight: 900, fontFamily: "'JetBrains Mono', monospace"
                        }}>
                          {hasAnyKey(credentials) ? "🔐 ENCRYPTED LIVE BIND" : "⚡ SIMULATOR MODE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Nav */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 20 }}>
                    <button
                      onClick={() => setActiveStep(4)}
                      style={{
                        background: "transparent", border: `1px solid ${t.bdr2}`,
                        color: t.txt, padding: "10px 20px", borderRadius: 10,
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                      ← Back
                    </button>
                    
                    <button
                      onClick={onCompile}
                      disabled={!prompt.trim()}
                      style={{
                        background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 50%, #8B5CF6 100%)",
                        color: "#FFF",
                        border: "none", padding: "16px 42px", borderRadius: 14,
                        fontSize: 13, fontWeight: 900, cursor: "pointer",
                        boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.08em", textTransform: "uppercase"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 10px 35px rgba(255, 26, 74, 0.4)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(99, 102, 241, 0.3)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      LAUNCH COMPILER PIPELINE ⚡
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
