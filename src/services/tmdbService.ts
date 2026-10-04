import { ContentItem, Movie, Series, isSeries } from '../types/content';
import { contentService } from './contentService';
import { normalizeTmdbImageUrl } from '../utils/imageUtils';

export interface TmdbCastMember {
  id: number | string;
  name: string;
  character?: string;
  profileUrl?: string;
  knownFor?: string;
  biography?: string;
}

export interface TmdbEnrichedDetails {
  tmdbId?: string;
  tagline?: string;
  overview?: string;
  releaseDate?: string;
  runtimeFormatted?: string;
  voteAverage?: number;
  voteCount?: number;
  cast: TmdbCastMember[];
  director?: string;
  similar: ContentItem[];
  backdrop_path?: string;
  poster_path?: string;
  backdropUrl?: string;
  posterUrl?: string;
  title?: string;
  name?: string;
}

/**
 * Curated actor avatar registry with official TMDB & verified portrait assets
 */
const KNOWN_ACTOR_PROFILES: Record<string, { character: string; avatarUrl: string; biography: string; knownFor: string }> = {
  'Tom Holland': {
    character: 'Peter Parker / Spider-Man',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/2qhO19R0x5n6T4dD60K0sQc1uW9.jpg',
    knownFor: 'Spider-Man: No Way Home, Uncharted, The Impossible',
    biography: 'Thomas Stanley Holland is an English actor. His accolades include a British Academy Film Award and three Saturn Awards. He achieved international stardom playing Spider-Man in six Marvel Cinematic Universe superhero films.',
  },
  'Zendaya': {
    character: 'Michelle "MJ" Jones-Watson',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/r3A7drNzNkHV12zOzr6HpBxhUud.jpg',
    knownFor: 'Dune, Euphoria, Spider-Man: Homecoming, The Greatest Showman',
    biography: 'Zendaya Maree Stoermer Coleman is an American actress and singer. She has received various accolades, including two Primetime Emmy Awards and a Golden Globe Award.',
  },
  'Mark Ruffalo': {
    character: 'Bruce Banner / Hulk',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/z3dvKqMNDQWk3QLxzgQZhnM29j8.jpg',
    knownFor: 'The Avengers, Spotlight, Poor Things, Shutter Island',
    biography: 'Mark Alan Ruffalo is an American actor. He began acting in the early 1990s and first gained recognition for his work in Kenneth Lonergan\'s play This Is Our Youth and drama film You Can Count On Me.',
  },
  'Jon Bernthal': {
    character: 'Frank Castle / The Punisher',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/aC3FvU0m55F0U25hWzJc1w1Kj3K.jpg',
    knownFor: 'The Punisher, The Wolf of Wall Street, Ford v Ferrari, Baby Driver',
    biography: 'Jonathan Edward Bernthal is an American actor. Beginning his career in the early 2000s, he came to prominence for portraying Shane Walsh on the AMC horror series The Walking Dead.',
  },
  'Florence Pugh': {
    character: 'Yelena Belova / Black Widow',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/fhEsnAsw0t8uhXW07LqAo15q68h.jpg',
    knownFor: 'Oppenheimer, Dune: Part Two, Little Women, Midsommar',
    biography: 'Florence Pugh is an English actress. Known for her independent film roles as well as blockbusters, she made her acting debut in 2014 in the drama film The Falling.',
  },
  'Sadie Sink': {
    character: 'Rachel Cole',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/jL5sW0eZz1jR6hMhXbM2vK1x5d1.jpg',
    knownFor: 'Stranger Things, The Whale, Fear Street',
    biography: 'Sadie Elizabeth Sink is an American actress. She began acting at age seven in local theater productions and gained worldwide recognition playing Max Mayfield in the Netflix supernatural series Stranger Things.',
  },
  'Jacob Batalon': {
    character: 'Ned Leeds',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/532DYjC1sXlD3L8i0qY4Kq1sZ5m.jpg',
    knownFor: 'Spider-Man franchise, Reginald the Vampire',
    biography: 'Jacob Batalon is an American actor. He made his acting debut in 2016 in the film North Woods before getting his breakthrough role as Ned Leeds in Spider-Man: Homecoming.',
  },
  'Liza Colón-Zayas': {
    character: 'Mrs. Morales / Community Liaison',
    avatarUrl: 'https://image.tmdb.org/t/p/w300/e9sR5z3o1XFv9B6wY2H4d3J1e8L.jpg',
    knownFor: 'The Bear, In Treatment, United 93',
    biography: 'Liza Colón-Zayas is an American actress and playwright. She is best known for her portrayal of Tina Marrero on the FX comedy-drama series The Bear, for which she won an Emmy Award.',
  },
};

