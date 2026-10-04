import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<number | null>(null);

  const featured = items.length > 0 ? items : [];
  const currentMovie = featured[currentIndex] || featured[0];

  // Auto rotate every 8 seconds unless hovered
  useEffect(() => {
    if (isHovered || featured.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, featured.length]);

  if (!currentMovie) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] bg-[#1a1a1a] animate-pulse flex items-center justify-center">
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
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
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
          <div className="inline-flex items-center gap-2 transition-all duration-700 delay-100 transform translate-y-0 opacity-100">
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

          {/* Huge Cinematic Title with tight typography */}
          <h1
            key={currentMovie.id + '-title'}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {currentMovie.title}
          </h1>

          {/* Meta text row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="text-emerald-400 font-bold">{currentMovie.matchScore || 98}% Match</span>
            <span>{currentMovie.year}</span>
            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs border border-zinc-600 rounded text-zinc-300 bg-black/40">
              {currentMovie.maturityRating || '16+'}
            </span>
            <span>{durationDisplay}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-300">{currentMovie.genres.slice(0, 3).join(', ')}</span>
          </div>

          {/* Short description */}
          <p
            key={currentMovie.id + '-desc'}
            className="text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700"
          >
            {currentMovie.description}
          </p>

          {/* Action Buttons: Play (white) & More Info (translucent grey) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(currentMovie)}
              className="flex items-center justify-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3 bg-white text-black font-bold text-sm sm:text-base rounded-md hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-black/40 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Play className="w-5 h-5 fill-black transition-transform group-hover:scale-110" />
              <span>Play</span>
            </button>

            <button
              onClick={() => onMoreInfo(currentMovie)}
              className="flex items-center justify-center gap-2.5 px-6 py-2.5 sm:px-7 sm:py-3 bg-zinc-600/70 hover:bg-zinc-600/90 text-white font-semibold text-sm sm:text-base rounded-md backdrop-blur-md active:scale-95 transition-all cursor-pointer border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <Info className="w-5 h-5 text-zinc-200" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right-aligned Maturity Badge & Mute Toggle */}
      <div className="absolute right-4 sm:right-8 bottom-24 z-20 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className="w-9 h-9 rounded-full bg-black/60 border border-zinc-600/80 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-400 backdrop-blur-sm transition-colors cursor-pointer"
          aria-label={isMuted ? 'Unmute hero preview' : 'Mute hero preview'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="border-l-4 border-zinc-400 bg-black/60 backdrop-blur-sm text-zinc-200 text-xs font-bold px-3 py-1 tracking-wider uppercase">
          {currentMovie.maturityRating || '16+'}
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
