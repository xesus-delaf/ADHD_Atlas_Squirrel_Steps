import axios from "axios";
import type {
  DeconstructResponse,
  DopamineResponse,
  CbtReframeResponse,
  BrainDumpTodoResponse,
  ToneAdjustResponse,
  FeynmanResponse,
  TaskBreakdownResponse,
} from "../types/task";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BYOK_STORAGE_KEY = "adhd_atlas_byok_api_key";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 75000,
});

// Interceptor to inject BYOK key if present
apiClient.interceptors.request.use((config) => {
  const byokKey = localStorage.getItem(BYOK_STORAGE_KEY);
  if (byokKey && byokKey.trim()) {
    config.headers["X-Goog-Api-Key"] = byokKey.trim();
  }
  return config;
});

export const apiService = {
  // 1. Task Deconstructor (🐿️ Squirrel Level)
  async deconstructTask(task: string, density: number = 2): Promise<DeconstructResponse> {
    const res = await apiClient.post<DeconstructResponse>("/deconstruct", { task: task.trim(), density });
    return res.data;
  },

  // 2. The "Dopamine-Sizer"
  async dopaminizeTask(task: string, intensity: number = 2): Promise<DopamineResponse> {
    const res = await apiClient.post<DopamineResponse>("/dopaminize", { task: task.trim(), intensity });
    return res.data;
  },

  // 3. CBT Brain Dump & Cognitive Reframing
  async cbtReframe(brainDump: string): Promise<CbtReframeResponse> {
    const res = await apiClient.post<CbtReframeResponse>("/cbt-reframe", { brain_dump: brainDump.trim() });
    return res.data;
  },

  // 4. Brain Dump to To-Do List
  async brainDumpToTodo(text: string): Promise<BrainDumpTodoResponse> {
    const res = await apiClient.post<BrainDumpTodoResponse>("/braindump-todo", { text: text.trim() });
    return res.data;
  },

  // 5. Tone Adjuster & Objective Translator
  async adjustTone(message: string): Promise<ToneAdjustResponse> {
    const res = await apiClient.post<ToneAdjustResponse>("/tone-adjust", { message: message.trim() });
    return res.data;
  },

  // 6. Hyper-Focused Learning Helper (Feynman)
  async feynmanExplain(topic: string): Promise<FeynmanResponse> {
    const res = await apiClient.post<FeynmanResponse>("/feynman-explain", { topic: topic.trim() });
    return res.data;
  },

  // Legacy Breakdown
  async breakdownTask(task: string): Promise<TaskBreakdownResponse> {
    const res = await apiClient.post<TaskBreakdownResponse>("/breakdown", { task: task.trim() });
    return res.data;
  },

  // Health
  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await apiClient.get("/health");
    return res.data;
  },

  // BYOK Storage Helpers
  getByokKey(): string | null {
    return localStorage.getItem(BYOK_STORAGE_KEY);
  },

  setByokKey(key: string): void {
    localStorage.setItem(BYOK_STORAGE_KEY, key.trim());
  },

  removeByokKey(): void {
    localStorage.removeItem(BYOK_STORAGE_KEY);
  },

  hasByokKey(): boolean {
    const key = localStorage.getItem(BYOK_STORAGE_KEY);
    return !!key && key.trim().length > 0;
  }
};
