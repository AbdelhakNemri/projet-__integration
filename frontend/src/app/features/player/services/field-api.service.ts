import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Field, FieldReview, CreateAvailabilityRequest } from '../../../core/models/field.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Field API Service
 * Handles all field-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class FieldApiService extends ApiService {
  /**
   * Get all fields
   */
  getAllFields(): Observable<Field[]> {
    return this.get<Field[]>(API_ENDPOINTS.FIELD.ALL);
  }

  /**
   * Get field by ID
   */
  getFieldById(id: number): Observable<Field> {
    return this.get<Field>(API_ENDPOINTS.FIELD.BY_ID(id));
  }

  /**
   * Search fields by query
   */
  searchFields(query: string): Observable<Field[]> {
    const params = new HttpParams().set('query', query);
    return this.get<Field[]>(API_ENDPOINTS.FIELD.SEARCH, params);
  }

  /**
   * Search fields by city
   */
  searchFieldsByCity(city: string): Observable<Field[]> {
    return this.get<Field[]>(API_ENDPOINTS.FIELD.SEARCH_CITY(city));
  }

  /**
   * Search fields by type
   */
  searchFieldsByType(type: string): Observable<Field[]> {
    return this.get<Field[]>(API_ENDPOINTS.FIELD.SEARCH_TYPE(type));
  }

  /**
   * Get field availability
   */
  getFieldAvailability(fieldId: number): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.AVAILABILITY.BY_FIELD(fieldId));
  }

  /**
   * Get field availability by day
   */
  getFieldAvailabilityByDay(fieldId: number, dayOfWeek: string): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.AVAILABILITY.BY_DAY(fieldId, dayOfWeek));
  }

  /**
   * Get field reviews
   */
  getFieldReviews(fieldId: number): Observable<FieldReview[]> {
    return this.get<FieldReview[]>(API_ENDPOINTS.FIELD_REVIEW.BY_FIELD(fieldId));
  }

  /**
   * Get field average rating
   */
  getFieldRating(fieldId: number): Observable<{ rating: number }> {
    return this.get<{ rating: number }>(API_ENDPOINTS.FIELD_REVIEW.RATING(fieldId));
  }

  /**
   * Add field review
   */
  addFieldReview(fieldId: number, rating: number, comment?: string): Observable<FieldReview> {
    // Backend expects 'content' field, not 'comment'
    return this.post<FieldReview>(API_ENDPOINTS.FIELD_REVIEW.CREATE(fieldId), {
      rating,
      content: comment
    });
  }
}

