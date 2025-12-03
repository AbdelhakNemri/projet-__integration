import { Field } from './field.model';
import { User } from './user.model';

/**
 * Booking Model
 */
export interface Booking {
  id?: number;
  fieldId: number;
  field?: Field;
  playerId: number;
  player?: User;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

/**
 * Create Booking Request
 */
export interface CreateBookingRequest {
  fieldId: number;
  bookingDate: string; // ISO datetime string (YYYY-MM-DDTHH:mm:ss)
  durationHours: number;
  notes?: string;
}

/**
 * Update Booking Status Request
 */
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

/**
 * Booking Statistics
 */
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue?: number;
}

