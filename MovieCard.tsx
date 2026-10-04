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
  const inList = isInMyList(movie.id);
  const liked = isLiked(movie.id);

  // Check if there is continue watching progress for this title
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
    if (isSeriesContent && movie.seasons && movie.seasons.length > 0) {
      // Play first episode or resume last watched episode
      const targetSeason = movie.seasons[0];
      const targetEpisode = targetSeason.episodes[0];
      openPlayer(movie, targetEpisode, targetSeason);
    } else {
      openPlayer(movie);
    }
  };

  return (
    <div
      className="relative flex-none w-[170px] sm:w-[200px] md:w-[230px] lg:w-[250px] aspect-[2/3] group select-none cursor-pointer"
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
      <div className="w-full h-full rounded-md overflow-hidden bg-[#1f1f1f] shadow-md border border-zinc-800/60 transition-transform duration-300 ease-out group-hover:scale-105">
        <MoviePosterArt movie={movie} className="h-full" />

        {/* Continue Watching Progress Bar */}
        {(showProgress || progressPercent !== undefined) && progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div
              className="h-full bg-[#e50914] rounded-r-xs transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Hover Mini-Card Popover Overlay */}
      <div
        className={`absolute inset-0 z-30 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto ${
          isHovered
            ? 'opacity-100 scale-112 shadow-2xl shadow-black/90'
            : 'opacity-0 scale-100'
        }`}
      >
        <div className="w-full h-full bg-[#181818] rounded-md overflow-hidden border border-zinc-700/80 flex flex-col justify-between p-3.5">
          {/* Top Preview Banner with gradient */}
          <div className="relative -m-3.5 mb-2 h-28 bg-gradient-to-t from-[#181818] via-transparent to-black/60 overflow-hidden">
            <MoviePosterArt movie={movie} showDetails={false} className="h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

            {/* Quick Play Trigger badge over art */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handlePlayClick}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                aria-label={`Play ${movie.title}`}
              >
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Play Button */}
              <button
                type="button"
                onClick={handlePlayClick}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors shadow cursor-pointer"
                title="Play"
              >
                <Play className="w-3.5 h-3.5 fill-black translate-x-0.2" />
              </button>

              {/* Add to My List */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleMyList(movie.id);
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  inList
                    ? 'border-[#e50914] bg-[#e50914]/20 text-[#e50914]'
                    : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white bg-black/40'
                }`}
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              {/* Like Button */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleLike(movie.id);
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  liked
                    ? 'border-red-500 bg-red-500/20 text-red-500'
                    : 'border-zinc-500 hover:border-white text-zinc-300 hover:text-white bg-black/40'
                }`}
                title={liked ? 'Unlike' : 'Like'}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expand Details Trigger */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-7 h-7 rounded-full border border-zinc-500 hover:border-white text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer bg-black/40"
              title="More info"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metadata */}
          <div className="space-y-1 pt-2">
            <h5 className="font-bold text-white text-xs leading-snug line-clamp-1">
              {movie.title}
            </h5>

            <div className="flex items-center gap-1.5 text-[10px] text-zinc-300">
              <span className="text-emerald-400 font-bold">{movie.matchScore || 95}% Match</span>
              <span className="px-1 py-0.2 text-[9px] border border-zinc-600 rounded">
                {movie.maturityRating || '16+'}
              </span>
              <span>
                {isSeriesContent
                  ? `${movie.seasons?.length || 1} ${
                      (movie.seasons?.length || 1) === 1 ? 'Season' : 'Seasons'
                    }`
                  : (movie as any).duration || '2h'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 text-[10px] text-zinc-400 pt-0.5">
              {movie.genres.slice(0, 3).map((genre, i) => (
                <span key={genre} className="flex items-center gap-1">
                  <span>{genre}</span>
                  {i < Math.min(2, movie.genres.length - 1) && <span>•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
