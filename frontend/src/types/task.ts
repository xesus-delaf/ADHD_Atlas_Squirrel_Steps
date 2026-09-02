export type ToolId =
  | "deconstruct"
  | "dopaminize"
  | "cbt-reframe"
  | "braindump-todo"
  | "tone-adjust"
  | "feynman-explain";

// 1. Task Deconstructor
export interface DeconstructStep {
  step_number: number;
  text: string;
}

export interface DeconstructResponse {
  original_task: string;
  density: number;
  step_one_only: string;
  steps: DeconstructStep[];
}

// 2. Dopamine-Sizer
export interface DopamineStrategy {
  category?: string;
  icon?: string;
  title: string;
  strategy: string;
  fun_twist?: string;
  // legacy compat
  micro_reward?: string;
}

export interface DopamineResponse {
  task: string;
  intensity?: number;
  strategies: DopamineStrategy[];
  dopamine_boost_quote: string;
}

// 3. CBT Brain Dump & Reframing
export interface CbtReframeResponse {
  detected_distortions: string[];
  validation_message: string;
  reframing_phrase: string;
  grounding_action: string;
}

// 4. Brain Dump to ToDo
export interface ActionableTaskItem {
  priority: "HIGH" | "MEDIUM" | "LOW";
  task: string;
  quick_win: boolean;
}

export interface BrainDumpTodoResponse {
  emotional_context_summary: string;
  actionable_tasks: ActionableTaskItem[];
}

// 5. Tone Adjuster
export interface ToneAdjustResponse {
  detected_tone: string;
  confidence_rating: string;
  traduccion_sin_ansiedad: string;
  sender_real_intent: string;
  suggested_calm_reply: string;
}

// 6. Feynman Learning Helper
export interface FeynmanResponse {
  topic: string;
  simple_explanation: string;
  analogy_title: string;
  analogy_explanation: string;
  key_takeaways: string[];
}

// Legacy Phase 1 schema
export interface TaskStep {
  step_number: number;
  title: string;
  description: string;
  estimated_minutes: number;
}

export interface TaskBreakdownResponse {
  original_task: string;
  summary: string;
  steps: TaskStep[];
  total_estimated_minutes: number;
}
