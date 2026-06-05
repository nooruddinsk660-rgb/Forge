import { useState } from "react";
import { makeTheme } from "../../core/cost.js";
import { generateReactCode } from "../../core/ir.js";

export const PreviewTab = ({ dark, stageData }) => {
  const t = makeTheme(dark);
  const irData = stageData["ir"]?.data?.ir;
  const codegenData = stageData["codegen"]?.data;

  const codeFiles = generateReactCode(irData, codegenData) || {
    apiService: "// No code generated yet.",
    pageComponents: "// No code generated yet.",
    routeConfig: "// No code generated yet.",
    migration: "-- No code generated yet."
  };

  const [activeFile, setActiveFile] = useState("apiService");
  const [copied, setCopied] = useState(false);

  const fileInfo = {
    apiService: { name: "apiService.js", lang: "javascript", code: codeFiles.apiService },
    pageComponents: { name: "pageComponents.jsx", lang: "javascript", code: codeFiles.pageComponents },
    routeConfig: { name: "routes.js", lang: "javascript", code: codeFiles.routeConfig },
    migration: { name: "migration.sql", lang: "sql", code: codeFiles.migration }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileInfo[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "260px 1fr", height: "100%",
      animation: "fadeIn 0.3s ease"
    }}>
      {/* File Sidebar */}
      <div style={{
        borderRight: `1px solid ${t.bdr}`, padding: "16px 12px",
        display: "flex", flexDirection: "column", gap: 16, background: t.paper
      }}>
        <div style={{
          fontSize: 8, fontWeight: 800, color: t.dim, letterSpacing: "0.12em",
          textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace"
        }}>
          CODE ARTIFACTS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(fileInfo).map(([key, info]) => {
            const active = activeFile === key;
            return (
              <div
                key={key}
                onClick={() => setActiveFile(key)}
                style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  background: active ? `${t.blue}12` : "transparent",
                  border: `1px solid ${active ? t.blue : "transparent"}`,
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                }}>
                <span style={{ fontSize: 13 }}>
                  {key === "migration" ? "🗄️" : "📄"}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  color: active ? t.txt : t.sub, fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {info.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Visual Architecture Summary Widget */}
        {codegenData && (
          <div style={{
            marginTop: "auto", padding: 12, borderRadius: 10,
            background: t.panel, border: `1px solid ${t.bdr}`,
            display: "flex", flexDirection: "column", gap: 8
          }}>
            <div style={{ fontSize: 8, color: t.dim, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              ARCH DIAGRAM DATA
            </div>
            <div style={{ fontSize: 10, display: "flex", justifyContent: "space-between" }}>
              <span>Tables:</span>
              <span style={{ fontWeight: 700, color: t.teal }}>{codegenData.db_schema?.tables?.length}</span>
            </div>
            <div style={{ fontSize: 10, display: "flex", justifyContent: "space-between" }}>
              <span>API Endpoints:</span>
              <span style={{ fontWeight: 700, color: t.blue }}>{codegenData.api_schema?.endpoints?.length}</span>
            </div>
            <div style={{ fontSize: 10, display: "flex", justifyContent: "space-between" }}>
              <span>UI Views:</span>
              <span style={{ fontWeight: 700, color: t.amber }}>{codegenData.ui_schema?.pages?.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Editor View */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Editor Toolbar */}
        <div style={{
          padding: "8px 16px", borderBottom: `1px solid ${t.bdr}`,
          background: t.paper, display: "flex", justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.sub }}>
            {fileInfo[activeFile].name} — {fileInfo[activeFile].code.split("\n").length} Lines
          </span>
          <button
            onClick={handleCopy}
            style={{
              padding: "4px 10px", borderRadius: 4, background: t.card,
              border: `1px solid ${t.bdr2}`, color: t.txt, fontSize: 10,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5
            }}>
            {copied ? "Copied! ✓" : "Copy Code"}
          </button>
        </div>

        {/* Editor Code Container */}
        <div style={{
          flex: 1, overflow: "auto", background: t.code,
          padding: 16, margin: 0, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, lineHeight: 1.5, color: t.txt
        }}>
          <pre style={{ margin: 0 }}>
            {fileInfo[activeFile].code}
          </pre>
        </div>
      </div>
    </div>
  );
};
export default PreviewTab;
