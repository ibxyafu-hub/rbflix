import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { ContentItem, isSeries } from '../types/content';
import { useApp } from '../context/AppContext';
import { MoviePosterArt } from './MovieArt';

interface MovieCardProps {
  movie: ContentItem;
  showProgress?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showProgress = false }) => {
  const {
    openModal,
    openPlayer,
    isInMyList,
    toggleMyList,
    isLiked,
    toggleLike,
    watchHistory,
  } = useApp();

  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const inList = isInMyList(movie.id);
  const liked = isLiked(movie.id);

  const historyItem = watchHistory.find(item => item.contentId === movie.id);
  const progressPercent = historyItem?.progressPercentage;

  const isSeriesContent = isSeries(movie);

  const handleCardClick = () => {
    if (isSeriesContent) {
      navigate(`/series/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSeriesContent) {
      // Find current progress or default to S1E1
      const historyItem = watchHistory.find(h => h.contentId === movie.id);
      if (historyItem && historyItem.episodeId) {
        navigate(`/watch/series/${movie.id}/${historyItem.episodeId}`);
      } else if (movie.seasons && movie.seasons.length > 0 && movie.seasons[0].episodes.length > 0) {
        navigate(`/watch/series/${movie.id}/${movie.seasons[0].episodes[0].id}`);
      } else {
        navigate(`/watch/series/${movie.id}/default`); // Fallback if data is missing
      }
    } else {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  return (
    <div
      className="relative flex-none w-[160px] sm:w-[200px] md:w-[230px] lg:w-[260px] aspect-[2/3] group select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          handleCardClick();
        }
      }}
    >
      {/* Base Poster Card */}
      <div 
        className="w-full h-full rounded-lg overflow-hidden bg-[#1f1f1f] border border-zinc-800/60 transition-all duration-500 ease-[var(--ease)] group-hover:opacity-0 group-hover:scale-95 relative"
      >
        <div 
          className="w-full h-full transition-all duration-1000 ease-[var(--ease)]"
          style={{ 
            filter: isImageLoaded ? 'blur(0)' : 'blur(12px)',
            opacity: isImageLoaded ? 1 : 0.5
          }}
        >
          <MoviePosterArt movie={movie} showDetails={false} className="h-full" onImageLoad={() => setIsImageLoaded(true)} />
        </div>

        {/* Title on Base Poster (Always visible/readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-black text-white leading-tight tracking-tight drop-shadow-lg line-clamp-2">
            {movie.title}
          </h3>
        </div>

        {/* Continue Watching Progress Bar */}
        {(showProgress || progressPercent !== undefined) && progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80">
            <div
              className="h-full bg-[#e50914] shadow-[0_0_8px_rgba(229,9,20,0.6)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Premium Cinematic Hover Popover */}
      <div
        className={`absolute inset-0 z-40 transition-all duration-400 ease-[var(--ease)] pointer-events-none group-hover:pointer-events-auto ${
          isHovered
            ? 'opacity-100 scale-110 -translate-y-2 visible'
            : 'opacity-0 scale-100 translate-y-0 invisible'
        }`}
      >
        <div className="w-full h-full bg-[#181818] rounded-lg overflow-hidden border border-zinc-700/50 poster-pop-shadow relative">
          {/* Full Height Artwork Area - No cropping of the original poster */}
          <div className="absolute inset-0 overflow-hidden">
            <MoviePosterArt 
              movie={movie} 
              showDetails={false} 
              className="h-full w-full transform transition-transform duration-700 ease-out group-hover:scale-105" 
            />
            
            {/* Short, very subtle bottom gradient for title readability */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            
            {/* Centered Small Play Button - Positioned to minimize subject blocking */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button
                type="button"
                onClick={handlePlayClick}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-500 hover:scale-110 hover:shadow-[0_0_15px_rgba(229,9,20,0.5)] active:scale-95 cursor-pointer border border-transparent"
                aria-label={`Play ${movie.title}`}
              >
                <Play className="w-5 h-5 fill-black translate-x-0.5" />
              </button>
            </div>

            {/* Badges */}
            {movie.isOriginal && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 z-10">
                <span className="text-[8px] font-black text-[#e50914] tracking-tighter uppercase">RBFLIX</span>
              </div>
            )}
          </div>

          {/* Info Content Area - Compact overlay at the extreme bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1 z-20">
            {/* Header Row: Icons */}
            <div className="flex items-center justify-between gap-2 hover-info-reveal" style={{ transitionDelay: '0ms' }}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePlayClick}
                  className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow cursor-pointer"
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5 fill-black translate-x-0.2" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); toggleMyList(movie.id); }}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    inList ? 'bg-white text-black border-white' : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white bg-black/40'
                  }`}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); toggleLike(movie.id); }}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    liked ? 'text-red-500 border-red-500 bg-red-500/10' : 'border-zinc-500 hover:border-white text-zinc-300 bg-black/40'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleCardClick(); }}
                className="w-7 h-7 rounded-full border border-zinc-500 hover:border-white text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer bg-black/40"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Title and Metadata Area */}
            <div className="space-y-0.5">
              <h4 className="text-[11px] sm:text-xs font-black text-white leading-tight tracking-tight hover-info-reveal line-clamp-1 drop-shadow-md" style={{ transitionDelay: '50ms' }}>
                {movie.title}
              </h4>

              <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-bold hover-info-reveal drop-shadow-md" style={{ transitionDelay: '120ms' }}>
                <span className="text-emerald-400">{movie.matchScore || 95}% Match</span>
                <span className="text-zinc-300">
                  {isSeriesContent ? `${movie.seasons?.length || 1} Season${(movie.seasons?.length || 1) > 1 ? 's' : ''}` : (movie as any).duration || '2h'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
