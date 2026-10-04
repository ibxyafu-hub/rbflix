import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeriesList } from '../hooks/useContent';
import { MovieCard } from '../components/MovieCard';
import { MovieRow } from '../components/MovieRow';
import { SkeletonRow } from '../components/SkeletonRow';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { Filter, LayoutGrid, Rows, Tv, ArrowLeft } from 'lucide-react';

export const SeriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'rows'>('grid');

  const genres = ['All', 'Sci-Fi', 'Crime', 'Drama', 'Action', 'Comedy', 'Mystery', 'Horror'];

  const {
    data: seriesList,
    isLoading,
    isError,
    refetch,
  } = useSeriesList(selectedGenre === 'All' ? undefined : selectedGenre);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Back Navigation Breadcrumb */}
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group py-1"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            TV Series
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Binge-worthy original drama series, anime, and episodic thrillers with multi-season episodes.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('rows')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'rows'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Rows view"
            aria-label="Rows view"
          >
            <Rows className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Filter className="w-4 h-4 text-zinc-500 shrink-0 ml-1 mr-1" />
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedGenre === genre
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Content Area with Loading, Error, Empty, and Results */}
      {isLoading ? (
        <div className="space-y-6">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could Not Load Series"
          message="Failed to retrieve television series listings from the service."
          onRetry={refetch}
        />
      ) : seriesList.length === 0 ? (
        <EmptyState
          icon={<Tv className="w-8 h-8" />}
          title={`No ${selectedGenre} series found`}
          message="Try selecting a different genre or explore all series."
          actionLabel="Show All Series"
          onAction={() => setSelectedGenre('All')}
        />
      ) : viewMode === 'grid' ? (
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
            <span>Showing {seriesList.length} series</span>
            <span className="text-zinc-500 font-mono">Multiple Seasons Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {seriesList.map(series => (
              <div key={series.id} className="w-full">
                <MovieCard movie={series} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <MovieRow
            title={selectedGenre === 'All' ? 'Binge-Worthy Dramas' : `${selectedGenre} Series`}
            movies={seriesList}
          />
          <MovieRow
            title="Top Rated Series on RBflix"
            movies={seriesList.filter(s => s.isTopRated)}
          />
          <MovieRow
            title="RBflix Original Series"
            movies={seriesList.filter(s => s.isOriginal)}
          />
        </div>
      )}
    </div>
  );
};
