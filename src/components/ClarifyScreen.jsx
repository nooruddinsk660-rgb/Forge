import { useState } from "react";
import { makeTheme } from "../core/cost.js";

export const ClarifyScreen = ({ dark, prompt, onSubmitAnswers }) => {
  const t = makeTheme(dark);

  const getClarificationQuestions = () => {
    const norm = prompt.toLowerCase();
    
    let qList = [
      {
        id: "q1",
        question: "How should access control and role-based permissions (RBAC) be enforced?",
        options: [
          "Strict hierarchical RBAC (Admin has complete root access, Managers write, Users read-only)",
          "Workspace sharing model (Users create workspaces and invite others with custom permission levels)",
          "Minimal authentication model (Flat structure, authentication required for write access only)"
        ]
      },
      {
        id: "q2",
        question: "What monetization and integration strategy is required?",
        options: [
          "SaaS subscriptions with Stripe (Basic, Pro, Enterprise tiers configured)",
          "One-time payment gateway checkout (Shopping cart order fulfillment and checkout flow)",
          "No payments integrated (Completely free, open source database schema structure)"
        ]
      },
      {
        id: "q3",
        question: "What storage and hosting requirements does your app demand?",
        options: [
          "Standard relational storage (PostgreSQL with strict foreign key constraints)",
          "Real-time reactive storage (PostgreSQL + Redis caching + WebSocket live listeners)",
          "No special caching (Simple SQL DB, server-side rendered pages with low latency)"
        ]
      }
    ];

    if (norm.includes("health") || norm.includes("clinic")) {
      qList[0].question = "How must patient data privacy and HIPAA compliance rules be structured?";
      qList[0].options = [
        "Patient-restricted access (Patients only view their own records, Doctor has full CRUD)",
        "Strict clinical separation (Doctors only see assigned patients, Admin views billing details)",
        "Open health network (All doctors share patient notes across clinics)"
      ];
    } else if (norm.includes("lms") || norm.includes("course")) {
      qList[0].question = "How should course content gates and subscription models be linked?";
      qList[0].options = [
        "Paywalled courses (Courses must be purchased individually or via global subscription)",
        "Instructor-based gates (Instructors control quiz grading and manual approvals)",
        "Open education system (Quizzes are interactive but progress is free)"
      ];
    } else if (norm.includes("store") || norm.includes("shop")) {
      qList[1].question = "What shopping cart checkout flow should the code generator emit?";
      qList[1].options = [
        "Escrow payments (Hold funds until delivery confirmation or dispute resolution)",
        "Standard instant payment checkout (Collect payment and immediately write order)",
        "Subscription-based replenishment (Automated repeating order payments)"
      ];
    }

    return qList;
  };

  const questions = getClarificationQuestions();
  const [answers, setAnswers] = useState(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: q.options[0] }), {})
  );

  const [activeQ, setActiveQ] = useState(0);

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
    // Auto advance to the next question with a tiny delay for responsiveness
    if (activeQ < questions.length - 1) {
      setTimeout(() => {
        setActiveQ(prev => prev + 1);
      }, 350);
    }
  };

  const handleSubmit = () => {
    onSubmitAnswers(answers);
  };

  const currentQ = questions[activeQ];

  // Calculate completion percentage
  const progressPercent = Math.round(((activeQ + 1) / questions.length) * 100);

  return (
    <div className="cyber-grid-bg" style={{
      minHeight: "100%", width: "100%", boxSizing: "border-box",
      padding: "50px 24px", color: t.txt, animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      position: "relative", overflow: "hidden", background: dark ? "#050508" : "#FBFBFA"
    }}>
      {/* Background Ambient Blobs */}
      <div className="ambient-glow-blob blob-violet" style={{ top: "15%", left: "10%", width: 350, height: 350 }} />
      <div className="ambient-glow-blob blob-rose" style={{ bottom: "15%", right: "10%", width: 400, height: 400 }} />

      <div style={{
        maxWidth: 720, margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 32,
        position: "relative", zIndex: 1
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 900, color: t.blue, letterSpacing: "0.25em",
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
            background: `${t.blue}12`, border: `1px solid ${t.blue}25`,
            padding: "4px 12px", borderRadius: 6, alignSelf: "center"
          }}>
            ARCHITECT SPECIFICATION WIZARD
          </span>
          <h2 style={{
            fontSize: 34, fontWeight: 900, margin: "8px 0 0 0",
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 50%, #10B981 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.2
          }}>
            Fine-tune Compiler Intent
          </h2>
          <p style={{
            fontSize: 13, color: t.sub, maxWidth: 580, margin: "6px auto 0 auto",
            lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Our Lexer identified some structural ambiguities in your prompt. Please clarify these core decisions to guide the system in generating optimized schema layers.
          </p>
        </div>

        {/* High-Tech Progress Bar */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.dim }}>
            <span>COMPILER CALIBRATION PROGRESS</span>
            <span style={{ color: t.blue, fontWeight: 800 }}>{progressPercent}% COMPLETE</span>
          </div>
          <div style={{ width: "100%", height: 6, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 3, overflow: "hidden", border: `1px solid ${t.bdr2}` }}>
            <div style={{
              width: `${progressPercent}%`, height: "100%",
              background: "linear-gradient(90deg, #6366F1, #FF1A4A)",
              borderRadius: 3, transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }} />
          </div>
        </div>

        {/* Stepper Timeline at the Top */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: dark ? "rgba(10, 10, 15, 0.6)" : "rgba(255, 255, 255, 0.8)",
          padding: "16px 28px", borderRadius: 14, border: `1px solid ${t.bdr2}`,
          boxShadow: dark ? "inset 0 1px 0 rgba(255, 255, 255, 0.02)" : "none",
          position: "relative"
        }}>
          {questions.map((q, idx) => {
            const isCompleted = idx < activeQ;
            const isActive = idx === activeQ;
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 2 }}>
                <div className={isActive ? "stepper-halo-active" : ""} style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: isCompleted ? t.green : (isActive ? "#FF1A4A" : "transparent"),
                  border: `1.5px solid ${isCompleted ? t.green : (isActive ? "#FF1A4A" : t.dim)}`,
                  color: isCompleted || isActive ? "#FFF" : t.sub,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: isActive ? "0 0 12px rgba(255, 26, 74, 0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {isCompleted ? "✓" : `0${idx + 1}`}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 800 : 600,
                  color: isActive ? t.txt : t.sub, fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.02em"
                }}>
                  {idx === 0 ? "Permissions" : idx === 1 ? "Monetization" : "Infrastructure"}
                </span>
                {idx < questions.length - 1 && (
                  <div style={{ width: 30, height: 1, background: t.bdr2, marginLeft: 10 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Active Question Card */}
        <div
          className={dark ? "glass-card" : "glass-card-light"}
          style={{
            padding: "36px 40px", display: "flex", flexDirection: "column", gap: 28,
            border: `1.5px solid rgba(255, 26, 74, 0.25)`,
            boxShadow: dark ? "0 10px 40px rgba(255, 26, 74, 0.04)" : "0 10px 40px rgba(255, 26, 74, 0.01)",
            borderRadius: 18, transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", background: `${t.blue}15`,
              color: t.blue, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
              border: `1.5px solid ${t.blue}30`
            }}>
              0{activeQ + 1}
            </span>
            <h3 style={{
              fontSize: 18, fontWeight: 800, margin: "4px 0 0 0",
              fontFamily: "'Space Grotesk', sans-serif", color: t.txt, lineHeight: 1.45,
              letterSpacing: "-0.01em"
            }}>
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingLeft: 48 }}>
            {currentQ.options.map((option, oIdx) => {
              const active = answers[currentQ.id] === option;
              const indicatorColor = active ? t.blue : t.bdr2;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.id, option)}
                  className={dark ? "toggle-card" : "toggle-card-light"}
                  style={{
                    padding: "18px 22px", borderRadius: 12,
                    border: `1.5px solid ${active ? t.blue : t.bdr2}`,
                    background: active ? `${t.blue}08` : dark ? "rgba(255,255,255,0.01)" : "#FFF",
                    fontSize: 13, color: active ? t.txt : t.sub, lineHeight: 1.5,
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: active ? `0 4px 15px ${t.blue}08` : "none",
                    position: "relative", overflow: "hidden"
                  }}>
                  {/* Left branding glow strip */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: indicatorColor }} />
                  
                  {/* Custom Radio Dot */}
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${active ? t.blue : t.dim}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s ease",
                    background: active ? t.blue : "transparent",
                    marginRight: 4
                  }}>
                    {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFF" }} />}
                  </div>
                  <span style={{ fontWeight: active ? 750 : 500 }}>{option}</span>
                </div>
              );
            })}
          </div>

          {/* Stepper Footer Controls */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 8, borderTop: `1px solid ${t.bdr2}`, paddingTop: 24
          }}>
            {activeQ > 0 ? (
              <button
                onClick={() => setActiveQ(prev => prev - 1)}
                style={{
                  background: "transparent", border: `1px solid ${t.bdr2}`,
                  color: t.txt, padding: "10px 22px", borderRadius: 10,
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.blue;
                  e.currentTarget.style.color = t.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.bdr2;
                  e.currentTarget.style.color = t.txt;
                }}
              >
                ← Previous Question
              </button>
            ) : <div />}

            {activeQ < questions.length - 1 ? (
              <button
                onClick={() => setActiveQ(prev => prev + 1)}
                style={{
                  background: "transparent", border: `1px solid ${t.bdr2}`,
                  color: t.txt, padding: "10px 22px", borderRadius: 10,
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.blue;
                  e.currentTarget.style.color = t.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.bdr2;
                  e.currentTarget.style.color = t.txt;
                }}
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  padding: "16px 32px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #FF1A4A 0%, #6366F1 50%, #8B5CF6 100%)",
                  color: "#FFF", fontSize: 12, fontWeight: 900, cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)",
                  display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
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
                SUBMIT SPECIFICATION & COMPILE ⚡
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClarifyScreen;
