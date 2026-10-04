import { apiClient } from './client';
import { API_CONFIG } from '../../config/api.config';
import {
  Movie,
  Series,
  ContentItem,
  Episode,
  Season,
  isPublished,
  isMovie,
  isSeries,
} from '../../types/content';

/**
 * Content API Service
 * Encapsulates all backend REST endpoints for movies, series, episodes, and search.
 * Ensures the Customer Website ONLY renders content with status: 'published'.
 */
export const contentApi = {
  /**
   * Fetch published movies, with optional genre filter
   */
  async getMovies(genre?: string): Promise<Movie[]> {
    const query = genre && genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : '';
    const rawMovies = await apiClient.get<Movie[]>(`${API_CONFIG.ENDPOINTS.MOVIES}${query}`);
    return Array.isArray(rawMovies) ? rawMovies.filter(m => isPublished(m) && isMovie(m)) : [];
  },

  /**
   * Fetch single movie by ID
   */
  async getMovieById(id: string): Promise<Movie | null> {
    try {
      const movie = await apiClient.get<Movie>(API_CONFIG.ENDPOINTS.MOVIE_DETAIL(id));
      if (movie && isPublished(movie)) {
        return movie;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch published television series, with optional genre filter
   */
  async getSeries(genre?: string): Promise<Series[]> {
    const query = genre && genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : '';
    const rawSeries = await apiClient.get<Series[]>(`${API_CONFIG.ENDPOINTS.SERIES}${query}`);
    return Array.isArray(rawSeries)
      ? rawSeries
          .filter(s => isPublished(s) && isSeries(s))
          .map(s => ({
            ...s,
            seasons: Array.isArray(s.seasons)
              ? s.seasons.map(season => ({
                  ...season,
                  episodes: Array.isArray(season.episodes)
                    ? season.episodes.filter(ep => isPublished(ep))
                    : [],
                }))
              : [],
          }))
      : [];
  },

  /**
   * Fetch single TV series by ID
   */
  async getSeriesById(id: string): Promise<Series | null> {
    try {
      const s = await apiClient.get<Series>(API_CONFIG.ENDPOINTS.SERIES_DETAIL(id));
      if (s && isPublished(s)) {
        return {
          ...s,
          seasons: Array.isArray(s.seasons)
            ? s.seasons.map(season => ({
                ...season,
                episodes: Array.isArray(season.episodes)
                  ? season.episodes.filter(ep => isPublished(ep))
                  : [],
              }))
            : [],
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch generic content by ID (checks Movie or Series)
   */
  async getContentById(id: string): Promise<ContentItem | null> {
    try {
      const item = await apiClient.get<ContentItem>(`/content/${encodeURIComponent(id)}`);
      if (item && isPublished(item)) {
        return item;
      }
      return null;
    } catch {
      // Try movie endpoint then series endpoint if generic /content/:id is not supported
      const movie = await contentApi.getMovieById(id);
      if (movie) return movie;
      return contentApi.getSeriesById(id);
    }
  },

  /**
   * Fetch featured content (Hero Banner)
   */
  async getFeaturedContent(): Promise<ContentItem[]> {
    const items = await apiClient.get<ContentItem[]>(API_CONFIG.ENDPOINTS.FEATURED);
    return Array.isArray(items) ? items.filter(isPublished) : [];
  },

  /**
   * Fetch trending content
   */
  async getTrendingContent(): Promise<ContentItem[]> {
    const items = await apiClient.get<ContentItem[]>(API_CONFIG.ENDPOINTS.TRENDING);
    return Array.isArray(items) ? items.filter(isPublished) : [];
  },

  /**
   * Fetch top rated content
   */
  async getTopRatedContent(): Promise<ContentItem[]> {
    const items = await apiClient.get<ContentItem[]>(API_CONFIG.ENDPOINTS.TOP_RATED);
    return Array.isArray(items) ? items.filter(isPublished) : [];
  },

  /**
   * Fetch content by genre and optional type
   */
  async getContentByGenre(genre: string, type: 'all' | 'movie' | 'series' = 'all'): Promise<ContentItem[]> {
    const params = new URLSearchParams();
    if (genre && genre !== 'All') params.append('genre', genre);
    if (type && type !== 'all') params.append('type', type);

    const items = await apiClient.get<ContentItem[]>(`/content?${params.toString()}`);
    return Array.isArray(items) ? items.filter(isPublished) : [];
  },

  /**
   * Search published titles, cast, and genres
   */
  async searchContent(query: string): Promise<ContentItem[]> {
    const items = await apiClient.get<ContentItem[]>(
      `${API_CONFIG.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`,
      { useCache: false } // searches should be fresh
    );
    return Array.isArray(items) ? items.filter(isPublished) : [];
  },

  /**
   * Fetch published episodes for a series
   */
  async getEpisodes(seriesId: string, seasonNumber?: number): Promise<Episode[]> {
    const episodes = await apiClient.get<Episode[]>(
      API_CONFIG.ENDPOINTS.EPISODES(seriesId, seasonNumber)
    );
    return Array.isArray(episodes) ? episodes.filter(isPublished) : [];
  },

  /**
   * Fetch a specific episode by series ID and episode ID
   */
  async getEpisodeById(
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null> {
    try {
      const res = await apiClient.get<{ series: Series; season: Season; episode: Episode }>(
        `/series/${encodeURIComponent(seriesId)}/episodes/${encodeURIComponent(episodeId)}`
      );
      if (res && isPublished(res.series) && isPublished(res.episode)) {
        return res;
      }
      return null;
    } catch {
      // Fallback by retrieving series details
      const series = await contentApi.getSeriesById(seriesId);
      if (!series) return null;

      for (const season of series.seasons) {
        const episode = season.episodes.find(ep => ep.id === episodeId);
        if (episode && isPublished(episode)) {
          return { series, season, episode };
        }
      }
      return null;
    }
  },

  /**
   * Fetch all genre categories
   */
  async getCategories(): Promise<string[]> {
    const categories = await apiClient.get<string[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
    return Array.isArray(categories) ? ['All', ...categories] : ['All'];
  },

  /**
   * Fetch related content for a title
   */
  async getRelatedContent(item: ContentItem, limit: number = 6): Promise<ContentItem[]> {
    const related = await apiClient.get<ContentItem[]>(
      `${API_CONFIG.ENDPOINTS.RELATED(item.id)}?limit=${limit}`
    );
    return Array.isArray(related) ? related.filter(isPublished) : [];
  },
};
