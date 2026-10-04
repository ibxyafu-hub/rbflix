import { Movie, Series, ContentItem, Episode, Season, isMovie, isSeries } from '../types/content';
import { ALL_MOCK_CONTENT, MOCK_MOVIES, MOCK_SERIES } from '../data/mockContent';
import { API_CONFIG } from '../config/api.config';
import { contentApi } from './api/contentApi';

/**
 * Interface definition for content repository.
 * The Customer Website UI and Hooks will strictly interact with this interface.
 * When the shared RBflix backend is built, we simply swap MockContentRepository for ApiContentRepository.
 */
export interface IContentRepository {
  getMovies(genre?: string): Promise<Movie[]>;
  getMovieById(id: string): Promise<Movie | null>;
  getSeries(genre?: string): Promise<Series[]>;
  getSeriesById(id: string): Promise<Series | null>;
  getContentById(id: string): Promise<ContentItem | null>;
  getAllContent(): Promise<ContentItem[]>;
  getFeaturedContent(): Promise<ContentItem[]>;
  getTrendingContent(): Promise<ContentItem[]>;
  getTopRatedContent(): Promise<ContentItem[]>;
  getContentByGenre(genre: string, type?: 'all' | 'movie' | 'series'): Promise<ContentItem[]>;
  searchContent(query: string): Promise<ContentItem[]>;
  getEpisodes(seriesId: string, seasonNumber?: number): Promise<Episode[]>;
  getEpisodeById(
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null>;
  getCategories(): Promise<string[]>;
  getRelatedContent(item: ContentItem, limit?: number): Promise<ContentItem[]>;
}

/**
 * Helper to simulate network latency for realistic UX and testing loading skeletons
 */
const delay = (ms: number = API_CONFIG.SIMULATED_DELAY_MS) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock implementation of Content Repository
 */
export class MockContentRepository implements IContentRepository {
  private movies: Movie[] = [...MOCK_MOVIES];
  private series: Series[] = [...MOCK_SERIES];
  private allContent: ContentItem[] = [...ALL_MOCK_CONTENT];

  async getMovies(genre?: string): Promise<Movie[]> {
    await delay();
    if (!genre || genre === 'All') return [...this.movies];
    return this.movies.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  }

  async getMovieById(id: string): Promise<Movie | null> {
    await delay();
    const movie = this.movies.find(m => m.id === id);
    return movie ? { ...movie } : null;
  }

