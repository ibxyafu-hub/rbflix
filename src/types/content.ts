export type ContentType = 'movie' | 'series';
export type MaturityRating = 'ALL' | 'PG-13' | '16+' | '18+';
export type VideoQuality = '4K Ultra HD' | '1080p Full HD' | 'HD';
export type ContentStatus = 'published' | 'draft' | 'unpublished' | 'archived';
export type Genre = string;

export interface CastMember {
  id?: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface Episode {
  id: string;
  seriesId?: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl?: string;
  thumbnailGradient?: string;
  videoUrl?: string;
  embedUrl?: string;
  amharicSubtitleUrl?: string;
  status?: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  episodes: Episode[];
}

export interface BaseContent {
  id: string;
  title: string;
  year: number;
  rating: number; // e.g., 8.8
  matchScore?: number; // e.g., 98 (% match)
  maturityRating?: MaturityRating;
  quality?: VideoQuality;
  genres: Genre[];
  description: string;
  cast: string[];
  director?: string;
  posterUrl?: string;
  backdropUrl?: string;
  poster_path?: string;
  backdrop_path?: string;
  posterGradient?: string;
  backdropGradient?: string;
  trailerUrl?: string;
  amharicSubtitleUrl?: string;
  isOriginal?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isTopRated?: boolean;
  status: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Movie extends BaseContent {
  type: 'movie';
  duration: string; // e.g. "2h 18m"
  videoUrl?: string;
  embedUrl?: string;
}

export interface Series extends BaseContent {
  type: 'series';
  totalSeasons?: number;
  seasons: Season[];
}

export type ContentItem = Movie | Series;

export function isMovie(item: ContentItem | null | undefined): item is Movie {
  return !!item && item.type === 'movie';
}

export function isSeries(item: ContentItem | null | undefined): item is Series {
  return !!item && item.type === 'series';
}

export function isPublished(item: BaseContent | Episode | null | undefined): boolean {
  if (!item) return false;
  // If status is not explicitly set, default to published for backward compatibility
  return !item.status || item.status === 'published';
}

export interface WatchProgressItem {
  contentId: string;
  contentType: ContentType;
  title: string;
  posterGradient?: string;
  posterUrl?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  playbackPosition: number; // in seconds
  duration: number; // in seconds
  progressPercentage: number; // 0 - 100
  lastWatched: number; // unix timestamp in ms
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export interface VideoPlayerPayload {
  content: ContentItem;
  episode?: Episode;
  season?: Season;
  initialTime?: number;
}
