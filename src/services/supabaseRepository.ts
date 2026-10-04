import { IContentRepository } from './contentRepository';
import { Movie, Series, ContentItem, Episode, Season, ContentStatus, isPublished } from '../types/content';
import { getSupabaseClient } from './supabaseClient';
import { normalizeTmdbImageUrl } from '../utils/imageUtils';

/**
 * Helper to safely parse Postgres text array format {"A","B"}, JSON strings, or arrays
 */
function parseArrayField(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Check for Postgres array format: {Action,"Sci-Fi",Drama}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      return inner
        .split(',')
        .map(s => s.replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
    }
    // Check for JSON array: ["Action", "Sci-Fi"]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {
        // Fallback to comma separation
      }
    }
    // Standard comma-separated string
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Maps a public.movies database record to frontend Movie domain model
 */
function mapMovieRecord(row: any): Movie {
  const genres = parseArrayField(row.genres);
  const cast = parseArrayField(row.cast_members || row.cast);
  const rating = Number(row.rating) || 8.0;

  const rawBackdrop = row.backdrop_path || row.backdrop_url || row.backdropUrl || row.backdropPath;
  const rawPoster = row.poster_path || row.poster_url || row.posterUrl || row.posterPath;

  const backdropUrl = normalizeTmdbImageUrl(rawBackdrop, 'original');
  const posterUrl = normalizeTmdbImageUrl(rawPoster, 'w780');

  return {
    id: String(row.id),
    title: row.title || 'Untitled Movie',
    description: row.description || '',
    year: Number(row.year) || new Date().getFullYear(),
    rating,
    matchScore: Number(row.match_score) || Math.min(99, Math.round(rating * 10 + 5)),
    duration: row.duration || '1h 45m',
    genres: genres.length > 0 ? genres : ['Action'],
    cast,
    director: row.director || undefined,
    posterUrl,
    backdropUrl,
    poster_path: rawPoster || undefined,
    backdrop_path: rawBackdrop || undefined,
    posterGradient: row.poster_gradient || undefined,
    backdropGradient: row.backdrop_gradient || undefined,
    trailerUrl: row.trailer_url || row.trailerUrl || undefined,
    amharicSubtitleUrl: row.amharic_subtitle_url || row.amharicSubtitleUrl || undefined,
    videoUrl: row.video_url || row.videoUrl || undefined,
    embedUrl: row.embed_url || row.embedUrl || undefined,
    isOriginal: Boolean(row.is_original ?? false),
    isFeatured: Boolean(row.is_featured ?? false),
    isNew: Boolean(row.is_new ?? false),
    isTrending: Boolean(row.is_trending ?? row.is_featured ?? false),
    isTopRated: Boolean(row.is_top_rated ?? (rating >= 8.5)),
    maturityRating: row.maturity_rating || '16+',
    quality: row.quality || '4K Ultra HD',
    type: 'movie',
    status: (row.status || 'published') as ContentStatus,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

/**
 * Maps a public.series database record to frontend Series domain model
 */
function mapSeriesRecord(row: any, seasons: Season[] = []): Series {
  const genres = parseArrayField(row.genres);
  const cast = parseArrayField(row.cast_members || row.cast);
  const rating = Number(row.rating) || 8.0;

  const rawBackdrop = row.backdrop_path || row.backdrop_url || row.backdropUrl || row.backdropPath;
  const rawPoster = row.poster_path || row.poster_url || row.posterUrl || row.posterPath;

  const backdropUrl = normalizeTmdbImageUrl(rawBackdrop, 'original');
  const posterUrl = normalizeTmdbImageUrl(rawPoster, 'w780');

  return {
    id: String(row.id),
    title: row.title || 'Untitled Series',
    description: row.description || '',
    year: Number(row.year) || new Date().getFullYear(),
    rating,
    matchScore: Number(row.match_score) || Math.min(99, Math.round(rating * 10 + 5)),
    genres: genres.length > 0 ? genres : ['Drama'],
    cast,
    director: row.director || undefined,
    posterUrl,
    backdropUrl,
    poster_path: rawPoster || undefined,
    backdrop_path: rawBackdrop || undefined,
    posterGradient: row.poster_gradient || undefined,
    backdropGradient: row.backdrop_gradient || undefined,
    trailerUrl: row.trailer_url || row.trailerUrl || undefined,
    amharicSubtitleUrl: row.amharic_subtitle_url || row.amharicSubtitleUrl || undefined,
    isOriginal: Boolean(row.is_original ?? false),
    isFeatured: Boolean(row.is_featured ?? false),
    isNew: Boolean(row.is_new ?? false),
    isTrending: Boolean(row.is_trending ?? row.is_featured ?? false),
    isTopRated: Boolean(row.is_top_rated ?? (rating >= 8.5)),
    maturityRating: row.maturity_rating || '16+',
    quality: row.quality || '4K Ultra HD',
    type: 'series',
    status: (row.status || 'published') as ContentStatus,
    totalSeasons: seasons.length || Number(row.total_seasons) || 1,
    seasons,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

/**
 * Maps a public.episodes record to Episode domain model
 */
function mapEpisodeRecord(row: any, seasonNumberFallback: number = 1): Episode {
  return {
    id: String(row.id),
    seriesId: row.series_id ? String(row.series_id) : undefined,
    seasonNumber: Number(row.season_number) || seasonNumberFallback,
    episodeNumber: Number(row.episode_number) || 1,
    title: row.title || `Episode ${row.episode_number || 1}`,
    description: row.description || '',
    duration: row.duration || '45m',
    thumbnailUrl: row.thumbnail_url || row.thumbnailUrl || undefined,
    thumbnailGradient: row.thumbnail_gradient || undefined,
    videoUrl: row.video_url || row.videoUrl || undefined,
    embedUrl: row.embed_url || row.embedUrl || undefined,
    amharicSubtitleUrl: row.amharic_subtitle_url || row.amharicSubtitleUrl || undefined,
    status: (row.status || 'published') as ContentStatus,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

/**
 * Supabase Content Repository
 * Connects the RBflix Customer Website directly to the live Supabase PostgreSQL database.
 * Strictly reads only published content (status = 'published') and published episodes.
 */
export class SupabaseContentRepository implements IContentRepository {
  private get client() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
  }

  /**
   * Fetch published movies, with optional genre filter
   */
  async getMovies(genre?: string): Promise<Movie[]> {
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getMovies error:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      const mapped = data.map(mapMovieRecord);
      if (!genre || genre === 'All') {
        return mapped;
      }
      return mapped.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    } catch (err) {
      console.error('Failed to query movies from Supabase:', err);
      return [];
    }
  }

  /**
   * Fetch single published movie by ID
   */
  async getMovieById(id: string): Promise<Movie | null> {
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error || !data) return null;
      return mapMovieRecord(data);
    } catch {
      return null;
    }
  }

  /**
   * Helper to load seasons and published episodes for series
   */
  private async loadSeasonsForSeries(seriesIds: string[]): Promise<Map<string, Season[]>> {
    const resultMap = new Map<string, Season[]>();
    if (seriesIds.length === 0) return resultMap;

    try {
      // Fetch seasons belonging to published series
      const { data: seasonsData } = await this.client
        .from('seasons')
        .select('*')
        .in('series_id', seriesIds)
        .order('season_number', { ascending: true });

      // Fetch published episodes
      const { data: episodesData } = await this.client
        .from('episodes')
        .select('*')
        .in('series_id', seriesIds)
        .eq('status', 'published')
        .order('episode_number', { ascending: true });

      const seasonsList = Array.isArray(seasonsData) ? seasonsData : [];
      const episodesList = Array.isArray(episodesData) ? episodesData : [];

      // Map episodes to season
      for (const sId of seriesIds) {
        const seriesSeasons = seasonsList.filter((s: any) => String(s.series_id) === sId);
        const seriesEpisodes = episodesList.filter((ep: any) => String(ep.series_id) === sId);

        if (seriesSeasons.length > 0) {
          const builtSeasons: Season[] = seriesSeasons.map((s: any) => {
            const seasonEpList = seriesEpisodes
              .filter((ep: any) => String(ep.season_id) === String(s.id) || Number(ep.season_number) === Number(s.season_number))
              .map((ep: any) => mapEpisodeRecord(ep, Number(s.season_number) || 1));

            return {
              id: String(s.id),
              seasonNumber: Number(s.season_number) || 1,
              title: s.title || `Season ${s.season_number || 1}`,
              episodes: seasonEpList,
            };
          });
          resultMap.set(sId, builtSeasons);
        } else if (seriesEpisodes.length > 0) {
          // If seasons table has no explicit rows, group episodes by season_number
          const seasonMap = new Map<number, Episode[]>();
          seriesEpisodes.forEach((ep: any) => {
            const sn = Number(ep.season_number) || 1;
            if (!seasonMap.has(sn)) seasonMap.set(sn, []);
            seasonMap.get(sn)!.push(mapEpisodeRecord(ep, sn));
          });

          const builtSeasons: Season[] = Array.from(seasonMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([seasonNum, eps]) => ({
              id: `s-${sId}-${seasonNum}`,
              seasonNumber: seasonNum,
              title: `Season ${seasonNum}`,
              episodes: eps,
            }));
          resultMap.set(sId, builtSeasons);
        } else {
          resultMap.set(sId, []);
        }
      }
    } catch (err) {
      console.error('Error fetching seasons/episodes from Supabase:', err);
    }

    return resultMap;
  }

  /**
   * Fetch published television series, with optional genre filter
   */
  async getSeries(genre?: string): Promise<Series[]> {
    try {
      const { data, error } = await this.client
        .from('series')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error || !data || !Array.isArray(data)) return [];

      const seriesIds = data.map((s: any) => String(s.id));
      const seasonsBySeries = await this.loadSeasonsForSeries(seriesIds);

      const mapped: Series[] = data.map((row: any) => {
        const sId = String(row.id);
        const seasons = seasonsBySeries.get(sId) || [];
        return mapSeriesRecord(row, seasons);
      });

      if (!genre || genre === 'All') {
        return mapped;
      }
      return mapped.filter(s => s.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    } catch (err) {
      console.error('Failed to query series from Supabase:', err);
      return [];
    }
  }

  /**
   * Fetch single published series by ID with its seasons & published episodes
   */
  async getSeriesById(id: string): Promise<Series | null> {
    try {
      const { data, error } = await this.client
        .from('series')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error || !data) return null;

      const seasonsMap = await this.loadSeasonsForSeries([String(data.id)]);
      const seasons = seasonsMap.get(String(data.id)) || [];

      return mapSeriesRecord(data, seasons);
    } catch {
      return null;
    }
  }

  /**
   * Fetch generic content by ID (Movie or Series)
   */
  async getContentById(id: string): Promise<ContentItem | null> {
    const movie = await this.getMovieById(id);
    if (movie) return movie;
    return this.getSeriesById(id);
  }

  /**
   * Fetch all published movies and series
   */
  async getAllContent(): Promise<ContentItem[]> {
    const [movies, series] = await Promise.all([this.getMovies(), this.getSeries()]);
    return [...movies, ...series];
  }

  /**
   * Fetch featured content (Hero Banner)
   */
  async getFeaturedContent(): Promise<ContentItem[]> {
    try {
      const [movies, series] = await Promise.all([this.getMovies(), this.getSeries()]);
      const allPublished = [...movies, ...series];
      const featured = allPublished.filter(item => item.isFeatured);

      // If featured flag is set on items, return them
      if (featured.length > 0) {
        return featured;
      }

      // If no items explicitly flagged as featured, spotlight the highest rated / newest published items
      return allPublished.slice(0, 5);
    } catch {
      return [];
    }
  }

  /**
   * Fetch trending content
   */
  async getTrendingContent(): Promise<ContentItem[]> {
    const all = await this.getAllContent();
    const trending = all.filter(item => item.isTrending);
    return trending.length > 0 ? trending : all.slice(0, 10);
  }

  /**
   * Fetch top rated content
   */
  async getTopRatedContent(): Promise<ContentItem[]> {
    const all = await this.getAllContent();
    const topRated = all.filter(item => item.isTopRated || item.rating >= 8.2);
    return (topRated.length > 0 ? topRated : all)
      .slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }

  /**
   * Fetch content by genre and optional type
   */
  async getContentByGenre(genre: string, type: 'all' | 'movie' | 'series' = 'all'): Promise<ContentItem[]> {
    if (type === 'movie') return this.getMovies(genre);
    if (type === 'series') return this.getSeries(genre);

    const [movies, series] = await Promise.all([this.getMovies(genre), this.getSeries(genre)]);
    return [...movies, ...series];
  }

  /**
   * Search published titles, cast members, and genres in Supabase
   */
  async searchContent(query: string): Promise<ContentItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllContent();

    const all = await this.getAllContent();
    return all.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchGenre = item.genres.some(g => g.toLowerCase().includes(q));
      const matchCast = item.cast.some(c => c.toLowerCase().includes(q));
      const matchDirector = item.director?.toLowerCase().includes(q);
      const matchDescription = item.description.toLowerCase().includes(q);

      return matchTitle || matchGenre || matchCast || matchDirector || matchDescription;
    });
  }

  /**
   * Fetch published episodes for a series
   */
  async getEpisodes(seriesId: string, seasonNumber?: number): Promise<Episode[]> {
    try {
      let query = this.client
        .from('episodes')
        .select('*')
        .eq('series_id', seriesId)
        .eq('status', 'published')
        .order('episode_number', { ascending: true });

      if (seasonNumber !== undefined) {
        query = query.eq('season_number', seasonNumber);
      }

      const { data, error } = await query;
      if (error || !data || !Array.isArray(data)) return [];

      return data.map((ep: any) => mapEpisodeRecord(ep, seasonNumber || 1));
    } catch {
      return [];
    }
  }

  /**
   * Fetch a specific episode by series ID and episode ID
   */
  async getEpisodeById(
    seriesId: string,
    episodeId: string
  ): Promise<{ series: Series; season: Season; episode: Episode } | null> {
    const series = await this.getSeriesById(seriesId);
    if (!series) return null;

    for (const season of series.seasons) {
      const episode = season.episodes.find(ep => ep.id === episodeId);
      if (episode && isPublished(episode)) {
        return { series, season, episode };
      }
    }

    return null;
  }

  /**
   * Fetch all genre categories from published content
   */
  async getCategories(): Promise<string[]> {
    const all = await this.getAllContent();
    const genreSet = new Set<string>();
    all.forEach(item => item.genres.forEach(g => genreSet.add(g)));
    return ['All', ...Array.from(genreSet).sort()];
  }

  /**
   * Fetch related content for a title
   */
  async getRelatedContent(item: ContentItem, limit: number = 6): Promise<ContentItem[]> {
    const all = await this.getAllContent();
    return all
      .filter(c => c.id !== item.id && c.genres.some(g => item.genres.includes(g)))
      .slice(0, limit);
  }
}
