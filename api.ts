/**
 * Shared API Response Types for RBflix Services
 * Standard response structures used across RBflix Customer Website & RBflix Backend.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface ContentFilterParams {
  genre?: string;
  type?: 'movie' | 'series' | 'all';
  search?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isTopRated?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'rating' | 'releaseDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}
