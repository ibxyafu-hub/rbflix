import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../services/contentService';
import { watchHistoryService } from '../services/watchHistoryService';
import { watchlistService } from '../services/watchlistService';
import { Movie, Series, ContentItem, Episode, WatchProgressItem } from '../types/content';

interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for Featured Content (Hero Carousel)
 */
export function useFeaturedContent(): AsyncState<ContentItem[]> {
  const [data, setData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getFeaturedContent()
      .then(items => {
        if (isMounted) {
          setData(items);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Trending Content
 */
export function useTrendingContent(): AsyncState<ContentItem[]> {
  const [data, setData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getTrendingContent()
      .then(items => {
        if (isMounted) {
          setData(items);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Top Rated Content
 */
export function useTopRatedContent(): AsyncState<ContentItem[]> {
  const [data, setData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getTopRatedContent()
      .then(items => {
        if (isMounted) {
          setData(items);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Content by Genre
 */
export function useContentByGenre(
  genre: string,
  type: 'all' | 'movie' | 'series' = 'all'
): AsyncState<ContentItem[]> {
  const [data, setData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getContentByGenre(genre, type)
      .then(items => {
        if (isMounted) {
          setData(items);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [genre, type, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Movies list with optional genre filtering
 */
export function useMovies(genre?: string): AsyncState<Movie[]> {
  const [data, setData] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getMovies(genre)
      .then(movies => {
        if (isMounted) {
          setData(movies);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [genre, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Series list with optional genre filtering
 */
export function useSeriesList(genre?: string): AsyncState<Series[]> {
  const [data, setData] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getSeries(genre)
      .then(series => {
        if (isMounted) {
          setData(series);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [genre, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for a single Content Item by ID (Movie or Series)
 */
export function useContentItem(id: string | null | undefined): AsyncState<ContentItem | null> {
  const [data, setData] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    contentService
      .getContentById(id)
      .then(item => {
        if (isMounted) {
          setData(item);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Search
 */
export function useSearchContent(query: string): AsyncState<ContentItem[]> {
  const [data, setData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const timer = setTimeout(() => {
      contentService
        .searchContent(trimmed)
        .then(results => {
          if (isMounted) {
            setData(results);
            setIsLoading(false);
          }
        })
        .catch(err => {
          if (isMounted) {
            setError(err);
            setIsError(true);
            setIsLoading(false);
          }
        });
    }, 150); // slight debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Episodes of a Series
 */
export function useEpisodes(seriesId: string | undefined, seasonNumber?: number): AsyncState<Episode[]> {
  const [data, setData] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(!!seriesId);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    if (!seriesId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    contentService
      .getEpisodes(seriesId, seasonNumber)
      .then(episodes => {
        if (isMounted) {
          setData(episodes);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [seriesId, seasonNumber, reloadTrigger]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for Continue Watching
 */
export function useWatchHistory(): {
  history: WatchProgressItem[];
  saveProgress: typeof watchHistoryService.saveProgress;
  removeProgress: typeof watchHistoryService.removeProgress;
  refresh: () => void;
} {
  const [history, setHistory] = useState<WatchProgressItem[]>(() =>
    watchHistoryService.getHistory()
  );

  const refresh = useCallback(() => {
    setHistory(watchHistoryService.getHistory());
  }, []);

  const saveProgress = useCallback(
    (...args: Parameters<typeof watchHistoryService.saveProgress>) => {
      const res = watchHistoryService.saveProgress(...args);
      refresh();
      return res;
    },
    [refresh]
  );

  const removeProgress = useCallback(
    (...args: Parameters<typeof watchHistoryService.removeProgress>) => {
      watchHistoryService.removeProgress(...args);
      refresh();
    },
    [refresh]
  );

  return { history, saveProgress, removeProgress, refresh };
}

/**
 * Hook for Watchlist
 */
export function useWatchlist(): {
  watchlistIds: string[];
  watchlistItems: ContentItem[];
  isLoading: boolean;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (id: string) => boolean;
  removeFromWatchlist: (id: string) => void;
  addToWatchlist: (id: string) => void;
  refresh: () => void;
} {
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    watchlistService.getWatchlist()
  );
  const [watchlistItems, setWatchlistItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    const ids = watchlistService.getWatchlist();
    setWatchlistIds(ids);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all(watchlistIds.map(id => contentService.getContentById(id)))
      .then(items => {
        if (isMounted) {
          setWatchlistItems(items.filter((item): item is ContentItem => item !== null));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [watchlistIds]);

  const toggleWatchlist = useCallback(
    (id: string) => {
      const added = watchlistService.toggleWatchlist(id);
      refresh();
      return added;
    },
    [refresh]
  );

  const removeFromWatchlist = useCallback(
    (id: string) => {
      watchlistService.removeFromWatchlist(id);
      refresh();
    },
    [refresh]
  );

  const addToWatchlist = useCallback(
    (id: string) => {
      watchlistService.addToWatchlist(id);
      refresh();
    },
    [refresh]
  );

  const isInWatchlist = useCallback(
    (id: string) => watchlistIds.includes(id),
    [watchlistIds]
  );

  return {
    watchlistIds,
    watchlistItems,
    isLoading,
    isInWatchlist,
    toggleWatchlist,
    removeFromWatchlist,
    addToWatchlist,
    refresh,
  };
}
