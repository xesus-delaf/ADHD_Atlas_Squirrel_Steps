import React, { useState, useEffect, useRef } from "react";

export type SquirrelSliderMode = "density" | "dopamine";

interface SquirrelSliderProps {
  value: number; // 1 to 5
  onChange: (newValue: number) => void;
  disabled?: boolean;
  mode?: SquirrelSliderMode;
}

const DENSITY_DESCRIPTIONS = [
  { label: "Quick Overview", steps: "3 broad steps", badge: "Nivel 1 · 3 pasos" },
  { label: "Balanced", steps: "6 micro-steps", badge: "Nivel 2 · 6 pasos" },
  { label: "Detailed", steps: "9 small steps", badge: "Nivel 3 · 9 pasos" },
  { label: "Hyper-Detailed", steps: "12 tiny steps", badge: "Nivel 4 · 12 pasos" },
  { label: "Max Granularity", steps: "15 bite-sized actions", badge: "Nivel 5 · 15 pasos" },
];

const DOPAMINE_DESCRIPTIONS = [
  { label: "Chill & Gentle", steps: "Algo dopamínico (lo-fi, relax, baja fricción)", badge: "Nivel 1 · Algo dopamínico 🌱" },
  { label: "Light Momentum", steps: "Impulso ligero (playlist amena, snack rico)", badge: "Nivel 2 · Impulso Ligero ⚡" },
  { label: "High Energy", steps: "Energía alta (speedrun 5 min, OST videojuegos)", badge: "Nivel 3 · Alta Energía 🔥" },
  { label: "Epic Quest Mode", steps: "Inmersión épica (boss theme, timer con apuestas)", badge: "Nivel 4 · Modo Épico 🚀" },
  { label: "Dopamina Excesiva", steps: "¡Nivel excesivo y caótico! Hiper-estimulación total", badge: "Nivel 5 · EXCESIVO 💥" },
];

export const SquirrelSlider: React.FC<SquirrelSliderProps> = ({
  value,
  onChange,
  disabled = false,
  mode = "density",
}) => {
  const [bouncing, setBouncing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 300);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const descriptions = mode === "dopamine" ? DOPAMINE_DESCRIPTIONS : DENSITY_DESCRIPTIONS;
  const desc = descriptions[value - 1] || descriptions[0];
  const percent = ((value - 1) / 4) * 100;

  return (
    <div
      className="w-full rounded-2xl p-5 space-y-4"
      style={{
        backgroundColor: "var(--color-surface-alt)",
        border: "1.5px solid var(--color-border)",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {mode === "dopamine" ? "Intensidad de Dopamina (Ardillas)" : "Minuciosidad / Detail Level"}
        </label>

        {/* Live level badge */}
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            backgroundColor: "var(--color-cta-bg)",
            color: "var(--color-cta-text)",
            border: "1px solid var(--color-cta-border)",
          }}
        >
          {desc.badge}
        </span>
      </div>

      {/* Squirrel Emoji Display */}
      <div className="flex items-center justify-center py-2">
        <span
          key={value}
          className="text-2xl sm:text-3xl tracking-widest select-none"
          style={{
            display: "inline-block",
            transform: bouncing ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          aria-label={`Squirrel level ${value} of 5`}
        >
          {"🐿️".repeat(value)}
        </span>
      </div>

      {/* Custom Cozy Slider */}
      <div className="relative w-full">
        <div
          className="absolute top-1/2 left-0 h-2 rounded-full pointer-events-none -translate-y-1/2"
          style={{
            width: `${percent}%`,
            backgroundColor: "#E8D78A",
            transition: "width 0.15s ease",
          }}
        />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="squirrel-track w-full h-2 rounded-full cursor-pointer accent-[#D4B246]"
          aria-label="Detail level slider"
        />
      </div>

      {/* Step Numbers Selection */}
      <div className="flex justify-between px-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => !disabled && onChange(n)}
            disabled={disabled}
            className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: n === value ? "var(--color-cta-bg)" : "var(--color-surface)",
              color: n === value ? "var(--color-cta-text)" : "var(--color-text-muted)",
              border: n === value ? "1.5px solid var(--color-cta-border)" : "1px solid var(--color-border)",
              boxShadow: n === value ? "0 2px 6px rgba(90, 74, 40, 0.12)" : "none",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Friendly Description */}
      <p
        className="text-xs text-center font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {desc.label} — {desc.steps}
      </p>
    </div>
  );
};
