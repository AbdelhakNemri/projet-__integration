import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models/notification.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div>
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
          <p class="text-gray-600">
            {{ unreadCount() > 0 ? unreadCount() + ' unread notifications' : 'All caught up!' }}
          </p>
        </div>
        @if (unreadCount() > 0) {
          <button
            (click)="markAllAsRead()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Mark All Read
          </button>
        }
      </div>

      <div class="bg-white rounded-lg shadow">
        @if (loading()) {
          <app-loading-spinner message="Loading notifications..."></app-loading-spinner>
        } @else if (notifications().length === 0) {
          <app-empty-state
            icon="🔔"
            title="No notifications"
            message="You're all caught up! New notifications will appear here."
          ></app-empty-state>
        } @else {
          <div class="divide-y">
            @for (notification of notifications(); track notification.id) {
              <div
                [class]="'p-6 hover:bg-gray-50 transition ' + (notification.isRead ? 'bg-white' : 'bg-blue-50')"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                      @if (!notification.isRead) {
                        <span class="px-2 py-1 bg-primary-600 text-white text-xs rounded">New</span>
                      }
                      <span
                        [class]="'px-2 py-1 text-xs rounded ' + getTypeClass(notification.type)"
                      >
                        {{ notification.type }}
                      </span>
                    </div>
                    <p class="text-gray-700 mb-3">{{ notification.message }}</p>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span>{{ formatDate(notification.createdAt) }}</span>
                      @if (notification.relatedEntityType) {
                        <span>• {{ notification.relatedEntityType }}</span>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    @if (!notification.isRead) {
                      <button
                        (click)="markAsRead(notification.id!)"
                        class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        Mark read
                      </button>
                    }
                    <button
                      (click)="deleteNotification(notification.id!)"
                      class="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  loading = signal(false);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.refresh();
    // Simulate loading time
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(id: number): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(id);
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return notifDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      INFO: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      EVENT: 'bg-purple-100 text-purple-800',
      BOOKING: 'bg-indigo-100 text-indigo-800',
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }
}

