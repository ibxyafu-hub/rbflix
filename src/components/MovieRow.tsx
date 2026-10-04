import React, { useRef, useState, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // If we're still loading, the container ref won't be attached to the DOM yet.
    if (isLoading || !containerRef.current) return;

    // Failsafe: if intersection observer doesn't fire, show anyway after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(timer);
          setTimeout(() => setIsDone(true), 1500);
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.01,
        rootMargin: '100px 0px' 
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [isLoading]); // Re-run when loading finishes to attach observer to the rendered container

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
    <div 
      ref={containerRef}
      className={`relative group/row my-4 sm:my-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-[var(--dur)] ease-[var(--ease)] ${
        isVisible ? 'translate-y-0' : 'translate-y-[20px]'
      }`}
    >
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3 overflow-hidden">
        <h3 
          style={{ transitionDelay: '100ms' }}
          className={`text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight hover:text-[#e50914] transition-all duration-[var(--dur)] ease-[var(--ease)] cursor-pointer inline-flex items-center gap-1 group/title ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-[18px] opacity-0'
          }`}
        >
          <span>{title}</span>
          <span className="text-xs text-[#e50914] opacity-0 group-hover/title:opacity-100 transition-opacity font-semibold ml-1">
            Explore All &gt;
          </span>
        </h3>
      </div>

      {/* Row Carousel Area */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="row-arrows absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-r-md backdrop-blur-xs cursor-pointer shadow-xl border-r border-white/10"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-7 h-7 hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto overflow-y-visible no-scrollbar pt-10 pb-12 px-1 scroll-smooth snap-x snap-mandatory"
        >
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`snap-start shrink-0 card-reveal ${isVisible ? 'visible' : ''} ${isDone ? 'done' : ''}`}
              style={{ transitionDelay: isDone ? '0ms' : `${Math.min(index, 7) * 60}ms` }}
            >
              <MovieCard movie={movie} showProgress={showProgress} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="row-arrows absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-l-md backdrop-blur-xs cursor-pointer shadow-xl border-l border-white/10"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-7 h-7 hover:scale-125 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
