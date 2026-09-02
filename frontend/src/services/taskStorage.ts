import type { TaskNode } from "../components/tools/TaskDeconstructorTool";

const STORAGE_KEY = "adhd_atlas_task_tree";

export const taskStorage = {
  getTasks(): TaskNode[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return [];
  },

  saveTasks(tasks: TaskNode[], notify = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      if (notify) {
        // Dispatch custom event for real-time sync across components
        window.dispatchEvent(new CustomEvent("adhd_atlas_tasks_updated", { detail: tasks }));
      }
    } catch {
      /* ignore */
    }
  },

  addTasks(newItems: { text: string; density?: number }[]) {
    const current = this.getTasks();
    const formatted: TaskNode[] = newItems.map((item) => ({
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      text: item.text,
      completed: false,
      subtasks: [],
      isExpanded: true,
      isLoading: false,
      density: item.density || 2,
    }));

    const updated = [...formatted, ...current];
    this.saveTasks(updated, true);
    return updated;
  },
};
