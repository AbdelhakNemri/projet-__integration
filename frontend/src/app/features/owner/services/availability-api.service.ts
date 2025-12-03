import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { FieldAvailability, CreateAvailabilityRequest } from '../../../core/models/field.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Availability API Service
 * Handles field availability management
 */
@Injectable({
  providedIn: 'root',
})
export class AvailabilityApiService extends ApiService {
  /**
   * Get all availability slots for a field
   */
  getFieldAvailability(fieldId: number): Observable<FieldAvailability[]> {
    return this.get<FieldAvailability[]>(API_ENDPOINTS.AVAILABILITY.BY_FIELD(fieldId));
  }

  /**
   * Get availability by day of week
   */
  getAvailabilityByDay(fieldId: number, dayOfWeek: string): Observable<FieldAvailability[]> {
    return this.get<FieldAvailability[]>(API_ENDPOINTS.AVAILABILITY.BY_DAY(fieldId, dayOfWeek));
  }

  /**
   * Create availability slot
   */
  createAvailability(fieldId: number, availability: CreateAvailabilityRequest): Observable<FieldAvailability> {
    return this.post<FieldAvailability>(API_ENDPOINTS.AVAILABILITY.CREATE(fieldId), availability);
  }

  /**
   * Update availability slot
   */
  updateAvailability(
    fieldId: number,
    availabilityId: number,
    updates: Partial<CreateAvailabilityRequest>
  ): Observable<FieldAvailability> {
    return this.put<FieldAvailability>(
      API_ENDPOINTS.AVAILABILITY.UPDATE(fieldId, availabilityId),
      updates
    );
  }

  /**
   * Delete availability slot
   */
  deleteAvailability(fieldId: number, availabilityId: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.AVAILABILITY.DELETE(fieldId, availabilityId));
  }
}

