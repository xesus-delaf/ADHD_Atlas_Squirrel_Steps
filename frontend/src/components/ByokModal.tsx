import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiService } from "../services/api";

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = apiService.getByokKey();
      if (existing) {
        setApiKey(existing);
        setHasExistingKey(true);
      } else {
        setApiKey("");
        setHasExistingKey(false);
      }
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setFeedback({ message: "Please enter a valid Gemini API Key.", isError: true });
      return;
    }

    if (cleanKey.length < 10) {
      setFeedback({ message: "La clave parece demasiado corta. Copia la clave completa desde Google AI Studio.", isError: true });
      return;
    }

    apiService.setByokKey(cleanKey);
    setHasExistingKey(true);
    setFeedback({ message: "Key saved locally and securely on your device!", isError: false });
    onKeyUpdated();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    apiService.removeByokKey();
    setApiKey("");
    setHasExistingKey(false);
    setFeedback({ message: "Key removed. The app will use the default configuration.", isError: false });
    onKeyUpdated();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 animate-pop-in"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(90, 74, 40, 0.08)",
          color: "var(--color-text-primary)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform active:scale-95"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
          }}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5">
          <span className="text-3xl select-none">🔑</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
              AI Settings
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Direct & private connection with your AI provider
            </p>
          </div>
        </div>

        {/* Informative Callout */}
        <div
          className="rounded-2xl p-4 text-xs leading-relaxed space-y-2"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="font-bold flex items-center space-x-1.5" style={{ color: "var(--color-text-primary)" }}>
            <span>🛡️ Privacy & Full Control</span>
          </p>
          <p style={{ color: "var(--color-text-secondary)" }}>
            For an unlimited, subscription-free experience, you can connect your own free Google Gemini key. Your key is stored exclusively on your device, locally and securely. It never passes through third-party servers.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={feedback.isError ? "banner-error" : "banner-success"}>
            <span>{feedback.isError ? "⚠️ " : "✨ "}</span>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="input-cozy pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-base"
                style={{ color: "var(--color-text-muted)" }}
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              Get your free key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
                style={{ color: "var(--color-accent-amber)" }}
              >
                Google AI Studio
              </a>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 gap-3">
            {hasExistingKey ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-ghost text-xs"
                style={{ color: "var(--color-accent-coral)" }}
              >
                <span>🗑️</span>
                <span>Remove Key</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-butter"
              >
                Save Key ✨
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
