import React, { useState } from "react";
import { Clock, RotateCcw, CheckCircle2, ListOrdered, Sparkles } from "lucide-react";
import type { TaskBreakdownResponse } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TaskBreakdownListProps {
  data: TaskBreakdownResponse;
  onReset: () => void;
}

export const TaskBreakdownList: React.FC<TaskBreakdownListProps> = ({
  data,
  onReset,
}) => {
  // Local completion state tracked by step_number
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const totalSteps = data.steps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const isAllCompleted = completedCount === totalSteps;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-950/40 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Decomposed Action Plan</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{data.summary}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-medium">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Total ~{data.total_estimated_minutes} mins</span>
            </div>

            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="pt-5">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-400">
              Progress: <span className="text-slate-200">{completedCount} of {totalSteps} completed</span>
            </span>
            <span className={isAllCompleted ? "text-emerald-400" : "text-sky-400"}>
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500"
                  : "bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sm shadow-sky-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isAllCompleted && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-center space-x-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold">All micro-steps finished!</p>
                <p className="text-xs text-emerald-400/80">
                  You conquered executive dysfunction and took real physical action.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <div className="flex items-center space-x-1.5">
            <ListOrdered className="w-4 h-4 text-sky-400" />
            <span>Execute one step at a time:</span>
          </div>
          <span>Click any card when done</span>
        </div>

        {data.steps.map((step) => (
          <TaskCard
            key={step.step_number}
            step={step}
            totalSteps={totalSteps}
            isCompleted={!!completedSteps[step.step_number]}
            onToggle={() => toggleStep(step.step_number)}
          />
        ))}
      </div>
    </div>
  );
};
