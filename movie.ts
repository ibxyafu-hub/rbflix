/**
 * Re-exports from the centralized content types layer for backward compatibility
 */
export * from './content';

// Aliases for legacy component imports
import type { Movie, Series, ContentItem, UserProfile } from './content';
export type { Movie, Series, ContentItem, UserProfile };

export type ViewMode = 'home' | 'movies' | 'series' | 'mylist' | 'search';
