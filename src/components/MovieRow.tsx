import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '../types/content';
import { MovieCard } from './MovieCard';
import { SkeletonRow } from './SkeletonRow';
import { ErrorState } from './ErrorState';

interface MovieRowProps {
  title: string;
  movies?: ContentItem[];
  showProgress?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies = [],
  showProgress = false,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (isLoading) {
    return <SkeletonRow />;
  }

  if (isError) {
    return (
      <div className="my-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
        <ErrorState
          title={`Couldn't load "${title}"`}
          message="An error occurred while retrieving this content row."
          onRetry={onRetry}
          className="my-2"
        />
      </div>
    );
  }

  if (!movies || movies.length === 0) return null;

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row my-6 sm:my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight hover:text-[#e50914] transition-colors cursor-pointer inline-flex items-center gap-1 group/title">
          <span>{title}</span>
          <span className="text-xs text-[#e50914] opacity-0 group-hover/title:opacity-100 transition-opacity font-semibold ml-1">
            Explore All &gt;
          </span>
        </h3>
      </div>

      {/* Row Carousel Area */}
      <div className="relative">
        {/* Left Arrow Button (desktop hover) */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-r-md backdrop-blur-xs cursor-pointer shadow-xl border-r border-white/10"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-7 h-7 hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto overflow-y-visible no-scrollbar py-4 px-1 scroll-smooth snap-x snap-mandatory"
        >
          {movies.map(movie => (
            <div key={movie.id} className="snap-start shrink-0">
              <MovieCard movie={movie} showProgress={showProgress} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button (desktop hover) */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-l-md backdrop-blur-xs cursor-pointer shadow-xl border-l border-white/10"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-7 h-7 hover:scale-125 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
