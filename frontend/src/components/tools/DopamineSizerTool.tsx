import React, { useState } from "react";
import { BionicText } from "../BionicText";
import { SquirrelModal } from "../SquirrelModal";
import { AIErrorBanner, AILoadingState } from "../AIFeedback";
import { triggerDopamineCelebration } from "../DopamineCelebration";
import { apiService } from "../../services/api";
import { taskStorage } from "../../services/taskStorage";
import type { DopamineResponse } from "../../types/task";

const INTENSITY_LABELS: Record<
  number,
  { name: string; tag: string; emoji: string; color: string; desc: string }
> = {
  1: {
    name: "Gentle Boost",
    tag: "Chill & Easy",
    emoji: "🌱",
    color: "#5A9E6F",
    desc: "Lo-fi vibes, zero friction, soft micro-rewards",
  },
  2: {
    name: "Light Momentum",
    tag: "Light Momentum",
    emoji: "⚡",
    color: "#C9943A",
    desc: "A solid playlist, a podcast, and a tasty micro-reward",
  },
  3: {
    name: "High Energy",
    tag: "High Energy",
    emoji: "🔥",
    color: "#E07A5F",
    desc: "5-min speedrun mode with a video game soundtrack",
  },
  4: {
    name: "Epic Quest",
    tag: "Epic Quest",
    emoji: "🚀",
    color: "#8A72B8",
    desc: "Full immersion, boss battle music, and an epic challenge",
  },
  5: {
    name: "Maximum Overdrive",
    tag: "MAXIMUM OVERDRIVE",
    emoji: "💥",
    color: "#D4756B",
    desc: "Chaotic and over the top — legendary reward awaits",
  },
};

interface DopamineSizerToolProps {
  onNavigateToDeconstructor?: () => void;
}

