import React from 'react';

export const SkeletonRow: React.FC = () => {
  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-pulse">
      {/* Skeleton Title */}
      <div className="h-6 w-44 bg-zinc-800/80 rounded mb-4" />

      {/* Skeleton Cards Row */}
      <div className="flex gap-4 overflow-hidden pt-10 pb-16">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-none w-[160px] sm:w-[200px] md:w-[230px] lg:w-[260px] aspect-[2/3] bg-zinc-800/60 rounded-lg border border-zinc-700/30 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="p-3 absolute bottom-0 left-0 right-0 space-y-2">
              <div className="h-4 bg-zinc-700/60 rounded w-3/4" />
              <div className="h-3 bg-zinc-700/40 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
