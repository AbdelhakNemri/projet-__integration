import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Field, CreateFieldRequest, FieldReview } from '../../../core/models/field.model';
import { Booking, BookingStats } from '../../../core/models/booking.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Owner API Service
 * Handles all owner-related API calls (fields, bookings, reviews)
 */
@Injectable({
  providedIn: 'root',
})
export class OwnerApiService extends ApiService {
  /**
   * Get owner's fields
   */
  getMyFields(): Observable<Field[]> {
    return this.get<Field[]>(API_ENDPOINTS.FIELD.MY_FIELDS);
  }

  /**
   * Create a new field
   */
  createField(field: CreateFieldRequest): Observable<Field> {
    return this.post<Field>(API_ENDPOINTS.FIELD.CREATE, field);
  }

  /**
   * Update field
   */
  updateField(id: number, updates: Partial<CreateFieldRequest>): Observable<Field> {
    return this.put<Field>(API_ENDPOINTS.FIELD.UPDATE(id), updates);
  }

  /**
   * Delete field
   */
  deleteField(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.FIELD.DELETE(id));
  }

  /**
   * Get field by ID
   */
  getFieldById(id: number): Observable<Field> {
    return this.get<Field>(API_ENDPOINTS.FIELD.BY_ID(id));
  }

  /**
   * Get all bookings for owner's fields
   */
  getAllBookings(): Observable<Booking[]> {
    return this.get<Booking[]>(API_ENDPOINTS.BOOKING.OWNER_ALL);
  }

  /**
   * Get recent bookings (last 30 days)
   */
  getRecentBookings(): Observable<Booking[]> {
    return this.get<Booking[]>(API_ENDPOINTS.BOOKING.OWNER_RECENT);
  }

  /**
   * Get booking statistics
   */
  getBookingStats(): Observable<BookingStats> {
    return this.get<BookingStats>(API_ENDPOINTS.BOOKING.OWNER_STATS);
  }

  /**
   * Update booking status
   */
  updateBookingStatus(id: number, status: string): Observable<void> {
    return this.put<void>(API_ENDPOINTS.BOOKING.UPDATE_STATUS(id), { status });
  }

  /**
   * Get reviews for owner's fields
   */
  getFieldReviews(fieldId: number): Observable<FieldReview[]> {
    return this.get<FieldReview[]>(API_ENDPOINTS.FIELD_REVIEW.BY_FIELD(fieldId));
  }
}

