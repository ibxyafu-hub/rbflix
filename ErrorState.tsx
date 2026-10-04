import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Content',
  message = 'We encountered an issue connecting to the content service. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`my-8 p-6 sm:p-8 rounded-xl bg-[#1c1c1c] border border-red-500/20 text-center max-w-xl mx-auto space-y-4 shadow-xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-[#e50914]">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e50914] hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-md transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
