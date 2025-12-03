/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

