/**
 * Field Model
 */
export interface Field {
  id?: number;
  name: string;
  type: FieldType;
  city: string;
  address?: string;
  description?: string;
  pricePerHour?: number;
  ownerId?: number;
  ownerEmail?: string;
  images?: string[];
  amenities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type FieldType = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS' | 'VOLLEYBALL' | 'OTHER';

/**
 * Field Availability
 */
export interface FieldAvailability {
  id?: number;
  fieldId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/**
 * Field Review
 */
export interface FieldReview {
  id?: number;
  fieldId: number;
  reviewerKeycloakId?: string;
  reviewerEmail?: string;
  playerEmail?: string; // Alias for reviewerEmail for backwards compatibility
  rating: number; // 1-5
  content?: string;
  comment?: string; // Alias for content for backwards compatibility
  createdAt?: string;
}

/**
 * Create Field Request
 */
export interface CreateFieldRequest {
  name: string;
  type: FieldType;
  city: string;
  address?: string;
  description?: string;
  pricePerHour?: number;
  amenities?: string[];
}

/**
 * Create Availability Request
 */
export interface CreateAvailabilityRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

