import { API_ENDPOINTS } from './api-endpoints';

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: API_ENDPOINTS.GATEWAY_BASE_URL,
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'sports_arena_token',
    USER: 'sports_arena_user',
  },
  
  // Token Configuration
  TOKEN: {
    STORAGE_TYPE: 'localStorage' as 'localStorage' | 'sessionStorage',
    REFRESH_THRESHOLD: 300, // Refresh token 5 minutes before expiration (in seconds)
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // Notification Polling
  NOTIFICATION: {
    POLL_INTERVAL: 30000, // 30 seconds
  },
  
  // Search
  SEARCH: {
    DEBOUNCE_TIME: 300, // milliseconds
    MIN_QUERY_LENGTH: 2,
  },
} as const;

