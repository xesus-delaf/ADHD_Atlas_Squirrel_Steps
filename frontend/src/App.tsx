import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ByokModal } from "./components/ByokModal";
import { TaskDeconstructorTool } from "./components/tools/TaskDeconstructorTool";
import { DopamineSizerTool } from "./components/tools/DopamineSizerTool";
import { CbtReframingTool } from "./components/tools/CbtReframingTool";
import { BrainDumpTodoTool } from "./components/tools/BrainDumpTodoTool";
import { ToneAdjusterTool } from "./components/tools/ToneAdjusterTool";
import { FeynmanHelperTool } from "./components/tools/FeynmanHelperTool";
import { apiService } from "./services/api";
import type { ToolId } from "./types/task";

// ── Tool metadata ──────────────────────────────────────────
interface ToolCardInfo {
  id: ToolId;
  emoji: string;
  title: string;
  badge: string;
  tagline: string;
  accentColor: string; // for hover border tint
}

const TOOLS: ToolCardInfo[] = [
  {
    id: "deconstruct",
    emoji: "🐿️",
    title: "Task Deconstructor",
    badge: "Squirrel Level",
    tagline: "Split any big task into tiny, doable steps.",
    accentColor: "#5A9E6F",
  },
  {
    id: "dopaminize",
    emoji: "⚡",
    title: "The Dopamine-Sizer",
    badge: "Quest Engine",
    tagline: "Turn boring tasks into rewarding quests with micro-wins.",
    accentColor: "#C9943A",
  },
  {
    id: "cbt-reframe",
    emoji: "🌿",
    title: "Cognitive Reframing",
    badge: "Anxiety Relief",
    tagline: "Stuck in a negative spiral? Break out right now.",
    accentColor: "#6B8FC4",
  },
  {
    id: "braindump-todo",
    emoji: "🧠",
    title: "Brain to Task",
    badge: "Noise Filter",
    tagline: "Dump your mental chaos, get a clean task list.",
    accentColor: "#8A72B8",
  },
  {
    id: "tone-adjust",
    emoji: "🎯",
    title: "Objective Message Translator",
    badge: "Objective Clarity",
    tagline: "Decode confusing messages without the anxiety spiral.",
    accentColor: "#5A9E6F",
  },
  {
    id: "feynman-explain",
    emoji: "🔬",
    title: "Learning Helper",
    badge: "Feynman Technique",
    tagline: "Any complex topic, explained simply and memorably.",
    accentColor: "#8A72B8",
  },
];

// ── Theme initialiser — defaults to LIGHT ─────────────────
function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("adhd-atlas-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch { /* ignore */ }
  // Default = light (cozy cream mode)
  return false;
}

