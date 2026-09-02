import React, { useState } from "react";
import { BionicText } from "../BionicText";
import { AIErrorBanner, AILoadingState } from "../AIFeedback";
import { triggerDopamineCelebration } from "../DopamineCelebration";
import { apiService } from "../../services/api";
import { taskStorage } from "../../services/taskStorage";
import type { BrainDumpTodoResponse } from "../../types/task";

const PRIORITY_BADGES: Record<string, { bg: string; color: string; label: string }> = {
  HIGH:   { bg: "rgba(212, 117, 107, 0.15)", color: "var(--color-accent-coral)", label: "🔥 High" },
  MEDIUM: { bg: "rgba(201, 148, 58, 0.15)",  color: "var(--color-accent-amber)", label: "⚡ Med" },
  LOW:    { bg: "var(--color-surface-alt)",   color: "var(--color-text-secondary)", label: "🌱 Low" },
};

interface BrainDumpTodoToolProps {
  onNavigateToDeconstructor?: () => void;
}

export const BrainDumpTodoTool: React.FC<BrainDumpTodoToolProps> = ({
  onNavigateToDeconstructor,
}) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<BrainDumpTodoResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [sentItems, setSentItems] = useState<Record<number, boolean>>({});
  const [allSentSuccess, setAllSentSuccess] = useState(false);

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setAllSentSuccess(false);
    setSentItems({});
    try {
      const data = await apiService.brainDumpToTodo(text);
      setResult(data);
      setCheckedItems({});
      triggerDopamineCelebration();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (idx: number, event: React.MouseEvent) => {
    const isChecked = !checkedItems[idx];
    setCheckedItems((prev) => ({ ...prev, [idx]: isChecked }));
    if (isChecked) triggerDopamineCelebration(event.clientX, event.clientY);
  };

  // Send a single task to the Deconstructor Hub
  const handleSendSingleTask = (taskText: string, idx: number) => {
    taskStorage.addTasks([{ text: taskText, density: 2 }]);
    setSentItems((prev) => ({ ...prev, [idx]: true }));
    triggerDopamineCelebration();
  };

  // Send all tasks to Deconstructor and navigate
  const handleSendAllTasks = (autoNavigate = true) => {
    if (!result || !result.actionable_tasks.length) return;

    const itemsToAdd = result.actionable_tasks.map((t) => ({
      text: t.task,
      density: 2,
    }));

    taskStorage.addTasks(itemsToAdd);
    setAllSentSuccess(true);
    triggerDopamineCelebration();

    if (autoNavigate && onNavigateToDeconstructor) {
      setTimeout(() => {
        onNavigateToDeconstructor();
      }, 600);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-4xl inline-block">🧠</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Brain to Task
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Pour out your messy notes or chaotic thoughts. The AI will filter the emotional venting and pull out clean tasks ready to send to the <strong>Task Deconstructor</strong>.
        </p>
      </div>

      {!result ? (
        <form
          onSubmit={handleCompile}
          className="cozy-card space-y-6"
        >
          <div>
            <label
              className="block text-xs font-bold mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Free-flow thoughts, messy to-dos, or uncensored mental dump:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={5}
              placeholder="Example: I need to call the dentist, but I'm worried about tomorrow's 10am meeting, I also need to buy car oil and reply to Chris's message..."
              className="input-cozy"
            />
          </div>

          {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

          {isLoading ? (
            <AILoadingState
              emoji="🧠"
              messages={[
                "Reading through your mental dump...",
                "Filtering out emotional noise and overwhelm...",
                "Extracting clear, physical action items...",
                "Prioritizing by mental friction...",
              ]}
            />
          ) : (
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-butter w-full py-3.5 text-sm font-bold shadow-sm"
            >
              ✨ Extract Clean Tasks
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-pop-in">
          {/* Summary Context */}
          <div
            className="cozy-card p-6 flex items-start justify-between gap-4"
            style={{
              backgroundColor: "var(--color-surface-alt)",
            }}
          >
            <div>
              <span
                className="text-xs font-black uppercase tracking-wider block mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                📝 Resumen del Contexto & Ruido Emocional
              </span>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {result.emotional_context_summary}
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="btn-ghost flex-shrink-0"
            >
              <span>🔄</span>
              <span>Nuevo texto</span>
            </button>
          </div>

          {/* Action Items Header & Send All CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <h3
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              Extracted Tasks ({result.actionable_tasks.length})
            </h3>

            {/* Send All to Deconstructor Button */}
            <button
              type="button"
              onClick={() => handleSendAllTasks(true)}
              className="btn-butter py-2 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5"
              title="Guardar todas las tareas en el Deconstructor y abrirlo"
            >
              <span>🚀</span>
              <span>Enviar todas al Deconstructor y abrir</span>
            </button>
          </div>

          {/* Success Banner */}
          {allSentSuccess && (
            <div className="banner-success flex items-center justify-between">
              <span>✨ Tasks saved to your Task Deconstructor! Opening...</span>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {result.actionable_tasks.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              const isSent = !!sentItems[idx];
              const pInfo = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.LOW;

              return (
                <div
                  key={idx}
                  className="cozy-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  style={{
                    backgroundColor: isChecked ? "var(--color-surface-alt)" : "var(--color-surface)",
                    opacity: isChecked ? 0.6 : 1,
                  }}
                >
                  {/* Left: Check & Text */}
                  <div
                    onClick={(e) => toggleItem(idx, e)}
                    className="flex items-start gap-3.5 cursor-pointer flex-1 select-none"
                  >
                    <div
                      className="w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 transition-all"
                      style={{
                        backgroundColor: isChecked ? "var(--color-accent-green)" : "var(--color-surface)",
                        borderColor: isChecked ? "var(--color-accent-green)" : "var(--color-border)",
                        color: isChecked ? "#FFFFFF" : "transparent",
                      }}
                    >
                      ✓
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: pInfo.bg,
                            color: pInfo.color,
                          }}
                        >
                          {pInfo.label}
                        </span>
                        {item.quick_win && (
                          <span
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(90, 158, 111, 0.15)",
                              color: "var(--color-accent-green)",
                            }}
                          >
                            <span>⚡ Quick Win &lt; 5m</span>
                          </span>
                        )}
                      </div>

                      <p
                        className="text-sm sm:text-base font-medium leading-relaxed"
                        style={{
                          color: isChecked ? "var(--color-text-muted)" : "var(--color-text-primary)",
                          textDecoration: isChecked ? "line-through" : "none",
                        }}
                      >
                        <BionicText text={item.task} />
                      </p>
                    </div>
                  </div>

                  {/* Right Action: Send individual task to Deconstructor */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSendSingleTask(item.task, idx)}
                      className="btn-ghost py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                      style={
                        isSent
                          ? {
                              backgroundColor: "rgba(90, 158, 111, 0.15)",
                              color: "var(--color-accent-green)",
                              borderColor: "rgba(90, 158, 111, 0.3)",
                            }
                          : {}
                      }
                      title="Guardar esta tarea en el Deconstructor"
                    >
                      <span>{isSent ? "✅" : "📥"}</span>
                      <span>{isSent ? "Enviada" : "Al Deconstructor"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
