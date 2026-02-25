"use client";

import { useState } from "react";

export default function Home() {

  const [question, setQuestion] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showHBR, setShowHBR] = useState(true);
  const [boardMode, setBoardMode] = useState(false);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setData(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      const result = await response.json();
      setData(result);

      setHistory(prev => [question, ...prev.slice(0, 9)]);

    } catch {
      setData({ answer: "System unavailable." });
    }

    setLoading(false);
  };

  const renderSections = (answer: string) => {
    const sections = answer.split(/\n(?=\d\.)/);

    return sections.map((section: string, index: number) => {
      const lines = section.split("\n");
      const title = lines[0];
      const content = lines.slice(1).join("\n");

      if (boardMode && !title.includes("Executive Summary")) return null;
      if (!showHBR && title.includes("HBR")) return null;

      const isOpen = expandedSections.includes(title);

      return (
        <div key={index} style={styles.sectionBlock}>
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection(title)}
          >
            {title}
            <span style={styles.chevron}>{isOpen ? "−" : "+"}</span>
          </div>

          {isOpen && (
            <div style={styles.sectionContent}>
              {content}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <main style={styles.background}>

      {/* Sidebar History */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Session</div>
        {history.map((h, i) => (
          <div key={i} style={styles.historyItem}>
            {h}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        <div style={styles.header}>
          <h1 style={styles.title}>Agentic Exec</h1>
          <div style={styles.subtitle}>Executive Intelligence Console</div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <label>
            <input type="checkbox" checked={showHBR} onChange={() => setShowHBR(!showHBR)} />
            Include HBR
          </label>

          <label>
            <input type="checkbox" checked={boardMode} onChange={() => setBoardMode(!boardMode)} />
            Board Mode
          </label>

          <button style={styles.smallButton}>Download PDF</button>
          <button style={styles.smallButton}>Copy Summary</button>
        </div>

        {/* Input */}
        <div style={styles.inputWrapper}>
          <textarea
            placeholder="Enter executive question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={styles.textarea}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Processing..." : "Analyse"}
          </button>
        </div>

        {/* Answer */}
        {data?.answer && (
          <div style={styles.answerCard}>
            {renderSections(data.answer)}
          </div>
        )}

        {/* Sources */}
        {data?.citations?.length > 0 && (
          <div style={styles.sourcesPanel}>
            <div style={styles.sourcesHeader}>Intelligence Sources</div>

            {data.citations.map((c: any, index: number) => {

              const embedUrl =
                c.youtube_url && c.youtube_url.includes("watch?v=")
                  ? c.youtube_url.replace("watch?v=", "embed/")
                  : c.youtube_url;

              return (
                <div key={index} style={styles.sourceCard}>

                  <div style={styles.sourceMeta}>
                    {c.source_type?.toUpperCase()}
                  </div>

                  <div style={styles.sourceTitle}>
                    {c.episode_title}
                  </div>

                  {c.timestamp && (
                    <div style={styles.timestamp}>{c.timestamp}</div>
                  )}

                  {c.source_type === "podcast" && c.youtube_url && (
                    <iframe
                      width="100%"
                      height="315"
                      src={embedUrl}
                      frameBorder="0"
                      allowFullScreen
                    />
                  )}

                  {c.source_type === "hbr" && (
                    <details style={styles.hbrExpand}>
                      <summary>View Executive Brief</summary>
                      <div style={styles.hbrContent}>{c.text}</div>
                    </details>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

const styles: any = {

  background: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #111319, #0c0e12)",
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif"
  },

  sidebar: {
    width: "240px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    padding: "30px 20px"
  },

  sidebarHeader: {
    textTransform: "uppercase",
    fontSize: "12px",
    opacity: 0.6,
    marginBottom: "20px"
  },

  historyItem: {
    fontSize: "13px",
    opacity: 0.7,
    marginBottom: "12px"
  },

  main: {
    flex: 1,
    padding: "50px"
  },

  header: {
    marginBottom: "30px"
  },

  title: {
    fontSize: "32px",
    fontWeight: 300
  },

  subtitle: {
    fontSize: "12px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    opacity: 0.5
  },

  controls: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
    fontSize: "13px",
    alignItems: "center"
  },

  smallButton: {
    padding: "6px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer"
  },

  inputWrapper: {
    display: "flex",
    gap: "15px",
    marginBottom: "40px"
  },

  textarea: {
    flex: 1,
    padding: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    resize: "none"
  },

  primaryButton: {
    padding: "12px 24px",
    background: "#1f2430",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer"
  },

  answerCard: {
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "30px",
    marginBottom: "40px"
  },

  sectionBlock: {
    marginBottom: "20px"
  },

  sectionHeader: {
    fontSize: "14px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between"
  },

  chevron: {
    opacity: 0.5
  },

  sectionContent: {
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: 1.6,
    opacity: 0.85
  },

  sourcesPanel: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "30px"
  },

  sourcesHeader: {
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.2em",
    opacity: 0.6,
    marginBottom: "20px"
  },

  sourceCard: {
    marginBottom: "30px"
  },

  sourceMeta: {
    fontSize: "11px",
    opacity: 0.5
  },

  sourceTitle: {
    marginBottom: "5px"
  },

  timestamp: {
    fontSize: "12px",
    opacity: 0.5,
    marginBottom: "10px"
  },

  hbrExpand: {
    marginTop: "10px",
    fontSize: "13px"
  },

  hbrContent: {
    marginTop: "10px",
    opacity: 0.8
  }
};