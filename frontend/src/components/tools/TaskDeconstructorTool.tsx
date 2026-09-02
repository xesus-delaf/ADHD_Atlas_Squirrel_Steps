import React, { useState, useEffect, useRef } from "react";
import { BionicText } from "../BionicText";
import { SquirrelModal } from "../SquirrelModal";
import { AIErrorBanner } from "../AIFeedback";
import { triggerDopamineCelebration } from "../DopamineCelebration";
import { apiService } from "../../services/api";
import { taskStorage } from "../../services/taskStorage";

export interface TaskNode {
  id: string;
  text: string;
  completed: boolean;
  subtasks: TaskNode[];
  isExpanded: boolean;
  isLoading: boolean;
  density: number;
}

export const TaskDeconstructorTool: React.FC = () => {
  const [tasks, setTasks] = useState<TaskNode[]>(() => {
    return taskStorage.getTasks();
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [globalDensity, setGlobalDensity] = useState(2);
  const [isSquirrelModalOpen, setIsSquirrelModalOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  // Sync state with storage (local save without broadcast loop)
  useEffect(() => {
    taskStorage.saveTasks(tasks, false);
  }, [tasks]);

  useEffect(() => {
    const handleSync = (e?: Event) => {
      const customEvent = e as CustomEvent<TaskNode[]>;
      const updated = customEvent?.detail || taskStorage.getTasks();
      if (updated && updated.length >= 0) {
        setTasks((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
          return updated;
        });
      }
    };
    window.addEventListener("adhd_atlas_tasks_updated", handleSync);
    return () => window.removeEventListener("adhd_atlas_tasks_updated", handleSync);
  }, []);

  // Helper: Recursive update of a task in the tree
  const updateTaskInTree = (
    list: TaskNode[],
    targetId: string,
    updater: (task: TaskNode) => TaskNode
  ): TaskNode[] => {
    return list.map((item) => {
      if (item.id === targetId) {
        return updater(item);
      }
      if (item.subtasks && item.subtasks.length > 0) {
        return {
          ...item,
          subtasks: updateTaskInTree(item.subtasks, targetId, updater),
        };
      }
      return item;
    });
  };

  // Helper: Recursive deletion of a task
  const deleteTaskFromTree = (list: TaskNode[], targetId: string): TaskNode[] => {
    return list
      .filter((item) => item.id !== targetId)
      .map((item) => {
        if (item.subtasks && item.subtasks.length > 0) {
          return {
            ...item,
            subtasks: deleteTaskFromTree(item.subtasks, targetId),
          };
        }
        return item;
      });
  };

  // Add new top-level task
  const handleAddTask = (autoDeconstruct = false) => {
    const clean = newTaskText.trim();
    if (!clean) return;

    const newId = "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    const newTask: TaskNode = {
      id: newId,
      text: clean,
      completed: false,
      subtasks: [],
      isExpanded: true,
      isLoading: false,
      density: globalDensity,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText("");

    if (autoDeconstruct) {
      setTimeout(() => {
        handleDeconstructTask(newId, clean, globalDensity);
      }, 50);
    }
  };

  // Trigger AI Deconstruction on ANY task / subtask
  const handleDeconstructTask = async (
    taskId: string,
    taskText: string,
    density: number
  ) => {
    setTasks((prev) =>
      updateTaskInTree(prev, taskId, (t) => ({ ...t, isLoading: true, isExpanded: true }))
    );

    try {
      setError(null);
      const response = await apiService.deconstructTask(taskText, density);
      const steps = response.steps && response.steps.length > 0 
        ? response.steps 
        : [{ step_number: 1, text: response.step_one_only || "Get started on this step" }];

      const newSubtasks: TaskNode[] = steps.map((step) => ({
        id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
        text: step.text,
        completed: false,
        subtasks: [],
        isExpanded: true,
        isLoading: false,
        density: density,
      }));

      setTasks((prev) =>
        updateTaskInTree(prev, taskId, (t) => ({
          ...t,
          subtasks: newSubtasks,
          isLoading: false,
          isExpanded: true,
        }))
      );

      triggerDopamineCelebration();
    } catch (err: any) {
      setError(err);
      setTasks((prev) =>
        updateTaskInTree(prev, taskId, (t) => ({ ...t, isLoading: false }))
      );
    }
  };

  // Toggle completion — cascades down to subtasks, auto-completes parent if all subtasks done
  const setCompletedInTree = (
    list: TaskNode[],
    targetId: string,
    completed: boolean
  ): TaskNode[] => {
    const setAllCompleted = (node: TaskNode, val: boolean): TaskNode => ({
      ...node,
      completed: val,
      subtasks: node.subtasks.map((s) => setAllCompleted(s, val)),
    });

    const process = (items: TaskNode[]): TaskNode[] =>
      items.map((item) => {
        if (item.id === targetId) {
          // Cascade to all children
          return setAllCompleted(item, completed);
        }
        if (item.subtasks.length > 0) {
          const updatedSubs = process(item.subtasks);
          // Auto-complete parent if all subtasks are now done
          const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
          return { ...item, subtasks: updatedSubs, completed: allDone ? true : item.completed };
        }
        return item;
      });

    return process(list);
  };

  const handleToggleComplete = (taskId: string, event: React.MouseEvent) => {
    setTasks((prev) => {
      // Find current completed state of the target
      const findCompleted = (list: TaskNode[]): boolean | null => {
        for (const item of list) {
          if (item.id === taskId) return item.completed;
          const found = findCompleted(item.subtasks);
          if (found !== null) return found;
        }
        return null;
      };
      const currentlyCompleted = findCompleted(prev) ?? false;
      const nextState = !currentlyCompleted;
      if (nextState) triggerDopamineCelebration(event.clientX, event.clientY);
      return setCompletedInTree(prev, taskId, nextState);
    });
  };

  const [lastDeletedTasks, setLastDeletedTasks] = useState<{ tasks: TaskNode[]; label: string } | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Trigger undo with 4-second auto-dismiss
  const scheduleUndoDismiss = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setLastDeletedTasks(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  // Toggle expansion
  const handleToggleExpand = (taskId: string) => {
    setTasks((prev) =>
      updateTaskInTree(prev, taskId, (t) => ({ ...t, isExpanded: !t.isExpanded }))
    );
  };

  // Delete single task with Undo capability
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      setLastDeletedTasks({ tasks: prev, label: "task" });
      scheduleUndoDismiss();
      return deleteTaskFromTree(prev, taskId);
    });
  };

  // Clear completed tasks with Undo capability
  const handleClearCompleted = () => {
    const filterCompleted = (list: TaskNode[]): TaskNode[] => {
      return list
        .filter((item) => !item.completed)
        .map((item) => ({
          ...item,
          subtasks: filterCompleted(item.subtasks),
        }));
    };
    setTasks((prev) => {
      setLastDeletedTasks({ tasks: prev, label: "completed tasks" });
      scheduleUndoDismiss();
      return filterCompleted(prev);
    });
  };

  // Clear all tasks with Undo capability
  const handleClearAll = () => {
    if (tasks.length === 0) return;
    setLastDeletedTasks({ tasks: tasks, label: "all tasks" });
    scheduleUndoDismiss();
    setTasks([]);
  };

  // Undo rescue action
  const handleUndo = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (lastDeletedTasks) {
      setTasks(lastDeletedTasks.tasks);
      setLastDeletedTasks(null);
    }
  };

  // Count stats — only count leaf nodes (subtasks) when a parent has children,
  // to avoid double-counting. If a task has no subtasks, count it directly.
  const countStats = (list: TaskNode[]): { total: number; done: number } => {
    let total = 0;
    let done = 0;
    list.forEach((item) => {
      if (item.subtasks.length === 0) {
        // Leaf node — count directly
        total++;
        if (item.completed) done++;
      } else {
        // Parent with children — recurse, don't double-count the parent itself
        const sub = countStats(item.subtasks);
        total += sub.total;
        done += sub.done;
      }
    });
    return { total, done };
  };

  const { total: totalTasks, done: doneTasks } = countStats(tasks);
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <span className="text-4xl inline-block">🐿️</span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Magic Task Deconstructor
        </h2>
        <p
          className="text-sm max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Add your tasks. If one feels big or heavy, press the magic wand{" "}
          <strong>🪄</strong> to break it down as many times as you need.
        </p>
      </div>

      {/* ── Squirrel Level Pop-up Modal ── */}
      <SquirrelModal
        isOpen={isSquirrelModalOpen}
        value={globalDensity}
        onChange={setGlobalDensity}
        onClose={() => setIsSquirrelModalOpen(false)}
      />

      {/* ── Main Input Card ── */}
      <div className="cozy-card space-y-4">
        {/* Top Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask(false);
            }}
            placeholder="Add a new task or to-do item..."
            className="input-cozy flex-1 text-sm font-medium"
          />

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => handleAddTask(false)}
            disabled={!newTaskText.trim()}
            className="btn-butter px-4 py-2.5 font-black text-base flex-shrink-0"
            title="Add task to list"
          >
            <span>+</span>
            <span className="text-xs font-bold sm:hidden">Add</span>
          </button>

          {/* Squirrel Level Button (Opens Pop-up Modal) */}
          <button
            type="button"
            onClick={() => setIsSquirrelModalOpen(true)}
            className="btn-ghost px-3 py-2.5 flex-shrink-0 flex items-center gap-1.5"
            title="Open step granularity setting (🐿️)"
          >
            <span className="text-base">{"🐿️".repeat(globalDensity)}</span>
            <span className="text-[11px] font-bold text-stone-500">Level {globalDensity} ⚙️</span>
          </button>

          {/* Quick Add & Deconstruct Button */}
          <button
            type="button"
            onClick={() => handleAddTask(true)}
            disabled={!newTaskText.trim()}
            className="btn-butter px-3.5 py-2.5 text-xs font-bold flex-shrink-0 flex items-center gap-1.5"
            title="Add and auto-deconstruct with AI"
          >
            <span>🪄</span>
            <span className="hidden sm:inline">Break down</span>
          </button>
        </div>

        {error && <AIErrorBanner err={error} onDismiss={() => setError(null)} />}

        {/* Global Controls & Progress Bar */}
        {totalTasks > 0 && (
          <div
            className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            style={{ borderTop: "1px solid var(--color-border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold" style={{ color: "var(--color-text-secondary)" }}>
                Progress: {doneTasks}/{totalTasks} ({progressPercent}%)
              </span>
              <div
                className="w-32 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-surface-alt)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: "var(--color-accent-green)",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {doneTasks > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="btn-ghost text-[11px] py-1 px-2.5"
                >
                  🧹 Clear completed ({doneTasks})
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="btn-ghost text-[11px] py-1 px-2.5 text-rose-500 hover:text-rose-600"
              >
                🗑️ Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Undo Rescue Floating / Alert Banner ── */}
      {lastDeletedTasks && (
        <div
          className="rounded-xl overflow-hidden animate-pop-in shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1.5px solid var(--color-cta-border)",
          }}
        >
          <div className="p-3 px-4 flex items-center justify-between gap-3 text-xs">
            <span style={{ color: "var(--color-text-secondary)" }}>
              Deleted {lastDeletedTasks.label}. Made a mistake?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                className="btn-butter py-1 px-3 text-xs font-bold"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => {
                  if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
                  setLastDeletedTasks(null);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-1"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Subtle timer line draining over 4 seconds */}
          <div
            style={{
              height: "2px",
              backgroundColor: "var(--color-accent-amber)",
              opacity: 0.5,
              animation: "undoProgress 4s linear forwards",
            }}
          />
        </div>
      )}

      {/* ── Task Tree Container ── */}
      <div className="cozy-card space-y-2 p-4 sm:p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <span className="text-4xl block">✨</span>
            <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              No tasks yet. Ready when you are!
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Type something above (e.g. <em>&ldquo;File my taxes&rdquo;</em>) and press{" "}
              <strong>+</strong> or <strong>🪄</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskTreeItem
                key={task.id}
                task={task}
                depth={0}
                onToggleComplete={handleToggleComplete}
                onToggleExpand={handleToggleExpand}
                onDeconstruct={handleDeconstructTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Recursive Task Item Component ──
interface TaskTreeItemProps {
  task: TaskNode;
  depth: number;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onToggleExpand: (id: string) => void;
  onDeconstruct: (id: string, text: string, density: number) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

const TaskTreeItem: React.FC<TaskTreeItemProps> = ({
  task,
  depth,
  onToggleComplete,
  onToggleExpand,
  onDeconstruct,
  onDelete,
}) => {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-1.5 transition-all">
      {/* Task Row */}
      <div
        onClick={(e) => {
          onToggleComplete(task.id, e);
        }}
        className="group rounded-2xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer select-none"
        style={{
          backgroundColor: task.completed
            ? "var(--color-surface-alt)"
            : "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          boxShadow: task.completed ? "none" : "0 1px 4px rgba(90,74,40,0.04)",
          opacity: task.completed ? 0.65 : 1,
          marginLeft: depth > 0 ? `${depth * 18}px` : "0",
          borderLeft:
            depth > 0 ? "3px solid var(--color-cta-border)" : "1.5px solid var(--color-border)",
        }}
      >
        {/* Grip Handle */}
        <span
          className="text-stone-300 select-none text-xs hidden sm:inline-block cursor-grab"
          title="Elemento de lista"
        >
          ⠿
        </span>

        {/* Expand / Collapse Chevron */}
        {hasSubtasks ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(task.id);
            }}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-stone-500 hover:bg-stone-200/60 transition-colors flex-shrink-0 cursor-pointer"
            title={task.isExpanded ? "Colapsar subtareas" : "Expandir subtareas"}
          >
            {task.isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}

        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id, e);
          }}
          className="w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-xs font-black transition-all active:scale-90 cursor-pointer"
          style={{
            backgroundColor: task.completed ? "var(--color-accent-green)" : "var(--color-surface)",
            borderColor: task.completed ? "var(--color-accent-green)" : "var(--color-border)",
            color: task.completed ? "#FFFFFF" : "transparent",
          }}
          aria-label={task.completed ? "Marcar incompleta" : "Marcar completada"}
        >
          ✓
        </button>

        {/* Task Text */}
        <div className="flex-1 min-w-0 pr-1">
          <span
            className="text-sm sm:text-base font-medium block leading-snug break-words"
            style={{
              color: task.completed
                ? "var(--color-text-muted)"
                : "var(--color-text-primary)",
              textDecoration: task.completed ? "line-through" : "none",
            }}
          >
            <BionicText text={task.text} />
          </span>

          {/* Subtasks progress counter */}
          {hasSubtasks && (
            <span className="text-[11px] font-bold text-stone-400 block mt-0.5">
              {completedSubtasks}/{task.subtasks.length} subtasks done
            </span>
          )}
        </div>

        {/* Magic Breakdown Button (🪄) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeconstruct(task.id, task.text, task.density || 2);
          }}
          disabled={task.isLoading}
          className="btn-butter py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center gap-1 flex-shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          style={{
            backgroundColor: "var(--color-cta-bg)",
            borderColor: "var(--color-cta-border)",
          }}
          title="Break this task into smaller steps with AI"
        >
          {task.isLoading ? (
            <span className="animate-spin text-sm">⏳</span>
          ) : (
            <span className="text-sm">🪄</span>
          )}
          <span className="text-[11px] hidden sm:inline">
            {task.isLoading ? "Breaking down..." : "Break down"}
          </span>
        </button>

        {/* Delete Button (Instant 1-click removal with comfortable touch target) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id, e);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-stone-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all active:scale-90 flex-shrink-0 cursor-pointer"
          title="Eliminar tarea (1 clic)"
          aria-label="Eliminar tarea"
        >
          ✕
        </button>
      </div>

      {/* Subtasks Tree (Nested) */}
      {hasSubtasks && task.isExpanded && (
        <div className="space-y-1.5 pl-2 sm:pl-3 animate-pop-in">
          {task.subtasks.map((subtask) => (
            <TaskTreeItem
              key={subtask.id}
              task={subtask}
              depth={depth + 1}
              onToggleComplete={onToggleComplete}
              onToggleExpand={onToggleExpand}
              onDeconstruct={onDeconstruct}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
