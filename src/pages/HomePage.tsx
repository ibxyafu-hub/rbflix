import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { SkeletonRow } from '../components/SkeletonRow';
import { ErrorState } from '../components/ErrorState';
import {
  useFeaturedContent,
  useTrendingContent,
  useTopRatedContent,
  useContentByGenre,
  useWatchHistory,
} from '../hooks/useContent';
import { useApp } from '../context/AppContext';
import { ContentItem } from '../types/content';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { openPlayer } = useApp();

  // Load from service via hooks
  const {
    data: featured,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch: refetchFeatured,
  } = useFeaturedContent();

  const {
    data: trending,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    refetch: refetchTrending,
  } = useTrendingContent();

  const {
    data: topRated,
    isLoading: isTopRatedLoading,
    isError: isTopRatedError,
    refetch: refetchTopRated,
  } = useTopRatedContent();

  const {
    data: actionItems,
    isLoading: isActionLoading,
    isError: isActionError,
    refetch: refetchAction,
  } = useContentByGenre('Action');

  const {
    data: scifiItems,
    isLoading: isScifiLoading,
    isError: isScifiError,
    refetch: refetchScifi,
  } = useContentByGenre('Sci-Fi');

  const {
    data: comedyItems,
    isLoading: isComedyLoading,
    isError: isComedyError,
    refetch: refetchComedy,
  } = useContentByGenre('Comedy');

  const { history: watchHistory } = useWatchHistory();

  // Continue watching content list from watchHistory
  const continueWatchingItems = React.useMemo(() => {
    // Map watch history to mock items
    const allKnown = [...trending, ...topRated, ...actionItems, ...scifiItems, ...comedyItems, ...featured];
    const uniqueMap = new Map<string, ContentItem>();
    allKnown.forEach(item => uniqueMap.set(item.id, item));

    return watchHistory
      .map(hist => uniqueMap.get(hist.contentId))
      .filter((item): item is ContentItem => item !== undefined);
  }, [watchHistory, trending, topRated, actionItems, scifiItems, comedyItems, featured]);

  // Extract RBflix Originals
  const originals = React.useMemo(() => {
    const all = [...trending, ...topRated, ...actionItems, ...scifiItems, ...comedyItems, ...featured];
    const uniqueMap = new Map<string, ContentItem>();
    all.forEach(i => {
      if (i.isOriginal) uniqueMap.set(i.id, i);
    });
    return Array.from(uniqueMap.values());
  }, [trending, topRated, actionItems, scifiItems, comedyItems, featured]);

  return (
    <div className="min-h-screen pb-12 animate-in fade-in duration-300">
      {/* Hero Banner */}
      {isFeaturedLoading ? (
        <div className="w-full h-[70vh] min-h-[500px] bg-[#1a1a1a] animate-pulse flex items-center justify-center">
          <div className="text-zinc-600 font-bold tracking-widest text-lg">RBFLIX CINEMA</div>
        </div>
      ) : isFeaturedError ? (
        <div className="pt-24 px-4">
          <ErrorState
            title="Failed to Load Featured Titles"
            message="Could not load the featured spotlight content."
            onRetry={refetchFeatured}
          />
        </div>
      ) : (
        <HeroBanner
          items={featured}
          onPlay={openPlayer}
          onMoreInfo={(item) => navigate(item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`)}
        />
      )}

      {/* Rows Container */}
      <div className="-mt-12 sm:-mt-16 relative z-30 space-y-2">
        {/* Continue Watching (Only if items exist) */}
        {continueWatchingItems.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatchingItems}
            showProgress={true}
          />
        )}

        {/* Trending Now */}
        <MovieRow
          title="Trending Now"
          movies={trending}
          isLoading={isTrendingLoading}
          isError={isTrendingError}
          onRetry={refetchTrending}
        />

        {/* Top Rated on RBflix */}
        <MovieRow
          title="Top Rated on RBflix"
          movies={topRated}
          isLoading={isTopRatedLoading}
          isError={isTopRatedError}
          onRetry={refetchTopRated}
        />

        {/* RBflix Originals */}
        {originals.length > 0 && (
          <MovieRow
            title="RBflix Originals"
            movies={originals}
          />
        )}

        {/* Action & Thrillers */}
        <MovieRow
          title="Action & Thrillers"
          movies={actionItems}
          isLoading={isActionLoading}
          isError={isActionError}
          onRetry={refetchAction}
        />

        {/* Sci-Fi & Future Worlds */}
        <MovieRow
          title="Sci-Fi & Future Worlds"
          movies={scifiItems}
          isLoading={isScifiLoading}
          isError={isScifiError}
          onRetry={refetchScifi}
        />

        {/* Comedy Hits */}
        <MovieRow
          title="Comedy Hits"
          movies={comedyItems}
          isLoading={isComedyLoading}
          isError={isComedyError}
          onRetry={refetchComedy}
        />
      </div>
    </div>
  );
};
