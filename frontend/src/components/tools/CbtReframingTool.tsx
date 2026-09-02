import React, { useState } from "react";
import { BionicText } from "../BionicText";
import { AIErrorBanner, AILoadingState } from "../AIFeedback";
import { apiService } from "../../services/api";
import type { CbtReframeResponse } from "../../types/task";

export const CbtReframingTool: React.FC = () => {
  const [brainDump, setBrainDump] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<CbtReframeResponse | null>(null);

  const handleReframe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brainDump.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.cbtReframe(brainDump);
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
        <span className="text-4xl inline-block">🌿</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Brain Dump & Cognitive Reframing
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Pour out your anxious or chaotic thoughts. The AI will spot mental traps and give you a 2-sentence calm-down phrase.
        </p>
      </div>

      {!result ? (
        <form
          onSubmit={handleReframe}
          className="cozy-card space-y-6"
        >
          <div>
            <label
              className="block text-xs font-bold mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Pour out whatever's causing you panic, guilt, or overthinking:
            </label>
            <textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder="Example: I feel so behind on everything, like everyone thinks I'm lazy and I'm going to ruin all my projects..."
              className="input-cozy"
            />
          </div>

          {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

          {isLoading ? (
            <AILoadingState
              emoji="🌿"
              messages={[
                "Reading through your thoughts...",
                "Spotting cognitive distortions gently...",
                "Drafting a calm, grounded reframe...",
                "Almost ready...",
              ]}
            />
          ) : (
            <button
              type="submit"
              disabled={!brainDump.trim()}
              className="btn-butter w-full py-3.5 text-sm font-bold shadow-sm"
            >
              🧘 Reframe Thoughts & Ease Anxiety
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Validation Banner */}
          <div
            className="cozy-card p-6 space-y-3"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: "var(--color-accent-green)" }}
              >
                <span>💛 Emotional Validation</span>
              </span>
              <button
                onClick={() => setResult(null)}
                className="btn-ghost"
              >
                <span>🔄</span>
                <span>New dump</span>
              </button>
            </div>
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              {result.validation_message}
            </p>
          </div>

          {/* Thinking Traps Identified */}
          <div className="cozy-card p-6 space-y-3">
            <h3
              className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              <span>🛡️ Thinking Traps Identified</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.detected_distortions.map((dist, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(212, 117, 107, 0.12)",
                    color: "var(--color-accent-coral)",
                    border: "1px solid rgba(212, 117, 107, 0.3)",
                  }}
                >
                  {dist}
                </span>
              ))}
            </div>
          </div>

          {/* Refugio / 2-Sentence Sanctuary Phrase */}
          <div
            className="rounded-2xl p-6 space-y-3"
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
              🛡️ Safe Space · Objective Reframe in 2 Sentences
            </span>
            <p
              className="text-base sm:text-lg font-bold leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              <BionicText text={result.reframing_phrase} />
            </p>
          </div>

          {/* 30-Second Grounding Exercise */}
          <div
            className="cozy-card p-5 flex items-center gap-4 text-xs font-medium"
            style={{ backgroundColor: "var(--color-surface-alt)" }}
          >
            <span className="text-3xl flex-shrink-0">🌬️</span>
            <div>
              <strong className="block text-sm font-bold mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                30-Second Grounding Exercise:
              </strong>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {result.grounding_action}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
