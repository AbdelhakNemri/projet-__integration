import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { NotificationApiService } from '../../features/notifications/services/notification-api.service';
import { Notification } from '../models/notification.model';
import { UserContextService } from './user-context.service';
import { APP_CONFIG } from '../constants/app-config';

/**
 * Notification Service
 * Manages real-time notifications using polling
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationApi = inject(NotificationApiService);
  private userContext = inject(UserContextService);

  // Signals for reactive state
  private _notifications = signal<Notification[]>([]);
  private _unreadCount = signal<number>(0);
  private pollingSubscription?: Subscription;

  // Public readonly signals
  notifications = this._notifications.asReadonly();
  unreadCount = this._unreadCount.asReadonly();
  hasUnread = computed(() => this._unreadCount() > 0);

  constructor() {
    // Start polling when user is authenticated
    effect(() => {
      if (this.userContext.isAuthenticated()) {
        this.startPolling();
      } else {
        this.stopPolling();
        this.clearNotifications();
      }
    });
  }

  /**
   * Start polling for notifications
   */
  private startPolling(): void {
    if (this.pollingSubscription) {
      console.log('[NotificationService] Already polling, skipping...');
      return; // Already polling
    }

    console.log('[NotificationService] Starting notification polling...');
    this.loadNotifications();
    this.loadUnreadCount();

    this.pollingSubscription = interval(APP_CONFIG.NOTIFICATION.POLL_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.loadUnreadCount();
          return this.notificationApi.getNotifications();
        })
      )
      .subscribe({
        next: (notifications) => {
          console.log('[NotificationService] Poll received notifications:', notifications);
          this._notifications.set(notifications);
        },
        error: (error) => {
          console.error('[NotificationService] Poll error:', error);
          // Silently fail - notification service may not be running
          this._notifications.set([]);
          this._unreadCount.set(0);
        },
      });
  }

  /**
   * Stop polling for notifications
   */
  private stopPolling(): void {
    console.log('[NotificationService] Stopping notification polling...');
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Load notifications
   */
  loadNotifications(): void {
    console.log('[NotificationService] Loading notifications...');
    this.notificationApi.getNotifications().subscribe({
      next: (notifications) => {
        console.log('[NotificationService] Received notifications:', notifications);
        this._notifications.set(notifications);
      },
      error: (error) => {
        console.error('[NotificationService] Error loading notifications:', error);
        // Silently fail - notification service may not be running
        this._notifications.set([]);
      },
    });
  }

  /**
   * Load unread count
   */
  loadUnreadCount(): void {
    console.log('[NotificationService] Loading unread count...');
    this.notificationApi.getUnreadCount().subscribe({
      next: (response) => {
        console.log('[NotificationService] Received unread count:', response);
        this._unreadCount.set(response.count);
      },
      error: (error) => {
        console.error('[NotificationService] Error loading unread count:', error);
        // Silently fail - notification service may not be running
        this._unreadCount.set(0);
      },
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): void {
    this.notificationApi.markAsRead(id).subscribe({
      next: () => {
        // Update local state
        const notifications = this._notifications().map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        this._notifications.set(notifications);
        this._unreadCount.update((count) => Math.max(0, count - 1));
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationApi.markAllAsRead().subscribe({
      next: () => {
        const notifications = this._notifications().map((n) => ({
          ...n,
          isRead: true,
        }));
        this._notifications.set(notifications);
        this._unreadCount.set(0);
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      },
    });
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): void {
    this.notificationApi.deleteNotification(id).subscribe({
      next: () => {
        const notifications = this._notifications().filter((n) => n.id !== id);
        this._notifications.set(notifications);
        // Update unread count if deleted notification was unread
        const deleted = this._notifications().find((n) => n.id === id);
        if (deleted && !deleted.isRead) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      },
    });
  }

  /**
   * Clear all notifications (on logout)
   */
  private clearNotifications(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  /**
   * Refresh notifications manually
   */
  refresh(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }
}

