import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useContent';
import { MovieCard } from '../components/MovieCard';
import { SkeletonRow } from '../components/SkeletonRow';
import { EmptyState } from '../components/EmptyState';
import { Film, Trash2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface MyListPageProps {
  onNavigateHome: () => void;
}

export const MyListPage: React.FC<MyListPageProps> = ({ onNavigateHome }) => {
  const navigate = useNavigate();
  const { watchlistItems, isLoading, removeFromWatchlist } = useWatchlist();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');

  const filteredItems = filterType === 'all'
    ? watchlistItems
    : watchlistItems.filter(item => item.type === filterType);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My List
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-semibold">
              {watchlistItems.length} {watchlistItems.length === 1 ? 'title' : 'titles'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Personal watchlist saved across your devices.
          </p>
        </div>

        {/* Filter by Type */}
        {watchlistItems.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              All ({watchlistItems.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'movie'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType('series')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'series'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              Series
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          <SkeletonRow />
        </div>
      ) : watchlistItems.length === 0 ? (
        <EmptyState
          icon={<Film className="w-8 h-8" />}
          title="Your watchlist is currently empty"
          message="Explore movies and series on RBflix, and click the &ldquo;+&rdquo; icon to add them to your list for easy access anytime."
          actionLabel="Discover Trending Titles"
          onAction={onNavigateHome}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Film className="w-8 h-8" />}
          title={`No ${filterType === 'movie' ? 'movies' : 'series'} in your list`}
          message="Switch to 'All' to view all your saved titles."
          actionLabel="View All Saved Titles"
          onAction={() => setFilterType('all')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-10">
          {filteredItems.map(movie => (
            <div key={movie.id} className="relative group/myitem">
              <MovieCard movie={movie} />

              {/* Quick remove button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeFromWatchlist(movie.id);
                }}
                className="absolute top-2 right-2 z-40 w-7 h-7 rounded-full bg-black/80 text-zinc-400 hover:text-red-400 hover:bg-black flex items-center justify-center opacity-0 group-hover/myitem:opacity-100 transition-opacity border border-zinc-700 shadow-md cursor-pointer"
                title="Remove from My List"
                aria-label={`Remove ${movie.title} from My List`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
