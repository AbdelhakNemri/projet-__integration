import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Notification, CreateNotificationRequest } from '../../../core/models/notification.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Notification API Service
 * Handles all notification-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationApiService extends ApiService {
  /**
   * Get all notifications for current user
   */
  getNotifications(): Observable<Notification[]> {
    return this.get<Notification[]>(API_ENDPOINTS.NOTIFICATION.ALL);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.get<{ count: number }>(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): Observable<void> {
    return this.put<void>(API_ENDPOINTS.NOTIFICATION.MARK_READ(id), {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.put<void>(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.NOTIFICATION.DELETE(id));
  }

  /**
   * Create general notification (admin only)
   */
  createNotification(notification: CreateNotificationRequest): Observable<Notification> {
    return this.post<Notification>(API_ENDPOINTS.NOTIFICATION.CREATE, notification);
  }
}

