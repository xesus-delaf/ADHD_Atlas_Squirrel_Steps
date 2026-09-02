import React, { useState } from "react";
import { ArrowRight, Sparkles, Flame, RefreshCw } from "lucide-react";

interface TaskInputProps {
  onSubmit: (task: string) => void;
  isLoading: boolean;
}

const SAMPLE_TASKS = [
  "My room is a disaster zone with clothes, dishes, and clutter everywhere.",
  "I have been putting off filing my overdue taxes for weeks.",
  "I need to write the introductory section of a research report.",
  "My email inbox has 400 unread messages and I feel paralyzed.",
];

export const TaskInput: React.FC<TaskInputProps> = ({ onSubmit, isLoading }) => {
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || isLoading) return;
    onSubmit(task);
  };

  const handleSelectSample = (sample: string) => {
    setTask(sample);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-sky-950/20 backdrop-blur-sm">
      <div className="mb-5">
        <div className="flex items-center space-x-2 text-sky-400 mb-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            What is paralyzing you right now?
          </h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Type the overwhelming task exactly as it feels in your head. ADHD Atlas will dissect it into <strong className="text-slate-200">3–4 physical micro-steps</strong> that take under 15 minutes each.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="task-input-field"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="e.g., I need to clean my entire kitchen, do the dishes, and take out the trash, but I can't even get off the couch..."
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none text-base disabled:opacity-50"
            maxLength={1000}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-500 select-none">
            {task.length}/1000
          </div>
        </div>

        <button
          id="breakdown-submit-button"
          type="submit"
          disabled={!task.trim() || isLoading}
          className="w-full group relative inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/25 active:scale-[0.99]"
        >
          {isLoading ? (
            <span className="inline-flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Decomposing task with Gemini Flash...</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Break Down Task into Micro-Steps</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      {/* Quick sample prompt chips */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <p className="text-xs text-slate-400 font-medium mb-2.5 flex items-center space-x-1.5">
          <span>Or try one of these common overwhelm triggers:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TASKS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={isLoading}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-700/60 transition-colors line-clamp-1 max-w-full"
            >
              &ldquo;{sample}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
