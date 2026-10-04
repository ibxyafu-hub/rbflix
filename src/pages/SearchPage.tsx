import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSearchContent } from '../hooks/useContent';
import { MovieCard } from '../components/MovieCard';
import { SkeletonRow } from '../components/SkeletonRow';
import { EmptyState } from '../components/EmptyState';
import { Search, X, Loader2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface SearchPageProps {
  onClearSearch: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onClearSearch }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useApp();
  const { data: searchResults, isLoading, isError, refetch } = useSearchContent(searchQuery);

  const queryClean = searchQuery.trim();

  const popularSearches = [
    'Sci-Fi',
    'Action',
    'Cyberpunk',
    'Crime',
    'Thriller',
    'Comedy',
    'Drama',
    '4K Ultra HD',
  ];

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Search Results</span>
              {queryClean && (
                <span className="text-sm font-normal text-zinc-400">
                  for &ldquo;<span className="text-white font-semibold">{searchQuery}</span>&rdquo;
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isLoading
                ? 'Searching content repository...'
                : `Found ${searchResults.length} matching ${
                    searchResults.length === 1 ? 'title' : 'titles'
                  }`}
            </p>
          </div>

          {/* Quick Clear Button */}
          {queryClean && (
            <button
              onClick={onClearSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-md border border-zinc-700/50 self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        {/* Popular Search Suggestions Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-zinc-500 shrink-0 font-medium">Quick search:</span>
          {popularSearches.map(term => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                queryClean.toLowerCase() === term.toLowerCase()
                  ? 'bg-[#e50914] text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid or States */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-4 justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-[#e50914]" />
            <span>Finding matching movies and series...</span>
          </div>
          <SkeletonRow />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="Search Failed"
          message="An error occurred while querying the content repository."
          actionLabel="Retry Search"
          onAction={refetch}
        />
      ) : !queryClean ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="Search for Movies & TV Series"
          message="Enter titles, actor names, directors, or genres in the search bar above to find content."
          actionLabel="Explore Trending"
          onAction={() => setSearchQuery('Sci-Fi')}
        />
      ) : searchResults.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title={`No results found for "${searchQuery}"`}
          message="Try searching for a different title, actor, or explore popular categories like Action or Sci-Fi."
          actionLabel="Search Action Titles"
          onAction={() => setSearchQuery('Action')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-10">
          {searchResults.map(movie => (
            <div key={movie.id} className="w-full">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
