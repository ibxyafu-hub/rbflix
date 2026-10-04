import { ContentItem } from '../types/content';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const TMDB_IMAGE_ORIGINAL = `${TMDB_IMAGE_BASE}/original`;
export const TMDB_IMAGE_W780 = `${TMDB_IMAGE_BASE}/w780`;
export const TMDB_IMAGE_W500 = `${TMDB_IMAGE_BASE}/w500`;
export const TMDB_IMAGE_W300 = `${TMDB_IMAGE_BASE}/w300`;

/**
 * Normalizes a TMDB image path or full URL into a full valid TMDB image URL.
 * Handles:
 * - Full URLs: "https://image.tmdb.org/t/p/original/abc.jpg" -> returns unchanged
 * - Leading slashes: "/abc123.jpg" -> "https://image.tmdb.org/t/p/original/abc123.jpg"
 * - Bare filenames: "abc123.jpg" -> "https://image.tmdb.org/t/p/original/abc123.jpg"
 */
export function normalizeTmdbImageUrl(
  pathOrUrl?: string,
  size: 'original' | 'w1280' | 'w780' | 'w500' | 'w300' = 'original'
): string | undefined {
  if (!pathOrUrl) return undefined;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return undefined;

  // Already a full HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative TMDB image path
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

/**
 * Resolves the primary TMDB backdrop image for a movie or TV series.
 * Prioritizes backdrop_path and backdropUrl.
 * Falls back to poster_path/posterUrl if no backdrop is available.
 */
export function getBackdropUrl(item?: ContentItem | null): string | undefined {
  if (!item) return undefined;

  const rawBackdrop = item.backdrop_path || item.backdropUrl;
  if (rawBackdrop) {
    return normalizeTmdbImageUrl(rawBackdrop, 'original');
  }

  // Fallback to poster image if no backdrop exists
  const rawPoster = item.poster_path || item.posterUrl;
  if (rawPoster) {
    return normalizeTmdbImageUrl(rawPoster, 'original');
  }

  return undefined;
}

/**
 * Resolves the primary TMDB poster image for a movie or TV series card.
 * Prioritizes poster_path and posterUrl.
 * Falls back to backdrop_path/backdropUrl if poster is unavailable.
 */
export function getPosterUrl(item?: ContentItem | null): string | undefined {
  if (!item) return undefined;

  const rawPoster = item.poster_path || item.posterUrl;
  if (rawPoster) {
    return normalizeTmdbImageUrl(rawPoster, 'w780');
  }

  // Fallback to backdrop image if poster is missing
  const rawBackdrop = item.backdrop_path || item.backdropUrl;
  if (rawBackdrop) {
    return normalizeTmdbImageUrl(rawBackdrop, 'w780');
  }

  return undefined;
}
