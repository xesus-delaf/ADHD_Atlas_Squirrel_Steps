import React from "react";
import { createPortal } from "react-dom";
import { SquirrelSlider, type SquirrelSliderMode } from "./SquirrelSlider";

interface SquirrelModalProps {
  isOpen: boolean;
  value: number;
  onChange: (newValue: number) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  mode?: SquirrelSliderMode;
}

export const SquirrelModal: React.FC<SquirrelModalProps> = ({
  isOpen,
  value,
  onChange,
  onClose,
  title = "Step Granularity Level",
  subtitle = "Adjust how small you want the micro-steps to be",
  buttonLabel = "Done ✨",
  mode = "density",
}) => {
  if (!isOpen) return null;

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
      {/* Modal Dialog Card (prevent click from bubbling to backdrop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 animate-pop-in"
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
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform active:scale-95"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
          }}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5">
          <span className="text-3xl select-none">🐿️</span>
          <div>
            <h3 className="text-lg font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Slider inside modal */}
        <div className="pt-2">
          <SquirrelSlider value={value} onChange={onChange} mode={mode} />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-butter w-full py-3 text-sm font-bold shadow-sm"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
