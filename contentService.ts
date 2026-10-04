import { IContentRepository, MockContentRepository, ApiContentRepository, SupabaseContentRepository } from './contentRepository';
import { API_CONFIG } from '../config/api.config';
import { Movie, Series, ContentItem, Episode, Season } from '../types/content';

/**
 * Determine default content repository based on environment configuration:
 * 1. Supabase (Primary production database when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present)
 * 2. ApiContentRepository (REST backend when VITE_API_URL is configured)
 * 3. MockContentRepository (Development fallback when no external backend is configured)
 */
function createDefaultRepository(): IContentRepository {
  if (API_CONFIG.IS_SUPABASE_CONFIGURED) {
    return new SupabaseContentRepository();
  }
  if (API_CONFIG.IS_BACKEND_CONFIGURED) {
    return new ApiContentRepository();
  }
  return new MockContentRepository();
}

let repository: IContentRepository = createDefaultRepository();

/**
 * Centralized Content Service
 * All UI components and hooks interact with this service.
 */
export const contentService = {
  getMovies: (genre?: string): Promise<Movie[]> => repository.getMovies(genre),
  getMovieById: (id: string): Promise<Movie | null> => repository.getMovieById(id),
  getSeries: (genre?: string): Promise<Series[]> => repository.getSeries(genre),
  getSeriesById: (id: string): Promise<Series | null> => repository.getSeriesById(id),
  getContentById: (id: string): Promise<ContentItem | null> => repository.getContentById(id),
  getAllContent: (): Promise<ContentItem[]> => repository.getAllContent(),
  getFeaturedContent: (): Promise<ContentItem[]> => repository.getFeaturedContent(),
  getTrendingContent: (): Promise<ContentItem[]> => repository.getTrendingContent(),
  getTopRatedContent: (): Promise<ContentItem[]> => repository.getTopRatedContent(),
  getContentByGenre: (genre: string, type?: 'all' | 'movie' | 'series'): Promise<ContentItem[]> =>
    repository.getContentByGenre(genre, type),
  searchContent: (query: string): Promise<ContentItem[]> => repository.searchContent(query),
  getEpisodes: (seriesId: string, seasonNumber?: number): Promise<Episode[]> =>
    repository.getEpisodes(seriesId, seasonNumber),
  getEpisodeById: (
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null> =>
    repository.getEpisodeById(seriesId, episodeId),
  getCategories: (): Promise<string[]> => repository.getCategories(),
  getRelatedContent: (item: ContentItem, limit?: number): Promise<ContentItem[]> =>
    repository.getRelatedContent(item, limit),

  /**
   * Allows dynamically overriding the content repository (e.g. for testing or live toggles)
   */
  setRepository: (customRepository: IContentRepository) => {
    repository = customRepository;
  },

  /**
   * Returns whether the active repository is currently connected to mock data
   */
  isUsingMockData: () => repository instanceof MockContentRepository,

  /**
   * Returns whether the active repository is currently connected to Supabase
   */
  isUsingSupabase: () => repository instanceof SupabaseContentRepository,
};
