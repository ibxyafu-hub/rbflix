import { API_CONFIG } from '../../config/api.config';

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'CONFIG_ERROR';

/**
 * Structured API Error class providing clean, user-friendly messages
 * without leaking internal server logs or technical stack traces to customers.
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;

  constructor(message: string, code: ApiErrorCode, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Lightweight, in-memory cache to prevent redundant HTTP requests
 */
class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string, ttlMs: number = API_CONFIG.CACHE_TTL_MS): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new InMemoryCache();

/**
 * HTTP API Client for RBflix Customer Website
 * Read-only communication layer with the shared RBflix backend.
 */
export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = API_CONFIG.BASE_URL, timeoutMs: number = API_CONFIG.REQUEST_TIMEOUT_MS) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  /**
   * Execute an authenticated/public GET request with caching, timeout, and clean error handling.
   */
  async get<T>(endpoint: string, options?: { useCache?: boolean; ttlMs?: number }): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        'Backend service URL is not configured.',
        'CONFIG_ERROR'
      );
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const useCache = options?.useCache ?? true;

    // Check in-memory cache first
    if (useCache) {
      const cached = apiCache.get<T>(url, options?.ttlMs);
      if (cached !== null) {
        return cached;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Requested title or content was not found.', 'NOT_FOUND', 404);
        }
        if (response.status >= 500) {
          throw new ApiError('The streaming service encountered a temporary error. Please try again.', 'SERVER_ERROR', response.status);
        }
        throw new ApiError('Unable to process the content request.', 'SERVER_ERROR', response.status);
      }

      let json: any;
      try {
        json = await response.json();
      } catch {
        throw new ApiError('Received an unparseable response from the content service.', 'INVALID_RESPONSE', response.status);
      }

      // If response is wrapped in standard API envelope { data: ... } or direct payload
      const resultData = json?.data !== undefined ? json.data : json;

      if (useCache) {
        apiCache.set(url, resultData);
      }

      return resultData as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw new ApiError('Connection timed out while loading stream metadata. Please retry.', 'TIMEOUT');
      }

      throw new ApiError('Unable to connect to the RBflix service. Please check your internet connection.', 'NETWORK_ERROR');
    }
  }

  /**
   * Helper to invalidate/clear client cache
   */
  clearCache(): void {
    apiCache.clear();
  }
}

export const apiClient = new ApiClient();
