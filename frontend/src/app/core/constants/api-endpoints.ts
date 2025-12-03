/**
 * API Endpoints Configuration
 * All endpoints point to the Gateway (port 8888)
 */
export const API_ENDPOINTS = {
  // Base URLs
  // Empty string to use Angular Proxy (proxy.conf.json) which forwards to http://localhost:8888
  GATEWAY_BASE_URL: '',

  // Auth Service
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER_URL: '/auth/register-url',
    ME: '/auth/me',
    HEALTH: '/auth/health',
  },

  // Player Service
  PLAYER: {
    BASE: '/players',
    ME: '/players/me',
    ALL: '/players',
    BY_EMAIL: (email: string) => `/players/email/${email}`,
    BY_ID: (id: number) => `/players/${id}`,
    UPDATE: (id: number) => `/players/${id}`,
    HEALTH: '/players/health',
  },

  // Feedback Service
  FEEDBACK: {
    BASE: '/feedbacks',
    CREATE: (playerId: number) => `/feedbacks/player/${playerId}`,
    BY_PLAYER: (playerId: number) => `/feedbacks/player/${playerId}`,
    PLAYER_RATING: (playerId: number) => `/feedbacks/player/${playerId}/rating`,
    BY_GIVER: (giverId: number) => `/feedbacks/given/${giverId}`,
    BY_ID: (id: number) => `/feedbacks/${id}`,
    DELETE: (id: number) => `/feedbacks/${id}`,
  },

  // Event Service
  EVENT: {
    BASE: '/events',
    CREATE: '/events',
    BY_ID: (id: number) => `/events/${id}`,
    AVAILABLE: '/events/available',
    SEARCH: '/events/search',
    MY_EVENTS: '/events/my-events',
    MY_PARTICIPATIONS: '/events/my-participations',
    INVITE: (eventId: number) => `/events/${eventId}/invite`,
    RESPOND: (eventId: number) => `/events/${eventId}/respond`,
    REMOVE_PARTICIPANT: (eventId: number, participantId: number) =>
      `/events/${eventId}/participants/${participantId}`,
    JOIN: (eventId: number) => `/events/${eventId}/join`,
    RATE: (eventId: number) => `/events/${eventId}/ratings`,
    RATINGS: (eventId: number) => `/events/${eventId}/ratings`,
    HEALTH: '/events/health',
  },

  // Field Service
  FIELD: {
    BASE: '/fields',
    CREATE: '/fields',
    BY_ID: (id: number) => `/fields/${id}`,
    ALL: '/fields',
    MY_FIELDS: '/fields/my-fields',
    SEARCH_CITY: (city: string) => `/fields/search/city/${city}`,
    SEARCH_TYPE: (type: string) => `/fields/search/type/${type}`,
    SEARCH: '/fields/search',
    UPDATE: (id: number) => `/fields/${id}`,
    DELETE: (id: number) => `/fields/${id}`,
    HEALTH: '/fields/health',
  },

  // Availability Service
  AVAILABILITY: {
    BASE: (fieldId: number) => `/fields/${fieldId}/availability`,
    CREATE: (fieldId: number) => `/fields/${fieldId}/availability`,
    BY_FIELD: (fieldId: number) => `/fields/${fieldId}/availability`,
    BY_DAY: (fieldId: number, dayOfWeek: string) =>
      `/fields/${fieldId}/availability/day/${dayOfWeek}`,
    UPDATE: (fieldId: number, availabilityId: number) =>
      `/fields/${fieldId}/availability/${availabilityId}`,
    DELETE: (fieldId: number, availabilityId: number) =>
      `/fields/${fieldId}/availability/${availabilityId}`,
  },

  // Field Review Service
  FIELD_REVIEW: {
    BASE: (fieldId: number) => `/fields/${fieldId}/reviews`,
    CREATE: (fieldId: number) => `/fields/${fieldId}/reviews`,
    BY_FIELD: (fieldId: number) => `/fields/${fieldId}/reviews`,
    RATING: (fieldId: number) => `/fields/${fieldId}/reviews/rating`,
    DELETE: (fieldId: number, reviewId: number) =>
      `/fields/${fieldId}/reviews/${reviewId}`,
  },

  // Booking Service
  BOOKING: {
    BASE: '/bookings',
    CREATE: '/bookings',
    BY_ID: (id: number) => `/bookings/${id}`,
    BY_FIELD: (fieldId: number) => `/bookings/field/${fieldId}`,
    MY_BOOKINGS: '/bookings/my-bookings',
    OWNER_ALL: '/bookings/owner/all',
    OWNER_RECENT: '/bookings/owner/recent',
    OWNER_STATS: '/bookings/owner/stats',
    UPDATE_STATUS: (id: number) => `/bookings/${id}/status`,
    DELETE: (id: number) => `/bookings/${id}`,
  },

  // Notification Service
  NOTIFICATION: {
    BASE: '/notifications',
    CREATE: '/notifications',
    PLAYER_ACCEPTED: '/notifications/player-accepted',
    FIELD_RESERVED: '/notifications/field-reserved',
    ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: number) => `/notifications/${id}`,
    HEALTH: '/notifications/health',
  },
} as const;

