import React from "react";

// ── Error message classifier ──────────────────────────────────
export function classifyError(err: any): { title: string; detail: string; action?: string } {
  const raw: string =
    err?.response?.data?.detail ||
    err?.message ||
    String(err) ||
    "";

  const lower = raw.toLowerCase();

  // API key problems
  if (
    lower.includes("api key") ||
    lower.includes("not configured") ||
    lower.includes("invalid api key") ||
    lower.includes("api_key") ||
    err?.response?.status === 401 ||
    err?.response?.status === 403
  ) {
    return {
      title: "API Key issue",
      detail: "Your Gemini API key is missing or invalid.",
      action: "Check the ⚙️ AI Settings button in the top-right corner.",
    };
  }

  // No model available
  if (
    lower.includes("no compatible") ||
    lower.includes("no model") ||
    lower.includes("model not found") ||
    lower.includes("404")
  ) {
    return {
      title: "No compatible model found",
      detail: "None of the available Gemini models responded for your API key.",
      action: "Try a different API key, or check your Google AI Studio quota.",
    };
  }

  // Quota / rate limit
  if (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("429") ||
    err?.response?.status === 429
  ) {
    return {
      title: "Rate limit reached",
      detail: "You've hit the request limit for your Gemini API key.",
      action: "Wait a moment and try again, or check your quota in Google AI Studio.",
    };
  }

  // Timeout
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("econnaborted") ||
    err?.code === "ECONNABORTED"
  ) {
    return {
      title: "Request timed out",
      detail: "The AI took too long to respond.",
      action: "Try again — it usually works on the second attempt.",
    };
  }

  // Network / server unreachable
  if (
    lower.includes("network error") ||
    lower.includes("econnrefused") ||
    lower.includes("failed to fetch") ||
    !err?.response
  ) {
    return {
      title: "Can't reach the server",
      detail: "The backend isn't responding. Make sure it's running.",
      action: "Run: cd backend && uvicorn app.main:app --reload",
    };
  }

  // Server error
  if (err?.response?.status >= 500) {
    return {
      title: "Server error",
      detail: raw || "Something went wrong on the server.",
    };
  }

  // Fallback — show the actual error text, not a generic message
  return {
    title: "Something went wrong",
    detail: raw || "An unexpected error occurred.",
  };
}

// ── AIErrorBanner component ───────────────────────────────────
interface AIErrorBannerProps {
  err: any;
  onDismiss?: () => void;
}

export const AIErrorBanner: React.FC<AIErrorBannerProps> = ({ err, onDismiss }) => {
  const { title, detail, action } = classifyError(err);

  return (
    <div
      style={{
        padding: "0.875rem 1rem",
        borderRadius: "14px",
        backgroundColor: "rgba(212,117,107,0.07)",
        border: "1.5px solid rgba(212,117,107,0.28)",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: "1.1rem", lineHeight: 1.4, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "var(--color-accent-coral)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "0.2rem 0 0",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.5,
          }}
        >
          {detail}
        </p>
        {action && (
          <p
            style={{
              margin: "0.3rem 0 0",
              fontSize: "0.74rem",
              color: "var(--color-text-muted)",
              fontFamily: "'Inter', sans-serif",
              fontStyle: "italic",
            }}
          >
            💡 {action}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: "1rem",
            lineHeight: 1,
            padding: "0.1rem",
            flexShrink: 0,
          }}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ── AILoadingState component ──────────────────────────────────
interface AILoadingStateProps {
  emoji?: string;
  messages: string[];           // rotating hint messages
  intervalMs?: number;
}

export const AILoadingState: React.FC<AILoadingStateProps> = ({
  emoji = "✨",
  messages,
  intervalMs = 2800,
}) => {
  const [msgIdx, setMsgIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [messages, intervalMs]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        padding: "2rem 1rem",
      }}
    >
      {/* Pulsing emoji */}
      <span
        style={{
          fontSize: "2rem",
          animation: "gentleBounce 1.4s ease-in-out infinite",
          display: "inline-block",
        }}
      >
        {emoji}
      </span>

      {/* Rotating message */}
      <p
        style={{
          margin: 0,
          fontSize: "0.82rem",
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          color: "var(--color-text-secondary)",
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
          textAlign: "center",
          maxWidth: "280px",
        }}
      >
        {messages[msgIdx]}
      </p>

      {/* Animated dots */}
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--color-text-muted)",
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
    </div>
  );
};
