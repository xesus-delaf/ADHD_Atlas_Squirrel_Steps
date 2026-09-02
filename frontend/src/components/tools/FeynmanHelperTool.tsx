import React, { useState } from "react";
import { BionicText } from "../BionicText";
import { AIErrorBanner, AILoadingState } from "../AIFeedback";
import { apiService } from "../../services/api";
import type { FeynmanResponse } from "../../types/task";

export const FeynmanHelperTool: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<FeynmanResponse | null>(null);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.feynmanExplain(topic);
      setResult(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-4xl inline-block">🔬</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          The Hyper-Focused Learning Helper
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Learn any technical or intimidating concept broken down to its bare essentials — no jargon, just clarity.
        </p>
      </div>

      {!result ? (
        <form
          onSubmit={handleExplain}
          className="cozy-card space-y-6"
        >
          <div>
            <label
              className="block text-xs font-bold mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              What complex topic, technical term, or concept do you want to understand?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              placeholder="Example: Quantum Entanglement, Docker Containers, Economic Inflation..."
              className="input-cozy"
            />
          </div>

          {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

          {isLoading ? (
            <AILoadingState
              emoji="🔬"
              messages={[
                "Breaking it down to its core...",
                "Stripping away the jargon...",
                "Finding the perfect analogy...",
                "Almost there...",
              ]}
            />
          ) : (
            <button
              type="submit"
              disabled={!topic.trim()}
              className="btn-butter w-full py-3.5 text-sm font-bold shadow-sm"
            >
              💡 Make This Click Instantly
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Header */}
          <div
            className="cozy-card p-5 flex items-center justify-between gap-4"
          >
            <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              Topic: <span style={{ color: "var(--color-accent-purple)" }}>{result.topic}</span>
            </h3>
            <button
              onClick={() => setResult(null)}
              className="btn-ghost"
            >
              <span>🔄</span>
              <span>Learn another topic</span>
            </button>
          </div>

          {/* 5-Year-Old Explanation */}
          <div
            className="rounded-2xl p-6 space-y-2.5"
            style={{
              backgroundColor: "var(--color-cta-bg)",
              border: "1.5px solid var(--color-cta-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <span
              className="text-xs font-black uppercase tracking-widest block"
              style={{ color: "var(--color-cta-text)" }}
            >
              💡 Crystal Clear Explanation
            </span>
            <p className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
              <BionicText text={result.simple_explanation} />
            </p>
          </div>

          {/* Gaming Analogy */}
          <div className="cozy-card p-6 space-y-3">
            <div
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--color-accent-amber)" }}
            >
              <span>✨ Analogy · {result.analogy_title}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              <BionicText text={result.analogy_explanation} />
            </p>
          </div>

          {/* Key Takeaways */}
          <div
            className="cozy-card p-5 space-y-3"
            style={{ backgroundColor: "var(--color-surface-alt)" }}
          >
            <h4
              className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              <span>💡 Key Takeaways</span>
            </h4>
            <ul className="space-y-2">
              {result.key_takeaways.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span className="text-sm">🌱</span>
                  <span>
                    <BionicText text={point} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
