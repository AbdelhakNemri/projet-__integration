import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Service Health Response
 */
export interface ServiceHealth {
  service: string;
  status: 'UP' | 'DOWN';
  message?: string;
  timestamp?: string;
}

/**
 * System Statistics
 */
export interface SystemStats {
  totalUsers?: number;
  totalFields?: number;
  totalEvents?: number;
  totalBookings?: number;
  activeServices?: number;
  totalServices?: number;
}

/**
 * Admin API Service
 * Handles admin-related API calls (health checks, system stats)
 */
@Injectable({
  providedIn: 'root',
})
export class AdminApiService extends ApiService {
  /**
   * Check auth service health
   */
  checkAuthHealth(): Observable<ServiceHealth> {
    return this.get<string>(API_ENDPOINTS.AUTH.HEALTH).pipe(
      map(() => ({ service: 'auth-service', status: 'UP' as const })),
      catchError(() => of({ service: 'auth-service', status: 'DOWN' as const }))
    );
  }

  /**
   * Check player service health
   */
  checkPlayerHealth(): Observable<ServiceHealth> {
    return this.get<string>(API_ENDPOINTS.PLAYER.HEALTH).pipe(
      map(() => ({ service: 'player-service', status: 'UP' as const })),
      catchError(() => of({ service: 'player-service', status: 'DOWN' as const }))
    );
  }

  /**
   * Check field service health
   */
  checkFieldHealth(): Observable<ServiceHealth> {
    return this.get<string>(API_ENDPOINTS.FIELD.HEALTH).pipe(
      map(() => ({ service: 'field-service', status: 'UP' as const })),
      catchError(() => of({ service: 'field-service', status: 'DOWN' as const }))
    );
  }

  /**
   * Check event service health
   */
  checkEventHealth(): Observable<ServiceHealth> {
    return this.get<string>(API_ENDPOINTS.EVENT.HEALTH).pipe(
      map(() => ({ service: 'event-service', status: 'UP' as const })),
      catchError(() => of({ service: 'event-service', status: 'DOWN' as const }))
    );
  }

  /**
   * Check notification service health
   */
  checkNotificationHealth(): Observable<ServiceHealth> {
    return this.get<string>(API_ENDPOINTS.NOTIFICATION.HEALTH).pipe(
      map(() => ({ service: 'notification-service', status: 'UP' as const })),
      catchError(() => of({ service: 'notification-service', status: 'DOWN' as const }))
    );
  }

  /**
   * Check all services health
   */
  checkAllServicesHealth(): Observable<ServiceHealth[]> {
    return combineLatest([
      this.checkAuthHealth(),
      this.checkPlayerHealth(),
      this.checkFieldHealth(),
      this.checkEventHealth(),
      this.checkNotificationHealth(),
    ]);
  }

  /**
   * Get system statistics
   * Aggregates data from various services
   */
  getSystemStats(): Observable<SystemStats> {
    // Aggregate statistics from available endpoints
    return combineLatest({
      players: this.get<any[]>(API_ENDPOINTS.PLAYER.ALL).pipe(catchError(() => of([]))),
      fields: this.get<any[]>(API_ENDPOINTS.FIELD.ALL).pipe(catchError(() => of([]))),
      events: this.get<any[]>(API_ENDPOINTS.EVENT.AVAILABLE).pipe(catchError(() => of([]))),
      health: this.checkAllServicesHealth(),
    }).pipe(
      map(({ players, fields, events, health }) => ({
        totalUsers: players.length,
        totalFields: fields.length,
        totalEvents: events.length,
        totalBookings: 0, // Would need a dedicated endpoint
        activeServices: health.filter(s => s.status === 'UP').length,
        totalServices: health.length,
      }))
    );
  }

  /**
   * Get all users from the system
   * This fetches from the player service which stores all users
   */
  getAllUsers(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.PLAYER.ALL);
  }
}
