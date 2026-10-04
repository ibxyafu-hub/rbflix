import React from 'react';
import { Film } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`py-16 sm:py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 px-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
        {icon || <Film className="w-8 h-8" />}
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{message}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-6 py-2.5 bg-[#e50914] hover:bg-red-700 text-white font-bold rounded-md text-xs sm:text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