export const DopamineSizerTool: React.FC<DopamineSizerToolProps> = ({
  onNavigateToDeconstructor,
}) => {
  const [task, setTask] = useState("");
  const [intensity, setIntensity] = useState(2);
  const [isSquirrelModalOpen, setIsSquirrelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<DopamineResponse | null>(null);
  const [sentToDeconstructor, setSentToDeconstructor] = useState(false);

  // Re-roll level: only the pending level, does NOT auto-fetch
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);

  const fetchDopamine = async (taskToRun: string, level: number) => {
    if (!taskToRun.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setSentToDeconstructor(false);
    try {
      const data = await apiService.dopaminizeTask(taskToRun, level);
      setResult(data);
      triggerDopamineCelebration();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGamify = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchDopamine(task, intensity);
  };

  // On the results screen: selecting a level just marks it as pending
  const handleSelectRerollLevel = (lvl: number) => {
    setPendingLevel(lvl);
  };

  // Only fires an API call when user explicitly clicks "Try this level"
  const handleConfirmReroll = async () => {
    const targetLevel = pendingLevel ?? intensity;
    setIntensity(targetLevel);
    setPendingLevel(null);
    await fetchDopamine(task, targetLevel);
  };

  const handleSendToDeconstructor = () => {
    if (!task.trim()) return;
    taskStorage.addTasks([{ text: task.trim(), density: 2 }]);
    setSentToDeconstructor(true);
    triggerDopamineCelebration();
    if (onNavigateToDeconstructor) {
      setTimeout(() => {
        onNavigateToDeconstructor();
      }, 700);
    }
  };

  const handleNewTask = () => {
    setResult(null);
    setPendingLevel(null);
  };

  const currentLevelInfo = INTENSITY_LABELS[intensity] || INTENSITY_LABELS[2];
  const activeResultLevel = result?.intensity || intensity;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-4xl inline-block">⚡</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          The Dopamine-Sizer
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Add a dopamine spark to any boring task. Get concrete strategies to make it feel rewarding and actually doable.
        </p>
      </div>

      {/* Squirrel Intensity Modal */}
      <SquirrelModal
        isOpen={isSquirrelModalOpen}
        value={intensity}
        onChange={(val) => {
          setIntensity(val);
        }}
        onClose={() => setIsSquirrelModalOpen(false)}
        mode="dopamine"
        title="Squirrel Intensity Level 🐿️"
        subtitle="1 = Gentle Boost (Chill) · 5 = Maximum Overdrive 💥"
      />

      {!result ? (
        <form
          onSubmit={handleGamify}
          className="cozy-card space-y-6"
        >
          <div>
            <label
              className="block text-xs font-bold mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              What boring, heavy, or intimidating task are you putting off?
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="e.g. Doing the pile of dishes, cleaning my desk, writing that dreadful report..."
              className="input-cozy"
            />
          </div>

          {/* Squirrel Intensity Selector Box */}
          <div
            className="p-5 rounded-2xl space-y-3.5"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1.5px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐿️</span>
                <span className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Squirrel System: Level {intensity}/5
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSquirrelModalOpen(true)}
                className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1"
                title="Open squirrel level picker"
              >
                <span>⚙️ Adjust</span>
              </button>
            </div>

            {/* Quick 1-5 Squirrel Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const info = INTENSITY_LABELS[level];
                const isSelected = intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 text-center"
                    style={{
                      backgroundColor: isSelected ? "var(--color-cta-bg)" : "var(--color-surface)",
                      color: isSelected ? "var(--color-cta-text)" : "var(--color-text-secondary)",
                      border: isSelected ? "1.5px solid var(--color-cta-border)" : "1px solid var(--color-border)",
                      boxShadow: isSelected ? "0 4px 12px rgba(90, 74, 40, 0.15)" : "none",
                      transform: isSelected ? "scale(1.03)" : "scale(1)",
                    }}
                  >
                    <span className="text-sm select-none">{"🐿️".repeat(level)}</span>
                    <span className="text-[10px] font-extrabold mt-1">
                      {level === 1 ? "1 · Gentle" : level === 5 ? "5 · Max" : `${level} · ${info.emoji}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Description of selected level */}
            <div
              className="text-xs p-3 rounded-xl flex items-center gap-2"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="text-base">{currentLevelInfo.emoji}</span>
              <div>
                <span className="font-bold block" style={{ color: "var(--color-text-primary)" }}>
                  {currentLevelInfo.name}:
                </span>
                <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  {currentLevelInfo.desc}
                </span>
              </div>
            </div>
          </div>

          {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

          {isLoading ? (
            <AILoadingState
              emoji="⚡"
              messages={[
                `Crafting Level ${intensity} dopamine boosters...`,
                "Pairing high-stimulation soundtracks...",
                "Designing micro-rewards and side quests...",
                "Almost ready to start...",
              ]}
            />
          ) : (
            <button
              type="submit"
              disabled={!task.trim()}
              className="btn-butter w-full py-3.5 text-sm font-bold shadow-sm flex items-center justify-center gap-2"
            >
              ⚡ Dopamine-Size This Task — Level {intensity}: {currentLevelInfo.name}
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Boost Quote Banner */}
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--color-cta-bg)",
              border: "1.5px solid var(--color-cta-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <span
                  className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1"
                  style={{
                    backgroundColor: "rgba(201, 148, 58, 0.15)",
                    color: "var(--color-accent-amber)",
                  }}
                >
                  {"🐿️".repeat(activeResultLevel)} Level {activeResultLevel}/5 Boost ({INTENSITY_LABELS[activeResultLevel]?.name})
                </span>
                <p
                  className="text-base sm:text-lg font-bold"
                  style={{ color: "var(--color-cta-text)" }}
                >
                  &ldquo;{result.dopamine_boost_quote}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleSendToDeconstructor}
                className="btn-butter py-2 px-3 text-xs font-bold shadow-sm"
                title="Send this task to the Deconstructor"
              >
                <span>{sentToDeconstructor ? "✓ Sent!" : "📥 Send to Deconstructor"}</span>
              </button>
              <button
                onClick={handleNewTask}
                className="btn-ghost flex-shrink-0"
              >
                <span>🔄</span>
                <span>New task</span>
              </button>
            </div>
          </div>

          {/* Squirrel Level Re-roller — select first, confirm to fetch */}
          <div
            className="p-3.5 rounded-2xl space-y-3 text-xs"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
              <span>🐿️</span>
              <span>Try a different squirrel level:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isCurrentResult = activeResultLevel === lvl && pendingLevel === null;
                const isPending = pendingLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectRerollLevel(lvl)}
                    className="px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1"
                    style={{
                      backgroundColor: isPending
                        ? "var(--color-accent-green)"
                        : isCurrentResult
                        ? "var(--color-cta-bg)"
                        : "var(--color-surface-alt)",
                      color: isPending
                        ? "#fff"
                        : isCurrentResult
                        ? "var(--color-cta-text)"
                        : "var(--color-text-secondary)",
                      border: isPending
                        ? "1.5px solid transparent"
                        : isCurrentResult
                        ? "1.5px solid var(--color-cta-border)"
                        : "1px solid var(--color-border)",
                    }}
                  >
                    <span>{"🐿️".repeat(lvl)}</span>
                    <span>{lvl}{lvl === 1 ? " (Gentle)" : lvl === 5 ? " (Max)" : ""}</span>
                  </button>
                );
              })}
            </div>

            {pendingLevel !== null && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleConfirmReroll}
                className="btn-butter w-full py-2 text-xs font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">⚡ Generating level {pendingLevel} strategies...</span>
                ) : (
                  <span>⚡ Try Level {pendingLevel} — {"🐿️".repeat(pendingLevel)} {INTENSITY_LABELS[pendingLevel]?.name}</span>
                )}
              </button>
            )}
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 gap-4">
            {result.strategies.map((strat, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 space-y-3"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  boxShadow: "0 2px 8px rgba(90,74,40,0.05)",
                }}
              >
                {/* Category pill + number */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    style={{
                      backgroundColor: "var(--color-cta-bg)",
                      color: "var(--color-cta-text)",
                      border: "1px solid var(--color-cta-border)",
                    }}
                  >
                    <span>{strat.icon || "💡"}</span>
                    <span>{strat.category || `Idea #${idx + 1}`}</span>
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-base sm:text-lg font-black leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {strat.title}
                </h3>

                {/* Main recommendation */}
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <BionicText text={strat.strategy} />
                </p>

                {/* Fun twist (optional extra detail) */}
                {(strat.fun_twist || strat.micro_reward) && (
                  <div
                    className="flex items-start gap-2.5 text-xs p-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--color-surface-alt)",
                      border: "1px solid var(--color-border-subtle)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span className="text-sm mt-0.5 flex-shrink-0">💬</span>
                    <span className="italic">{strat.fun_twist || strat.micro_reward}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
