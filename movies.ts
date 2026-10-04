/**
 * Centralized re-exports from content architecture
 * Maintained for backward compatibility with existing tests and imports.
 */
import { ALL_MOCK_CONTENT, MOCK_MOVIES, MOCK_SERIES } from './mockContent';
import { Movie, ContentItem } from '../types/content';

export const MOVIES: any[] = ALL_MOCK_CONTENT;
export const FEATURED_HERO_MOVIES: any[] = ALL_MOCK_CONTENT.filter(i => i.isFeatured);

export const getTrendingMovies = (): any[] => ALL_MOCK_CONTENT.filter(m => m.isTrending);
export const getTopRatedMovies = (): any[] => ALL_MOCK_CONTENT.filter(m => m.isTopRated);
export const getActionMovies = (): any[] => ALL_MOCK_CONTENT.filter(m => m.genres.includes('Action'));
export const getComedyMovies = (): any[] => ALL_MOCK_CONTENT.filter(m => m.genres.includes('Comedy'));
export const getSciFiMovies = (): any[] => ALL_MOCK_CONTENT.filter(m => m.genres.includes('Sci-Fi'));
export const getOriginals = (): any[] => ALL_MOCK_CONTENT.filter(m => m.isOriginal);
export const getAllMoviesOnly = (): any[] => MOCK_MOVIES;
export const getAllSeriesOnly = (): any[] => MOCK_SERIES;