/**
 * Extracts a TMDB ID from an embed URL, item ID, or metadata
 */
export function extractTmdbId(item: ContentItem): string | null {
  const anyItem = item as any;
  if (anyItem.tmdb_id) return String(anyItem.tmdb_id);
  if (anyItem.tmdbId) return String(anyItem.tmdbId);

  const candidateUrls = [
    (item as Movie).embedUrl,
    (item as Movie).videoUrl,
    item.trailerUrl,
  ].filter(Boolean) as string[];

  for (const url of candidateUrls) {
    const match = url.match(/(?:movie|tv|embed\/movie|embed\/tv)\/(\d+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (/^\d+$/.test(item.id)) {
    return item.id;
  }

  return null;
}

/**
 * Generates an SVG initial avatar fallback for any actor without an image
 */
export function getActorAvatarFallback(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const colors = ['#1f2937', '#1e293b', '#27272a', '#18181b', '#0f172a'];
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  const bg = colors[charCode % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${bg}"/>
    <text x="50%" y="54%" font-family="Plus Jakarta Sans, sans-serif" font-size="64" font-weight="700" fill="#e5e7eb" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

class TmdbService {
  private apiKey = (import.meta.env.VITE_TMDB_API_KEY || '').trim();

  /**
   * Fetches enriched metadata, cast list, backdrop, and recommendations for a movie or series
   */
  async getEnrichedDetails(item: ContentItem): Promise<TmdbEnrichedDetails> {
    const tmdbId = extractTmdbId(item);
    const isTv = isSeries(item);
    const mediaType = isTv ? 'tv' : 'movie';

    // 1. If a TMDB API key is configured, query the official TMDB API
    if (this.apiKey && tmdbId) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${this.apiKey}&append_to_response=credits,similar`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const castList: TmdbCastMember[] = (data.credits?.cast || []).slice(0, 15).map((c: any) => ({
            id: c.id,
            name: c.name,
            character: c.character || 'Supporting Role',
            profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w300${c.profile_path}` : getActorAvatarFallback(c.name),
            knownFor: c.known_for_department,
          }));

          const similarList = await this.getSimilarCatalogItems(item);

          const backdrop_path = data.backdrop_path || item.backdrop_path;
          const poster_path = data.poster_path || item.poster_path;
          const backdropUrl = normalizeTmdbImageUrl(backdrop_path, 'original') || item.backdropUrl;
          const posterUrl = normalizeTmdbImageUrl(poster_path, 'w780') || item.posterUrl;

          // Preserve backdrops on the item in-memory
          if (backdropUrl) item.backdropUrl = backdropUrl;
          if (backdrop_path) item.backdrop_path = backdrop_path;
          if (posterUrl) item.posterUrl = posterUrl;
          if (poster_path) item.poster_path = poster_path;

          return {
            tmdbId,
            tagline: data.tagline,
            overview: data.overview || item.description,
            releaseDate: data.release_date || data.first_air_date,
            runtimeFormatted: data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : undefined,
            voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : item.rating,
            voteCount: data.vote_count,
            cast: castList.length > 0 ? castList : this.buildFallbackCast(item),
            director: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || item.director,
            similar: similarList,
            backdrop_path,
            poster_path,
            backdropUrl,
            posterUrl,
            title: data.title,
            name: data.name,
          };
        }
      } catch (err) {
        console.warn('TMDB API fetch failed, using local catalog metadata:', err);
      }
    }

    // 2. Local Fallback with curated profiles and catalog matching
    const castList = this.buildFallbackCast(item);
    const similarList = await this.getSimilarCatalogItems(item);

    const backdropUrl = normalizeTmdbImageUrl(item.backdrop_path || item.backdropUrl, 'original');
    const posterUrl = normalizeTmdbImageUrl(item.poster_path || item.posterUrl, 'w780');

    return {
      tmdbId: tmdbId || undefined,
      overview: item.description,
      voteAverage: item.rating,
      cast: castList,
      director: item.director,
      similar: similarList,
      backdrop_path: item.backdrop_path,
      poster_path: item.poster_path,
      backdropUrl,
      posterUrl,
      title: item.title,
    };
  }

  /**
   * Builds cast members list using item.cast strings and curated profile photos
   */
  private buildFallbackCast(item: ContentItem): TmdbCastMember[] {
    const rawCast = Array.isArray(item.cast) ? item.cast : [];
    if (rawCast.length === 0) {
      return [
        { id: '1', name: 'Lead Cast', character: 'Primary Protagonist', profileUrl: getActorAvatarFallback('Lead Cast') },
        { id: '2', name: 'Supporting Cast', character: 'Key Ally', profileUrl: getActorAvatarFallback('Supporting Cast') },
      ];
    }

    return rawCast.map((actorName, index) => {
      const known = KNOWN_ACTOR_PROFILES[actorName];
      return {
        id: `actor-${index}-${actorName.toLowerCase().replace(/\s+/g, '-')}`,
        name: actorName,
        character: known?.character || `Supporting Role`,
        profileUrl: known?.avatarUrl || getActorAvatarFallback(actorName),
        knownFor: known?.knownFor,
        biography: known?.biography,
      };
    });
  }

  /**
   * Fetches similar titles strictly matching the same content type (movies for movies, series for series)
   */
  async getSimilarCatalogItems(item: ContentItem): Promise<ContentItem[]> {
    try {
      const related = await contentService.getRelatedContent(item, 8);
      const targetType = item.type;
      const filtered = related.filter(r => r.id !== item.id && r.type === targetType);
      if (filtered.length >= 2) {
        return filtered;
      }

      if (targetType === 'movie') {
        const allMovies = await contentService.getMovies();
        return allMovies.filter(m => m.id !== item.id).slice(0, 8);
      } else {
        const allSeries = await contentService.getSeries();
        return allSeries.filter(s => s.id !== item.id).slice(0, 8);
      }
    } catch {
      return [];
    }
  }

  /**
   * Retrieves full actor profile and queries RBflix catalog for titles featuring this actor
   */
  async getActorDetails(actorName: string): Promise<{
    name: string;
    profileUrl: string;
    character?: string;
    biography: string;
    knownFor: string;
    titles: ContentItem[];
  }> {
    const known = KNOWN_ACTOR_PROFILES[actorName];
    const profileUrl = known?.avatarUrl || getActorAvatarFallback(actorName);
    const biography = known?.biography || `${actorName} is an acclaimed performer known for compelling roles across major cinematic releases and television productions.`;
    const knownFor = known?.knownFor || 'Feature Films & Television Drama';

    let titles: ContentItem[] = [];
    try {
      const [movies, series] = await Promise.all([
        contentService.getMovies(),
        contentService.getSeries(),
      ]);

      const all = [...movies, ...series];
      titles = all.filter(item => {
        const castList = Array.isArray(item.cast) ? item.cast : [];
        return castList.some(c => c.toLowerCase().includes(actorName.toLowerCase()) || actorName.toLowerCase().includes(c.toLowerCase()));
      });
    } catch {
      titles = [];
    }

    return {
      name: actorName,
      profileUrl,
      character: known?.character,
      biography,
      knownFor,
      titles,
    };
  }
}

export const tmdbService = new TmdbService();
