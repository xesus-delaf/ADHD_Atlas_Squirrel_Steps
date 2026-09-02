import React from "react";
import { Check, Clock, MoveRight } from "lucide-react";
import type { TaskStep } from "../types/task";

interface TaskCardProps {
  step: TaskStep;
  totalSteps: number;
  isCompleted: boolean;
  onToggle: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  step,
  totalSteps,
  isCompleted,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className={`group relative rounded-2xl border p-5 sm:p-6 cursor-pointer transition-all duration-200 select-none ${
        isCompleted
          ? "bg-slate-900/40 border-emerald-900/40 opacity-75 shadow-none"
          : "bg-slate-900/90 border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 shadow-xl shadow-slate-950/40"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isCompleted ? "Mark step as incomplete" : "Mark step as complete"}
          className={`flex-shrink-0 mt-1 w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30"
              : "bg-slate-950 border-slate-700 group-hover:border-sky-400 text-transparent"
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? "opacity-100" : "opacity-0"}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header pill info */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                isCompleted
                  ? "bg-slate-800 text-slate-500"
                  : step.step_number === 1
                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                  : "bg-sky-950/60 text-sky-400 border border-sky-800/40"
              }`}
            >
              Step {step.step_number} of {totalSteps}
              {step.step_number === 1 && " • Zero Friction"}
            </span>

            <div
              className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md ${
                isCompleted
                  ? "bg-slate-800/50 text-slate-500"
                  : "bg-slate-800 text-slate-300 border border-slate-700/60"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{step.estimated_minutes} mins</span>
            </div>
          </div>

          {/* Actionable Title */}
          <h3
            className={`text-base sm:text-lg font-bold mb-1.5 transition-colors ${
              isCompleted
                ? "text-slate-500 line-through"
                : "text-slate-100 group-hover:text-sky-300"
            }`}
          >
            {step.title}
          </h3>

          {/* Physical instruction description */}
          <p
            className={`text-sm leading-relaxed ${
              isCompleted ? "text-slate-600 line-through" : "text-slate-300"
            }`}
          >
            {step.description}
          </p>

          {/* Visual cue for next action */}
          {!isCompleted && (
            <div className="mt-3 flex items-center space-x-1 text-xs text-sky-400 font-medium group-hover:translate-x-1 transition-transform">
              <span>Click to complete step</span>
              <MoveRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
