/**
 * Centralized API & Environment Configuration for RBflix
 *
 * This configuration allows switching between the mock data layer and the future
 * shared RBflix backend/database by detecting VITE_API_URL or providing environment variables.
 */

// Retrieve configured API URL and Supabase credentials from Vite environment
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const configuredSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const configuredSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const API_CONFIG = {
  // Base URL for the future RBflix backend API
  BASE_URL: configuredApiUrl || '',

  // Supabase Configuration
  SUPABASE_URL: configuredSupabaseUrl || '',
  SUPABASE_ANON_KEY: configuredSupabaseAnonKey || '',

  // Is Supabase configured?
  IS_SUPABASE_CONFIGURED: Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey),

  // Is a custom REST backend configured?
  IS_BACKEND_CONFIGURED: Boolean(configuredApiUrl),

  // Fallback flag: true when neither Supabase nor custom API URL is provided
  USE_MOCK_DATA: !configuredSupabaseUrl && !configuredApiUrl,

  // Network simulated latency (ms) for mock repository
  SIMULATED_DELAY_MS: 60,

  // Client request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 8000,

  // In-memory caching TTL in milliseconds (e.g. 60 seconds)
  CACHE_TTL_MS: 60 * 1000,

  // API Endpoints for the shared RBflix backend
  ENDPOINTS: {
    MOVIES: '/movies',
    MOVIE_DETAIL: (id: string) => `/movies/${id}`,
    SERIES: '/series',
    SERIES_DETAIL: (id: string) => `/series/${id}`,
    EPISODES: (seriesId: string, seasonNumber?: number) =>
      seasonNumber !== undefined
        ? `/series/${seriesId}/seasons/${seasonNumber}/episodes`
        : `/series/${seriesId}/episodes`,
    FEATURED: '/content/featured',
    TRENDING: '/content/trending',
    TOP_RATED: '/content/top-rated',
    SEARCH: '/content/search',
    CATEGORIES: '/categories',
    RELATED: (id: string) => `/content/${id}/related`,
    WATCHLIST: '/user/watchlist',
    WATCH_HISTORY: '/user/watch-history',
  },

  // Default video stream fallback (open public-domain demo streams)
  SAMPLE_VIDEOS: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
  ],
} as const;
