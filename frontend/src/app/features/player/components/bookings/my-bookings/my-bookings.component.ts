import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../../../services/booking-api.service';
import { Booking, BookingStatus } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
        <p class="text-gray-600">Manage your field reservations</p>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button (click)="selectedTab.set('all')"
              [class]="selectedTab() === 'all' 
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              All ({{ allBookings().length }})
            </button>
            <button (click)="selectedTab.set('upcoming')"
              [class]="selectedTab() === 'upcoming'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Upcoming ({{ upcomingBookings().length }})
            </button>
            <button (click)="selectedTab.set('pending')"
              [class]="selectedTab() === 'pending'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Pending ({{ pendingBookings().length }})
            </button>
            <button (click)="selectedTab.set('completed')"
              [class]="selectedTab() === 'completed'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Completed ({{ completedBookings().length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading bookings..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (displayedBookings().length === 0) {
        <app-empty-state
          icon="📅"
          title="No bookings found"
          [message]="getEmptyMessage()"
          actionLabel="Browse Fields"
          actionRoute="/player/fields/list"
        ></app-empty-state>
      }

      <!-- Bookings List -->
      @else {
        <div class="space-y-4">
          @for (booking of displayedBookings(); track booking.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div class="p-6">
                <div class="flex items-start justify-between">
                  <!-- Booking Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                      <h3 class="text-xl font-bold text-gray-900">
                        {{ booking.field?.name || 'Field #' + booking.fieldId }}
                      </h3>
                      <span [class]="getStatusBadgeClass(booking.status)">
                        {{ booking.status }}
                      </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <!-- Date -->
                      <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>{{ formatDate(booking.bookingDate) }}</span>
                      </div>

                      <!-- Time -->
                      <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>{{ booking.startTime }} - {{ booking.endTime }}</span>
                      </div>

                      <!-- Price -->
                      @if (booking.totalPrice) {
                        <div class="flex items-center text-gray-600">
                          <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="font-semibold text-indigo-600">{{ booking.totalPrice }} DT</span>
                        </div>
                      }
                    </div>

                    <!-- Field Details -->
                    @if (booking.field) {
                      <div class="flex items-center gap-4 text-sm text-gray-500">
                        @if (booking.field.city) {
                          <span>📍 {{ booking.field.city }}</span>
                        }
                        @if (booking.field.type) {
                          <span>{{ getFieldIcon(booking.field.type) }} {{ booking.field.type }}</span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-2 ml-4">
                    <button [routerLink]="['/player/bookings', booking.id]"
                      class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      View Details
                    </button>
                    
                    @if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
                      <button (click)="confirmCancel(booking)"
                        [disabled]="cancellingId() === booking.id"
                        class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        @if (cancellingId() === booking.id) {
                          <span class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cancelling...
                          </span>
                        } @else {
                          Cancel Booking
                        }
                      </button>
                    }
                  </div>
                </div>

                <!-- Created Date -->
                @if (booking.createdAt) {
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-xs text-gray-400">
                      Booked on {{ formatDateTime(booking.createdAt) }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Cancel Confirmation Modal -->
      @if (bookingToCancel()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Cancel Booking?</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to cancel this booking for <strong>{{ bookingToCancel()!.field?.name }}</strong> on {{ formatDate(bookingToCancel()!.bookingDate) }}?
            </p>
            <div class="flex gap-3">
              <button (click)="bookingToCancel.set(null)"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Keep Booking
              </button>
              <button (click)="cancelBooking()"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  private bookingApi = inject(BookingApiService);

  // Signals
  allBookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedTab = signal<'all' | 'upcoming' | 'pending' | 'completed'>('all');
  bookingToCancel = signal<Booking | null>(null);
  cancellingId = signal<number | null>(null);

  // Computed
  upcomingBookings = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allBookings().filter(b => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate >= today && (b.status === 'CONFIRMED' || b.status === 'PENDING');
    });
  });

  pendingBookings = computed(() =>
    this.allBookings().filter(b => b.status === 'PENDING')
  );

  completedBookings = computed(() =>
    this.allBookings().filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
  );

  displayedBookings = computed(() => {
    switch (this.selectedTab()) {
      case 'upcoming':
        return this.upcomingBookings();
      case 'pending':
        return this.pendingBookings();
      case 'completed':
        return this.completedBookings();
      default:
        return this.allBookings();
    }
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingApi.getMyBookings().subscribe({
      next: (bookings) => {
        // Sort by date (newest first)
        const sorted = bookings.sort((a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
        this.allBookings.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.errorMessage.set('Failed to load bookings. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  confirmCancel(booking: Booking): void {
    this.bookingToCancel.set(booking);
  }

  cancelBooking(): void {
    const booking = this.bookingToCancel();
    if (!booking || !booking.id) return;

    this.cancellingId.set(booking.id);

    this.bookingApi.cancelBooking(booking.id).subscribe({
      next: () => {
        // Remove from list or update status
        this.allBookings.update(bookings =>
          bookings.filter(b => b.id !== booking.id)
        );
        this.bookingToCancel.set(null);
        this.cancellingId.set(null);
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again.');
        this.cancellingId.set(null);
      }
    });
  }

  getStatusBadgeClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      PENDING: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      CONFIRMED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
      COMPLETED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      CANCELLED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[status];
  }

  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      FOOTBALL: '⚽',
      BASKETBALL: '🏀',
      TENNIS: '🎾',
      VOLLEYBALL: '🏐',
      OTHER: '🏟️'
    };
    return icons[type] || '🏟️';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEmptyMessage(): string {
    switch (this.selectedTab()) {
      case 'upcoming':
        return 'You have no upcoming bookings';
      case 'pending':
        return 'You have no pending bookings';
      case 'completed':
        return 'You have no completed bookings';
      default:
        return 'You haven\'t made any bookings yet. Start by browsing available fields!';
    }
  }
}
