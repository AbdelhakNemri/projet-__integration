import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationApiService } from '../../../features/notifications/services/notification-api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative" #dropdown>
      <button
        (click)="toggleDropdown()"
        class="relative p-2 text-gray-600 hover:text-gray-900 transition"
        [class.text-primary-600]="hasUnread()"
      >
        <span class="text-2xl">🔔</span>
        @if (unreadCount() > 0) {
          <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (dropdownOpen()) {
        <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Notifications</h3>
            @if (unreadCount() > 0) {
              <button
                (click)="markAllAsRead()"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                Mark all read
              </button>
            }
          </div>

          <!-- Notifications List -->
          <div class="overflow-y-auto flex-1">
            @if (notifications().length === 0) {
              <div class="p-8 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            } @else {
              <div class="divide-y">
                @for (notification of notifications(); track notification.id) {
                  <div
                    [class]="'p-4 hover:bg-gray-50 transition cursor-pointer ' + (notification.isRead ? 'bg-white' : 'bg-blue-50')"
                    (click)="handleNotificationClick(notification)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm mb-1">
                          {{ notification.title }}
                        </h4>
                        <p class="text-sm text-gray-600 mb-2">
                          {{ notification.message }}
                        </p>
                        <p class="text-xs text-gray-400">
                          {{ formatDate(notification.createdAt) }}
                        </p>
                      </div>
                      @if (!notification.isRead) {
                        <div class="w-2 h-2 bg-primary-600 rounded-full ml-2"></div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-4 border-t space-y-2">
            <a
              routerLink="/notifications"
              class="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all notifications →
            </a>
            
            <!-- Test Button (for debugging) -->
            <button
              (click)="createTestNotification()"
              class="w-full px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
            >
              🧪 Create Test Notification
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificationBellComponent {
  private notificationService = inject(NotificationService);
  private notificationApi = inject(NotificationApiService);
  private userContext = inject(UserContextService);

  dropdownOpen = signal(false);
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  hasUnread = this.notificationService.hasUnread;

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
    if (this.dropdownOpen()) {
      this.notificationService.refresh();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen.set(false);
    }
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id!);
    }
    this.dropdownOpen.set(false);
    // TODO: Navigate to related entity if needed
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  createTestNotification(): void {
    const userInfo = this.userContext.authUserInfo();
    if (!userInfo) {
      console.error('No user info available');
      alert('Please log in first');
      return;
    }

    console.log('Creating test notification for user:', userInfo);

    this.notificationApi.createNotification({
      recipientKeycloakId: userInfo.keycloakId,
      recipientEmail: userInfo.email,
      type: 'INTERNAL',
      title: 'Test Notification',
      message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
      source: 'test',
      metadata: '{}'
    }).subscribe({
      next: (notification) => {
        console.log('Test notification created:', notification);
        this.notificationService.refresh();
        alert('Test notification created!');
      },
      error: (error) => {
        console.error('Error creating test notification:', error);
        alert('Failed to create test notification. Check console for details.');
      }
    });
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  }
}

