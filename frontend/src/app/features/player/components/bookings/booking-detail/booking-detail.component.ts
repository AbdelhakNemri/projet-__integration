import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingApiService } from '../../../services/booking-api.service';
import { Booking, BookingStatus } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/player/bookings/my-bookings" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to My Bookings
      </button>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading booking details..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Booking Details -->
      @else if (booking()) {
        <div class="space-y-6">
          <!-- Header Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-3xl font-bold text-white mb-2">Booking Details</h1>
                  <p class="text-indigo-100">Booking #{{ booking()!.id }}</p>
                </div>
                <span [class]="getStatusBadgeClass(booking()!.status)">
                  {{ booking()!.status }}
                </span>
              </div>
            </div>

            <!-- Field Information -->
            <div class="p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Field Information</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Field Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Field Name</label>
                  <p class="text-lg font-semibold text-gray-900">
                    {{ booking()!.field?.name || 'Field #' + booking()!.fieldId }}
                  </p>
                </div>

                <!-- Field Type -->
                @if (booking()!.field?.type) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Type</label>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ getFieldIcon(booking()!.field!.type) }} {{ booking()!.field!.type }}
                    </p>
                  </div>
                }

                <!-- Location -->
                @if (booking()!.field?.city) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p class="text-lg text-gray-900">
                      📍 {{ booking()!.field!.city }}{{ booking()!.field!.address ? ', ' + booking()!.field!.address : '' }}
                    </p>
                  </div>
                }

                <!-- Price per Hour -->
                @if (booking()!.field?.pricePerHour) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Price per Hour</label>
                    <p class="text-lg font-semibold text-indigo-600">
                      {{ booking()!.field!.pricePerHour }} DT/hour
                    </p>
                  </div>
                }
              </div>

              <!-- Field Description -->
              @if (booking()!.field?.description) {
                <div class="mt-6">
                  <label class="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p class="text-gray-700 leading-relaxed">{{ booking()!.field!.description }}</p>
                </div>
              }

              <!-- Amenities -->
              @if (booking()!.field?.amenities && booking()!.field!.amenities!.length > 0) {
                <div class="mt-6">
                  <label class="block text-sm font-medium text-gray-500 mb-3">Amenities</label>
                  <div class="flex flex-wrap gap-2">
                    @for (amenity of booking()!.field!.amenities; track amenity) {
                      <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                        ✓ {{ amenity }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Booking Details Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Reservation Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Date -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <label class="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatDate(booking()!.bookingDate) }}</p>
                </div>
              </div>

              <!-- Time -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <label class="block text-sm font-medium text-gray-500 mb-1">Time</label>
                  <p class="text-lg font-semibold text-gray-900">
                    {{ booking()!.startTime }} - {{ booking()!.endTime }}
                  </p>
                  <p class="text-sm text-gray-500">{{ calculateDuration() }}</p>
                </div>
              </div>

              <!-- Total Price -->
              @if (booking()!.totalPrice) {
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <label class="block text-sm font-medium text-gray-500 mb-1">Total Price</label>
                    <p class="text-2xl font-bold text-green-600">{{ booking()!.totalPrice }} DT</p>
                  </div>
                </div>
              }

              <!-- Status -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span [class]="getStatusBadgeClass(booking()!.status)">
                    {{ booking()!.status }}
                  </span>
                  <p class="text-sm text-gray-500 mt-1">{{ getStatusDescription(booking()!.status) }}</p>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="mt-8 pt-6 border-t border-gray-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                @if (booking()!.createdAt) {
                  <div>
                    <span class="text-gray-500">Booked on:</span>
                    <span class="ml-2 text-gray-900 font-medium">{{ formatDateTime(booking()!.createdAt!) }}</span>
                  </div>
                }
                @if (booking()!.updatedAt) {
                  <div>
                    <span class="text-gray-500">Last updated:</span>
                    <span class="ml-2 text-gray-900 font-medium">{{ formatDateTime(booking()!.updatedAt!) }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              @if (booking()!.field?.id) {
                <button [routerLink]="['/player/fields', booking()!.field!.id]"
                  class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center">
                  View Field Details
                </button>
              }
              
              @if (booking()!.status === 'PENDING' || booking()!.status === 'CONFIRMED') {
                <button (click)="showCancelConfirm.set(true)"
                  [disabled]="isCancelling()"
                  class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (isCancelling()) {
                    <span class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
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
        </div>

        <!-- Cancel Confirmation Modal -->
        @if (showCancelConfirm()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Cancel Booking?</h3>
              <p class="text-gray-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div class="flex gap-3">
                <button (click)="showCancelConfirm.set(false)"
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
      }
    </div>
  `
})
export class BookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingApi = inject(BookingApiService);

  // Signals
  booking = signal<Booking | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isCancelling = signal<boolean>(false);
  showCancelConfirm = signal<boolean>(false);

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(+bookingId);
    } else {
      this.errorMessage.set('Invalid booking ID');
      this.isLoading.set(false);
    }
  }

  loadBooking(bookingId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingApi.getBookingById(bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading booking:', err);
        this.errorMessage.set('Failed to load booking details. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  cancelBooking(): void {
    const b = this.booking();
    if (!b || !b.id) return;

    this.isCancelling.set(true);
    this.showCancelConfirm.set(false);

    this.bookingApi.cancelBooking(b.id).subscribe({
      next: () => {
        this.router.navigate(['/player/bookings/my-bookings']);
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again.');
        this.isCancelling.set(false);
      }
    });
  }

  calculateDuration(): string {
    const b = this.booking();
    if (!b) return '';

    const [startHour, startMin] = b.startTime.split(':').map(Number);
    const [endHour, endMin] = b.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minutes`;
    }
  }

  getStatusBadgeClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      PENDING: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800',
      CONFIRMED: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800',
      COMPLETED: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800',
      CANCELLED: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800'
    };
    return classes[status];
  }

  getStatusDescription(status: BookingStatus): string {
    const descriptions: Record<BookingStatus, string> = {
      PENDING: 'Waiting for owner confirmation',
      CONFIRMED: 'Confirmed by field owner',
      COMPLETED: 'Booking completed',
      CANCELLED: 'Booking was cancelled'
    };
    return descriptions[status];
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
}