  async getSeries(genre?: string): Promise<Series[]> {
    await delay();
    if (!genre || genre === 'All') return [...this.series];
    return this.series.filter(s => s.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  }

  async getSeriesById(id: string): Promise<Series | null> {
    await delay();
    const s = this.series.find(item => item.id === id);
    return s ? JSON.parse(JSON.stringify(s)) : null;
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    await delay();
    const item = this.allContent.find(c => c.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async getAllContent(): Promise<ContentItem[]> {
    await delay();
    return [...this.allContent];
  }

  async getFeaturedContent(): Promise<ContentItem[]> {
    await delay();
    return this.allContent.filter(item => item.isFeatured);
  }

  async getTrendingContent(): Promise<ContentItem[]> {
    await delay();
    return this.allContent.filter(item => item.isTrending);
  }

  async getTopRatedContent(): Promise<ContentItem[]> {
    await delay();
    return this.allContent.filter(item => item.isTopRated);
  }

  async getContentByGenre(
    genre: string,
    type: 'all' | 'movie' | 'series' = 'all'
  ): Promise<ContentItem[]> {
    await delay();
    let pool = this.allContent;
    if (type === 'movie') pool = this.movies;
    if (type === 'series') pool = this.series;

    if (!genre || genre === 'All') return [...pool];
    return pool.filter(item => item.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  }

  async searchContent(query: string): Promise<ContentItem[]> {
    await delay();
    const q = query.trim().toLowerCase();
    if (!q) return [...this.allContent];

    return this.allContent.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchGenre = item.genres.some(g => g.toLowerCase().includes(q));
      const matchCast = item.cast.some(c => c.toLowerCase().includes(q));
      const matchDirector = item.director?.toLowerCase().includes(q);
      const matchDescription = item.description.toLowerCase().includes(q);

      return matchTitle || matchGenre || matchCast || matchDirector || matchDescription;
    });
  }

  async getEpisodes(seriesId: string, seasonNumber?: number): Promise<Episode[]> {
    await delay();
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return [];

    if (seasonNumber !== undefined) {
      const season = series.seasons.find(s => s.seasonNumber === seasonNumber);
      return season ? [...season.episodes] : [];
    }

    // All episodes across seasons
    return series.seasons.flatMap(s => s.episodes);
  }

  async getEpisodeById(
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null> {
    await delay();
    const series = this.series.find(s => s.id === seriesId);
    if (!series) return null;

    for (const season of series.seasons) {
      const episode = season.episodes.find(ep => ep.id === episodeId);
      if (episode) {
        return {
          series: { ...series },
          season: { ...season },
          episode: { ...episode },
        };
      }
    }
    return null;
  }

  async getCategories(): Promise<string[]> {
    await delay();
    const genreSet = new Set<string>();
    this.allContent.forEach(item => item.genres.forEach(g => genreSet.add(g)));
    return ['All', ...Array.from(genreSet).sort()];
  }

  async getRelatedContent(item: ContentItem, limit: number = 6): Promise<ContentItem[]> {
    await delay();
    return this.allContent
      .filter(c => c.id !== item.id && c.genres.some(g => item.genres.includes(g)))
      .slice(0, limit);
  }
}

/**
 * Real API REST Backend Repository
 * Ready to be connected seamlessly when the shared RBflix backend is deployed.
 * Uses contentApi for network calls, in-memory caching, timeout handling, and published content filtering.
 */
export class ApiContentRepository implements IContentRepository {
  async getMovies(genre?: string): Promise<Movie[]> {
    return contentApi.getMovies(genre);
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return contentApi.getMovieById(id);
  }

  async getSeries(genre?: string): Promise<Series[]> {
    return contentApi.getSeries(genre);
  }

  async getSeriesById(id: string): Promise<Series | null> {
    return contentApi.getSeriesById(id);
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    return contentApi.getContentById(id);
  }

  async getAllContent(): Promise<ContentItem[]> {
    const [movies, series] = await Promise.all([
      contentApi.getMovies(),
      contentApi.getSeries(),
    ]);
    return [...movies, ...series];
  }

  async getFeaturedContent(): Promise<ContentItem[]> {
    return contentApi.getFeaturedContent();
  }

  async getTrendingContent(): Promise<ContentItem[]> {
    return contentApi.getTrendingContent();
  }

  async getTopRatedContent(): Promise<ContentItem[]> {
    return contentApi.getTopRatedContent();
  }

  async getContentByGenre(genre: string, type?: 'all' | 'movie' | 'series'): Promise<ContentItem[]> {
    return contentApi.getContentByGenre(genre, type);
  }

  async searchContent(query: string): Promise<ContentItem[]> {
    return contentApi.searchContent(query);
  }

  async getEpisodes(seriesId: string, seasonNumber?: number): Promise<Episode[]> {
    return contentApi.getEpisodes(seriesId, seasonNumber);
  }

  async getEpisodeById(
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null> {
    return contentApi.getEpisodeById(seriesId, episodeId);
  }

  async getCategories(): Promise<string[]> {
    return contentApi.getCategories();
  }

  async getRelatedContent(item: ContentItem, limit?: number): Promise<ContentItem[]> {
    return contentApi.getRelatedContent(item, limit);
  }
}

export { SupabaseContentRepository } from './supabaseRepository';

/**
 * Backward compatibility alias
 */
export const HttpContentRepository = ApiContentRepository;
export type HttpContentRepository = ApiContentRepository;
