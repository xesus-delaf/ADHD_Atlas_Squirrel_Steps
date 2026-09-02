import React, { useState } from "react";
import { BionicText } from "../BionicText";
import { AIErrorBanner, AILoadingState } from "../AIFeedback";
import { apiService } from "../../services/api";
import type { ToneAdjustResponse } from "../../types/task";

export const ToneAdjusterTool: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<ToneAdjustResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.adjustTone(message);
      setResult(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReply = () => {
    if (result?.suggested_calm_reply) {
      navigator.clipboard.writeText(result.suggested_calm_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-4xl inline-block">🎯</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Objective Message Translator
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Paste an ambiguous, dry, or blunt message. The AI extracts the objective facts and practical intent so you can understand it clearly without overthinking.
        </p>
      </div>

      {!result ? (
        <form
          onSubmit={handleAdjust}
          className="cozy-card space-y-6"
        >
          <div>
            <label
              className="block text-xs font-bold mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Paste the message, email, or text you want to analyze:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder="Example: 'Can we talk first thing tomorrow?' or 'Per my previous email, when can we expect this?'"
              className="input-cozy"
            />
          </div>

          {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

          {isLoading ? (
            <AILoadingState
              emoji="🎯"
              messages={[
                "Filtering out anxious interpretations...",
                "Extracting objective facts and intent...",
                "Drafting a neutral, low-friction reply...",
                "Almost there...",
              ]}
            />
          ) : (
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-butter w-full py-3.5 text-sm font-bold shadow-sm"
            >
              🎯 Translate with Objective Clarity
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Tone Header */}
          <div
            className="cozy-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Detected Tone:
              </span>
              <span
                className="px-3.5 py-1.5 rounded-full font-bold text-xs"
                style={{
                  backgroundColor: "var(--color-surface-alt)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {result.detected_tone} ({result.confidence_rating} confidence)
              </span>
            </div>
            <button
              onClick={() => setResult(null)}
              className="btn-ghost"
            >
              <span>🔄</span>
              <span>Analyze another message</span>
            </button>
          </div>

          {/* Sender Real Intent */}
          <div
            className="cozy-card p-5 space-y-1.5"
            style={{ backgroundColor: "var(--color-surface-alt)" }}
          >
            <span
              className="text-xs font-black uppercase tracking-wider block"
              style={{ color: "var(--color-text-muted)" }}
            >
              📌 What the sender actually needs (Practical Action):
            </span>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {result.sender_real_intent}
            </p>
          </div>

          {/* Objective Translation */}
          <div
            className="rounded-2xl p-6 space-y-2.5"
            style={{
              backgroundColor: "var(--color-cta-bg)",
              border: "1.5px solid var(--color-cta-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              style={{ color: "var(--color-cta-text)" }}
            >
              <span>🎯 Objective Translation · Facts & Reality</span>
            </div>
            <p
              className="text-base sm:text-lg font-bold leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              <BionicText text={result.traduccion_sin_ansiedad} />
            </p>
          </div>

          {/* Suggested Calm Reply */}
          <div className="cozy-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                <span>🕊️ Suggested Professional & Calm Reply</span>
              </span>
              <button
                onClick={copyReply}
                className="btn-ghost text-xs"
              >
                <span>{copied ? "✅ Copied" : "📋 Copy"}</span>
              </button>
            </div>
            <div
              className="p-4 rounded-xl text-sm font-mono select-all leading-relaxed"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              {result.suggested_calm_reply}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