// ── App ────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDark);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [isByokModalOpen, setIsByokModalOpen] = useState<boolean>(false);
  const [hasByokKey, setHasByokKey] = useState<boolean>(false);

  // Apply / remove .dark on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("adhd-atlas-theme", isDarkMode ? "dark" : "light");
    } catch { /* ignore */ }
  }, [isDarkMode]);

  // Sync on first paint (prevents flash)
  useEffect(() => {
    const initialDark = getInitialDark();
    const root = document.documentElement;
    if (initialDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, []);

  const refreshKeyStatus = useCallback(() => {
    setHasByokKey(apiService.hasByokKey());
  }, []);

  useEffect(() => { refreshKeyStatus(); }, [refreshKeyStatus]);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const renderActiveTool = () => {
    switch (activeTool) {
      case "deconstruct":     return <TaskDeconstructorTool />;
      case "dopaminize":      return <DopamineSizerTool onNavigateToDeconstructor={() => setActiveTool("deconstruct")} />;
      case "cbt-reframe":     return <CbtReframingTool />;
      case "braindump-todo":  return <BrainDumpTodoTool onNavigateToDeconstructor={() => setActiveTool("deconstruct")} />;
      case "tone-adjust":     return <ToneAdjusterTool />;
      case "feynman-explain": return <FeynmanHelperTool />;
      default:                return null;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* ── Header ── */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        hasByokKey={hasByokKey}
        onOpenByokModal={() => setIsByokModalOpen(true)}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      {/* ── BYOK Modal ── */}
      <ByokModal
        isOpen={isByokModalOpen}
        onClose={() => setIsByokModalOpen(false)}
        onKeyUpdated={refreshKeyStatus}
      />

      {/* ── Main Content ── */}
      <main
        className="flex-1 w-full max-w-5xl mx-auto px-5 py-6 sm:py-8"
        style={{ paddingLeft: "clamp(1rem, 4vw, 2rem)", paddingRight: "clamp(1rem, 4vw, 2rem)" }}
      >
        {!activeTool ? (
          /* ── Dashboard ── */
          <div className="space-y-7 animate-fade-up">

            {/* Hero Section */}
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="text-4xl animate-float" style={{ display: "inline-block" }}>🧭</div>
              <h2
                className="text-2xl sm:text-3xl font-black leading-tight tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-text-primary)" }}
              >
                ADHD Atlas
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Small, calm tools for when things feel too big.
                <br />
                <span style={{ color: "var(--color-text-muted)" }}>
                  Pick one. Just one.
                </span>
              </p>
            </div>

            {/* 6-Tool Cozy Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {TOOLS.map((tool, i) => (
                <CozyToolCard
                  key={tool.id}
                  tool={tool}
                  index={i}
                  onClick={() => setActiveTool(tool.id)}
                />
              ))}
            </div>

            {/* Bottom — tip + coming soon + feedback, all in one quiet line */}
            <div className="text-center space-y-2">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                💛 You don&apos;t need to do everything today. One tool, one moment.
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", opacity: 0.5 }}>
                ✦ New tools coming soon&nbsp;&nbsp;·&nbsp;&nbsp;Something feel off?{" "}
                <a
                  href="mailto:feedback@adhdatlas.app"
                  style={{
                    color: "inherit",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Share feedback
                </a>
              </p>
            </div>
          </div>
        ) : (
          /* ── Active Tool View ── */
          <div className="space-y-8 animate-pop-in">
            {/* Tool Switcher Pills */}
            <div
              className="flex flex-wrap gap-2 justify-center pb-6"
              style={{ borderBottom: "1.5px solid var(--color-border-subtle)" }}
            >
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`btn-tool-pill${activeTool === tool.id ? " btn-tool-pill--active" : ""}`}
                  style={{ borderRadius: "12px" }}
                >
                  <span>{tool.emoji}</span>
                  <span>{tool.title}</span>
                </button>
              ))}
            </div>

            {/* Active Tool */}
            {renderActiveTool()}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full py-5 text-center text-xs"
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-muted)",
        }}
      >
        🧭 ADHD Atlas · Squirrel Steps · Made with care for neurodivergent minds
      </footer>
    </div>
  );
};

// ── CozyToolCard ───────────────────────────────────────────
interface CozyToolCardProps {
  tool: ToolCardInfo;
  index: number;
  onClick: () => void;
}

const CozyToolCard: React.FC<CozyToolCardProps> = ({ tool, index, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cozy-card interactive animate-pop-in flex flex-col gap-4"
      style={{
        animationDelay: `${index * 60}ms`,
        position: "relative",
        overflow: "hidden",
        borderColor: hovered ? `${tool.accentColor}55` : "var(--color-border-subtle)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 8px 28px rgba(0,0,0,0.08), 0 0 0 1.5px ${tool.accentColor}33`
          : "var(--shadow-card)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Accent bar — appears on hover */}
      <div
        className="card-accent-bar"
        style={{ backgroundColor: tool.accentColor, opacity: hovered ? 1 : 0 }}
      />

      {/* Emoji container + Badge */}
      <div className="flex items-start justify-between">
        <div
          className="tool-emoji-wrap"
          style={{
            backgroundColor: hovered ? `${tool.accentColor}18` : `${tool.accentColor}0D`,
            transition: "background-color 0.2s ease",
          }}
        >
          {tool.emoji}
        </div>
        <span
          className="badge-warm"
          style={{
            backgroundColor: hovered ? `${tool.accentColor}12` : "var(--color-surface-alt)",
            borderColor: hovered ? `${tool.accentColor}35` : "var(--color-border)",
            color: hovered ? tool.accentColor : "var(--color-text-muted)",
            transition: "all 0.2s ease",
          }}
        >
          {tool.badge}
        </span>
      </div>

      {/* Title + Tagline */}
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-bold text-base leading-snug"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: hovered ? tool.accentColor : "var(--color-text-primary)",
              transition: "color 0.15s ease",
            }}
          >
            {tool.title}
          </h3>
          <span
            style={{
              color: tool.accentColor,
              fontSize: "0.875rem",
              fontWeight: 700,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(-4px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
          >
            →
          </span>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {tool.tagline}
        </p>
      </div>
    </div>
  );
};

export default App;
