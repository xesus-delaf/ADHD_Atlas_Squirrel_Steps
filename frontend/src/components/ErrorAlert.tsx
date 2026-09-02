import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-rose-950/40 border border-rose-800/60 p-5 text-rose-200 shadow-xl shadow-rose-950/20 backdrop-blur-sm">
      <div className="flex items-start space-x-3.5">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-100">Something interrupted the breakdown</h4>
          <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs font-semibold transition-colors border border-rose-700/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
