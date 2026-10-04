import React, { useState } from 'react';
import { ContentItem, Movie, isSeries } from '../types/content';
import { Film, Award, Compass, Zap, Eye, Skull, Heart, Rocket, Play } from 'lucide-react';
import { getBackdropUrl, getPosterUrl } from '../utils/imageUtils';

interface MoviePosterArtProps {
  movie: ContentItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onImageLoad?: () => void;
}

export const MoviePosterArt: React.FC<MoviePosterArtProps> = ({
  movie,
  className = '',
  size = 'md',
  showDetails = true,
  onImageLoad,
}) => {
  const isSeriesContent = isSeries(movie);
  const posterUrl = getPosterUrl(movie);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  const posterGrad = movie.posterGradient || 'from-zinc-800 via-neutral-900 to-black';

  // Fallback genre icon
  const getGenreIcon = () => {
    if (movie.genres.includes('Sci-Fi')) return <Rocket className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Action')) return <Zap className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Horror')) return <Skull className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Romance')) return <Heart className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Historical')) return <Award className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Adventure')) return <Compass className="w-8 h-8 opacity-25" />;
    if (movie.genres.includes('Crime')) return <Eye className="w-8 h-8 opacity-25" />;
    return <Film className="w-8 h-8 opacity-25" />;
  };

  const durationDisplay = isSeriesContent
    ? `${movie.seasons?.length || 1} ${(movie.seasons?.length || 1) === 1 ? 'Season' : 'Seasons'}`
    : (movie as Movie).duration || '2h';

  const hasImage = Boolean(posterUrl && !imageError);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-md bg-[#181818] select-none transition-all shadow-md group-hover:shadow-2xl ${className}`}
    >
      {/* 1. Real TMDB Poster Image */}
      {hasImage ? (
        <div className="relative w-full h-full overflow-hidden bg-zinc-950">
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            onLoad={handleLoad}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      ) : (
        /* 2. Atmospheric Gradient Fallback */
        <div className={`w-full h-full bg-gradient-to-b ${posterGrad} flex flex-col justify-between p-3`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {getGenreIcon()}
          </div>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between gap-1 pointer-events-none">
        {movie.isOriginal ? (
          <span className="flex items-center gap-0.5 text-[9px] font-black tracking-widest text-[#e50914] bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-red-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
            RBFLIX
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-zinc-300 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded">
            {isSeriesContent ? 'SERIES' : 'FILM'}
          </span>
        )}

        {movie.isNew && (
          <span className="text-[9px] font-bold text-white bg-[#e50914] px-1.5 py-0.5 rounded tracking-wider shadow-sm uppercase">
            NEW
          </span>
        )}
      </div>

      {/* Bottom details overlay (shown on fallback, or on hover cards) */}
      {(!hasImage || showDetails) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
          <h4 className="font-extrabold text-white text-xs sm:text-sm leading-tight tracking-tight drop-shadow-md line-clamp-1">
            {movie.title}
          </h4>

          {showDetails && (
            <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-300 font-medium">
              <span className="text-emerald-400 font-semibold">{movie.matchScore || 95}% Match</span>
              <span>{movie.year}</span>
              <span className="text-[9px] text-zinc-400 truncate">{durationDisplay}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CinematicBackdropArtProps {
  movie: ContentItem;
  className?: string;
  priority?: boolean;
}

export const CinematicBackdropArt: React.FC<CinematicBackdropArtProps> = ({
  movie,
  className = '',
  priority = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Retrieve TMDB backdrop URL (or poster fallback)
  const backdropUrl = getBackdropUrl(movie);
  const backdropGrad = movie.backdropGradient || 'from-zinc-900 via-neutral-950 to-black';

  return (
    <div
      className={`relative w-full h-full bg-[#141414] overflow-hidden ${className}`}
    >
      {/* 1. Underlying Atmospheric Dark Gradient (Displayed instantly, covered smoothly once image loads) */}
      <div
        className={`absolute inset-0 w-full h-full bg-gradient-to-r ${backdropGrad} transition-opacity duration-700 ${
          imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(229,9,20,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* 2. TMDB Backdrop Image with Object-Cover & Center/Right Focal Point */}
      {backdropUrl && !imageError && (
        <img
          src={backdropUrl}
          alt={movie.title}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center md:object-[75%_25%] lg:object-right transition-opacity duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 3. Dark Overlay Over The Entire Image */}
      <div className="absolute inset-0 bg-black/35 sm:bg-black/25 pointer-events-none" />

      {/* 4. Left-to-Right Dark Gradient for Crisp Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent w-full md:w-3/4 lg:w-3/5 pointer-events-none" />

      {/* 5. Bottom Fade into RBflix Page Background (#141414) */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-60 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent pointer-events-none" />

      {/* 6. Top Vignette */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#141414]/90 via-[#141414]/40 to-transparent pointer-events-none" />
    </div>
  );
};

interface EpisodeThumbnailArtProps {
  gradient?: string;
  episodeNumber: number;
  duration: string;
  className?: string;
}

export const EpisodeThumbnailArt: React.FC<EpisodeThumbnailArtProps> = ({
  gradient = 'from-zinc-800 via-neutral-900 to-black',
  episodeNumber,
  duration,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full rounded bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-inner group/ep ${className}`}
    >
      <div className="absolute inset-0 bg-black/30 group-hover/ep:bg-black/10 transition-colors" />
      <div className="relative z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white group-hover/ep:scale-110 transition-transform">
        <Play className="w-4 h-4 fill-white translate-x-0.5" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-zinc-300">
        {duration}
      </div>
    </div>
  );
};
