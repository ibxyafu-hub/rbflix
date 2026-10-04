import React, { useState, useEffect, useRef } from 'react';
import { Play, Info } from 'lucide-react';
import { ContentItem, Movie, isSeries } from '../types/content';
import { CinematicBackdropArt } from './MovieArt';

interface HeroBannerProps {
  items?: ContentItem[];
  onPlay: (item: ContentItem) => void;
  onMoreInfo: (item: ContentItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items = [],
  onPlay,
  onMoreInfo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);

  const featured = items.length > 0 ? items : [];
  const currentMovie = featured[currentIndex] || featured[0];

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight) {
        setScrollOffset(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Auto rotate every 6.5 seconds unless hovered
  useEffect(() => {
    if (isHovered || featured.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, featured.length]);

  if (!currentMovie) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] bg-[#1a1a1a] shimmer-bg flex items-center justify-center">
        <div className="text-zinc-600 font-bold tracking-widest text-lg">RBFLIX CINEMA</div>
      </div>
    );
  }

  const isSeriesContent = isSeries(currentMovie);
  const durationDisplay = isSeriesContent
    ? `${currentMovie.seasons?.length || 1} ${(currentMovie.seasons?.length || 1) === 1 ? 'Season' : 'Seasons'}`
    : (currentMovie as Movie).duration || '2h';

  return (
    <div
      className="relative w-full h-[80vh] min-h-[540px] max-h-[860px] md:h-[84vh] flex items-end select-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Backdrops with Crossfade & Ken Burns zoom */}
      {featured.map((movie, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={movie.id}
            style={{ 
              transition: 'opacity 1.2s var(--ease)',
              transform: `translateY(${scrollOffset * 0.25}px)`
            }}
            className={`absolute inset-0 parallax-bg ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className={`w-full h-full ${isActive ? 'animate-kenburns' : ''}`}>
              <CinematicBackdropArt movie={movie} className="h-full w-full" priority={isActive} />
            </div>
          </div>
        );
      })}

      {/* Hero Content Overlay (Staggered Animation on active slide) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 w-full">
        <div className="max-w-2xl space-y-4">
          {/* RBflix Original Tag */}
          <div 
            key={currentMovie.id + '-tag'}
            style={{ 
              transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
              transitionDelay: '0ms',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(22px)'
            }}
            className="inline-flex items-center gap-2"
          >
            {currentMovie.isOriginal && (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-widest text-[#e50914] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-ping" />
                RBFLIX <span className="text-zinc-300 font-bold tracking-wider">ORIGINAL</span>
              </span>
            )}
            <span className="text-xs text-zinc-400 font-semibold px-2 py-0.5 rounded bg-black/50 border border-zinc-700/60 backdrop-blur-xs">
              {currentMovie.quality || '4K Ultra HD'}
            </span>
          </div>

          {/* Huge Cinematic Title */}
          <h1
            key={currentMovie.id + '-title'}
            style={{ 
              transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
              transitionDelay: '120ms',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(22px)'
            }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl"
          >
            {currentMovie.title}
          </h1>

          {/* Meta text row */}
          <div 
            key={currentMovie.id + '-meta'}
            style={{ 
              transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
              transitionDelay: '240ms',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(22px)'
            }}
            className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium"
          >
            <span className="text-emerald-400 font-bold">{currentMovie.matchScore || 98}% Match</span>
            <span>{currentMovie.year}</span>
            <span>{durationDisplay}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-300">{currentMovie.genres.slice(0, 3).join(', ')}</span>
          </div>

          {/* Short description */}
          <p
            key={currentMovie.id + '-desc'}
            style={{ 
              transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
              transitionDelay: '360ms',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(22px)'
            }}
            className="text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow leading-relaxed"
          >
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div 
            key={currentMovie.id + '-btns'}
            style={{ 
              transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
              transitionDelay: '480ms',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(22px)'
            }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button
              onClick={() => onPlay(currentMovie)}
              className="flex items-center justify-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3 bg-white text-black font-bold text-sm sm:text-base rounded-md hover:bg-white/90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-black/40 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Play className="w-5 h-5 fill-black transition-transform group-hover:scale-110" />
              <span>Play</span>
            </button>

            <button
              onClick={() => onMoreInfo(currentMovie)}
              className="flex items-center justify-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3 bg-zinc-600/70 hover:bg-zinc-600/90 hover:-translate-y-0.5 text-white font-semibold text-sm sm:text-base rounded-md backdrop-blur-md active:scale-95 transition-all cursor-pointer border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <Info className="w-5 h-5 text-zinc-200" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom slide selector dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {featured.map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full h-1.5 focus-visible:outline-none ${
                idx === currentIndex
                  ? 'w-8 bg-[#e50914]'
                  : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Jump to slide ${idx + 1}: ${movie.title}`}
            />
          ))}
        </div>
      )}

      {/* Bottom edge shadow gradient transition to content rows */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141414] to-transparent z-10 pointer-events-none" />
    </div>
  );
};
