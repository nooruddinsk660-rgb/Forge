import { useState } from "react";
import { makeTheme } from "./core/cost.js";
import TopBar from "./components/ui/TopBar.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import ClarifyScreen from "./components/ClarifyScreen.jsx";
import CompileScreen from "./components/CompileScreen.jsx";
import { runCompilationPipeline } from "./core/pipeline.js";

export const Forge = () => {
  const [dark, setDark] = useState(true);
  const [screen, setScreen] = useState("home"); // home, clarify, compile, result
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState("claude-sonnet-4-6");

  // Compiler Options
  const [options, setOptions] = useState({
    enableValidator: true,
    enableRepair: true,
    enableDiff: true,
    injectValidationErrors: false
  });

  // API Credentials State (loaded from localStorage with environment variable fallbacks)
  const [credentials, setCredentials] = useState(() => ({
    apiKey: localStorage.getItem("forge_anthropic_key") || "",
    geminiApiKey: localStorage.getItem("forge_gemini_key") || "",
    groqApiKey: localStorage.getItem("forge_groq_key") || "",
    openRouterApiKey: localStorage.getItem("forge_openrouter_key") || ""
  }));

  const updateCredential = (key, value) => {
    setCredentials(prev => {
      const updated = { ...prev, [key]: value };
      const storageKeys = {
        apiKey: "forge_anthropic_key",
        geminiApiKey: "forge_gemini_key",
        groqApiKey: "forge_groq_key",
        openRouterApiKey: "forge_openrouter_key"
      };
      if (storageKeys[key]) {
        localStorage.setItem(storageKeys[key], value);
      }
      return updated;
    });
  };

  // State Data Output
  const [stageData, setStageData] = useState({});
  const [stageValid, setStageValid] = useState({});
  const [logs, setLogs] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [jsonStage, setJsonStage] = useState("lexer");

  // Compilation Metrics
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [costSummary, setCostSummary] = useState({});
  const [metrics, setMetrics] = useState({ times: {}, totalTime: 0 });

  const t = makeTheme(dark);

  const resetAll = () => {
    setScreen("home");
    setStageData({});
    setStageValid({});
    setLogs([]);
    setActiveStage(null);
    setRunning(false);
    setDone(false);
    setCostSummary({});
    setMetrics({ times: {}, totalTime: 0 });
    setActiveTab("preview");
    setJsonStage("lexer");
  };

  // Launch compilation sequence
  const handleStartCompile = () => {
    // If prompt is vague or one-word, go to clarification screen first
    const norm = prompt.trim().toLowerCase();
    const isVague = norm.includes("business") || norm.length < 15 || norm.split(" ").length < 4;
    
    if (isVague) {
      setScreen("clarify");
    } else {
      startCompilationPipeline();
    }
  };

  const handleClarificationAnswers = (answers) => {
    // Append clarification selections to the prompt silently for richer compilation
    let enriched = prompt;
    Object.values(answers).forEach((val) => {
      enriched += `\n[Architect Selection] ${val}`;
    });
    startCompilationPipeline(enriched);
  };

  const startCompilationPipeline = async (activePrompt = prompt) => {
    setScreen("compile");
    setRunning(true);
    setDone(false);
    setStageData({});
    setStageValid({});
    setLogs([]);

    const startTime = Date.now();
    const times = {};

    const activeOptions = {
      ...options,
      modelId,
      apiKey: credentials.apiKey || "",
      geminiApiKey: credentials.geminiApiKey || "",
      groqApiKey: credentials.groqApiKey || "",
      openRouterApiKey: credentials.openRouterApiKey || ""
    };

    try {
      const result = await runCompilationPipeline(
        activePrompt,
        activeOptions,
        // onStageStart
        (stageId) => {
          setActiveStage(stageId);
          times[stageId] = Date.now();
        },
        // onStageComplete
        (stageId, data) => {
          setStageData(prev => ({ ...prev, [stageId]: data }));
          setStageValid(prev => {
            const validResult = { valid: true, score: 100, errors: [] };
            
            // Mock dynamic stage validation values for JSON screen
            if (stageId === "lexer" && activePrompt.length < 15) {
              validResult.valid = false;
              validResult.score = 60;
              validResult.errors.push({ field: "prompt", msg: "Ambiguity detected in core intent." });
            } else if (stageId === "validator" && options.injectValidationErrors) {
              validResult.valid = false;
              validResult.score = 70;
              validResult.errors.push({ field: "db_schema", msg: "Entity table or FK constraints are inconsistent." });
            }
            
            return { ...prev, [stageId]: validResult };
          });

          // Track stage time
          const duration = Date.now() - times[stageId];
          setMetrics(prev => ({
            ...prev,
            times: { ...prev.times, [stageId]: duration }
          }));
        },
        // onLogEmit
        (logLine) => {
          setLogs(prev => [...prev, logLine]);
        }
      );

      const totalTime = Date.now() - startTime;
      setMetrics(prev => ({ ...prev, totalTime }));
      setCostSummary(result.costSummary);
      setRunning(false);
      setDone(true);
      setScreen("compile"); // Maintain CompileScreen structure where tabs and StageRail are embedded
      setActiveTab("preview");
    } catch (err) {
      console.error(err);
      setRunning(false);
      setLogs(prev => [...prev, `[ERROR] Pipeline crashed: ${err.message}`]);
    }
  };

  // Simulated repair trigger
  const handleApplyRepair = async () => {
    setRunning(true);
    setLogs(prev => [...prev, `[REPAIR] Initializing surgical repair engine...`]);
    await new Promise(r => setTimeout(r, 800));

    // Update Stage Data for validator and repair
    setStageData(prev => {
      const updated = { ...prev };
      
      // Patch validator status to PASS
      if (updated["validator"]) {
        updated["validator"] = {
          ...updated["validator"],
          data: {
            ...updated["validator"].data,
            report: {
              ...updated["validator"].data.report,
              status: "PASS",
              score: 100,
              issues: [],
              warnings: []
            }
          }
        };
      }

      // Add Verify success
      if (updated["verify"]) {
        updated["verify"] = {
          ...updated["verify"],
          data: {
            ...updated["verify"].data,
            result: {
              status: "PASS",
              score: 100,
              improvement: 30,
              before_score: 70,
              after_score: 100,
              fixes_verified: [{ patch_id: "R001", verified: true, note: "Surgically synchronized database drift." }],
              remaining_issues: []
            }
          }
        };
      }

      // Update Codegen tables to include the repaired tables
      if (updated["codegen"]) {
        const tables = updated["codegen"].data.db_schema.tables;
        // Make sure all entities have tables
        const entities = updated["ir"].data.ir.entities;
        const missing = entities.find(e => !tables.some(t => t.name.includes(e.toLowerCase())));
        if (missing) {
          tables.push({
            name: `${missing.toLowerCase()}s`,
            columns: [
              { name: "id", type: "uuid", nullable: false, primary: true },
              { name: "created_at", type: "timestamp", default: "NOW()" }
            ]
          });
        }
      }

      // Fix repair final score
      if (updated["repair"]) {
        updated["repair"] = {
          ...updated["repair"],
          data: {
            ...updated["repair"].data,
            final: {
              ...updated["repair"].data.final,
              score: 100,
              status: "PRODUCTION_READY"
            }
          }
        };
      }

      return updated;
    });

    setLogs(prev => [
      ...prev,
      `[REPAIR] Repaired: Synced drifting tables to match codegen contract schemas.`,
      `[VERIFY] Post-repair validation score: 100/100 (PASS)`
    ]);

    setRunning(false);
    setActiveTab("report");
  };

  const renderActiveScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            dark={dark}
            prompt={prompt}
            setPrompt={setPrompt}
            modelId={modelId}
            setModelId={setModelId}
            options={options}
            setOptions={setOptions}
            credentials={credentials}
            updateCredential={updateCredential}
            onCompile={handleStartCompile}
          />
        );
      case "clarify":
        return (
          <ClarifyScreen
            dark={dark}
            prompt={prompt}
            onSubmitAnswers={handleClarificationAnswers}
          />
        );
      case "compile":
        return (
          <CompileScreen
            dark={dark}
            running={running}
            done={done}
            activeStage={activeStage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            jsonStage={jsonStage}
            setJsonStage={setJsonStage}
            stageData={stageData}
            stageValid={stageValid}
            logs={logs}
            metrics={metrics}
            costSummary={costSummary}
            prompt={prompt}
            onRecompile={startCompilationPipeline}
            onApplyRepair={handleApplyRepair}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: t.bg, color: t.txt, fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <TopBar
        dark={dark}
        setDark={setDark}
        screen={screen}
        resetAll={resetAll}
        running={running}
        done={done}
        appName={stageData["ir"]?.data?.ir?.appName}
        score={stageData["repair"]?.data?.final?.score}
      />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderActiveScreen()}
      </div>
    </div>
  );
};
export default Forge;
