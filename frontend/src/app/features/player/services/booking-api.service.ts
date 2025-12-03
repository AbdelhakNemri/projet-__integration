import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Booking, CreateBookingRequest, BookingStats } from '../../../core/models/booking.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Booking API Service
 * Handles all booking-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class BookingApiService extends ApiService {
  /**
   * Create a new booking
   */
  createBooking(booking: CreateBookingRequest): Observable<Booking> {
    return this.post<Booking>(API_ENDPOINTS.BOOKING.CREATE, booking);
  }

  /**
   * Get booking by ID
   */
  getBookingById(id: number): Observable<Booking> {
    return this.get<Booking>(API_ENDPOINTS.BOOKING.BY_ID(id));
  }

  /**
   * Get all bookings for a field
   */
  getBookingsByField(fieldId: number): Observable<Booking[]> {
    return this.get<Booking[]>(API_ENDPOINTS.BOOKING.BY_FIELD(fieldId));
  }

  /**
   * Get current player's bookings
   */
  getMyBookings(): Observable<Booking[]> {
    return this.get<any[]>(API_ENDPOINTS.BOOKING.MY_BOOKINGS).pipe(
      map(bookings => bookings.map(b => this.mapToBooking(b)))
    );
  }

  /**
   * Map backend DTO to frontend Booking model
   */
  private mapToBooking(dto: any): Booking {
    const dateObj = new Date(dto.bookingDate);
    const bookingDate = dto.bookingDate.split('T')[0];

    // Format start time HH:mm
    const startTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // Calculate end time
    const endDateObj = new Date(dateObj.getTime() + (dto.durationHours || 1) * 60 * 60 * 1000);
    const endTime = endDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return {
      ...dto,
      bookingDate,
      startTime,
      endTime,
      // Ensure field object exists if backend sends flattened fields
      field: dto.field || (dto.fieldName ? { id: dto.fieldId, name: dto.fieldName } : undefined)
    };
  }

  /**
   * Cancel a booking
   */
  cancelBooking(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.BOOKING.DELETE(id));
  }
}

