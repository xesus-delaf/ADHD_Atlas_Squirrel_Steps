import React from "react";
import { Sparkles, Brain, Clock, ShieldCheck } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-sm text-center">
      <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-sky-500/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
          <Brain className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2">
        Breaking Down Cognitive Overwhelm...
      </h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
        Gemini Flash is analyzing your task and generating 3–4 physically measurable micro-steps designed to bypass ADHD task paralysis.
      </p>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">Zero-Friction Start</span>
            <span className="text-slate-400">Step 1 starts effortlessly</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2.5">
          <Clock className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">&le; 15 Minutes</span>
            <span className="text-slate-400">No exhausting marathons</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">Pure Action</span>
            <span className="text-slate-400">Zero toxic positivity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
