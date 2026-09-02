import React from "react";
import type { ToolId } from "../types/task";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  hasByokKey: boolean;
  onOpenByokModal: () => void;
  activeTool: ToolId | null;
  onSelectTool: (tool: ToolId | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  hasByokKey,
  onOpenByokModal,
  activeTool,
  onSelectTool,
}) => {
  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1.5px solid var(--color-border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0.75rem clamp(1rem, 4vw, 2rem)",
        }}
      >
        {/* ── Left: Back + Logo ── */}
        <div className="flex items-center gap-3">
          {activeTool && (
            <button
              onClick={() => onSelectTool(null)}
              className="btn-ghost"
              title="Back to all tools"
            >
              ← Tools
            </button>
          )}

          <button
            onClick={() => onSelectTool(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Go to home"
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🧭</span>
            <div style={{ textAlign: "left" }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: "1.05rem",
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                ADHD Atlas
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                  color: "var(--color-text-muted)",
                  display: "block",
                  lineHeight: 1.1,
                }}
              >
                Squirrel Steps
              </span>
            </div>
          </button>
        </div>

        {/* ── Right: Theme toggle + API Key ── */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="btn-ghost"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* API Key / Settings Button */}
          <button
            onClick={onOpenByokModal}
            aria-label="Configure AI key"
            title="Configure AI key"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.4rem 0.875rem",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">AI Settings</span>
            {hasByokKey && (
              <span
                title="Custom key active"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent-green)",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
