import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OwnerApiService } from '../../../services/owner-api.service';
import { Booking, BookingStatus } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/owner/bookings/all" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Bookings
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
                  <h1 class="text-3xl font-bold text-white mb-2">Booking #{{ booking()!.id }}</h1>
                  <p class="text-indigo-100">{{ booking()!.field?.name || 'Field #' + booking()!.fieldId }}</p>
                </div>
                <span [class]="getStatusBadgeClass(booking()!.status) + ' !bg-white/90 !backdrop-blur-sm'">
                  {{ booking()!.status }}
                </span>
              </div>
            </div>

            <!-- Booking Information -->
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <!-- Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">Booking Date</label>
                  <div class="flex items-center text-lg text-gray-900">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDate(booking()!.bookingDate) }}
                  </div>
                </div>

                <!-- Time -->
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">Time Slot</label>
                  <div class="flex items-center text-lg text-gray-900">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ booking()!.startTime }} - {{ booking()!.endTime }}
                  </div>
                </div>

                <!-- Price -->
                @if (booking()!.totalPrice) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">Total Price</label>
                    <div class="flex items-center text-2xl font-bold text-indigo-600">
                      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ booking()!.totalPrice }} DT
                    </div>
                  </div>
                }
              </div>

              <!-- Field Information -->
              @if (booking()!.field) {
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Field Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500 mb-1">Field Name</label>
                      <p class="text-gray-900">{{ booking()!.field!.name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500 mb-1">Type</label>
                      <p class="text-gray-900">{{ getFieldIcon(booking()!.field!.type) }} {{ booking()!.field!.type }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500 mb-1">Location</label>
                      <p class="text-gray-900">{{ booking()!.field!.city }}{{ booking()!.field!.address ? ', ' + booking()!.field!.address : '' }}</p>
                    </div>
                    @if (booking()!.field!.pricePerHour) {
                      <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Price per Hour</label>
                        <p class="text-gray-900">{{ booking()!.field!.pricePerHour }} DT</p>
                      </div>
                    }
                  </div>
                  <div class="mt-4">
                    <button [routerLink]="['/owner/fields', booking()!.field!.id]"
                      class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View Field Details →
                    </button>
                  </div>
                </div>
              }

              <!-- Timestamps -->
              <div class="border-t border-gray-200 pt-6 mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  @if (booking()!.createdAt) {
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Created At</label>
                      <p class="text-gray-900">{{ formatDateTime(booking()!.createdAt!) }}</p>
                    </div>
                  }
                  @if (booking()!.updatedAt) {
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
                      <p class="text-gray-900">{{ formatDateTime(booking()!.updatedAt!) }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Card -->
          @if (booking()!.status === 'PENDING') {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Actions</h3>
              <p class="text-gray-600 mb-6">This booking is pending your approval. Accept or reject the booking request.</p>
              
              <div class="flex gap-4">
                <button (click)="updateStatus('CONFIRMED')" [disabled]="isUpdating()"
                  class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  @if (isUpdating()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  } @else {
                    ✓ Accept Booking
                  }
                </button>
                <button (click)="updateStatus('CANCELLED')" [disabled]="isUpdating()"
                  class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  @if (isUpdating()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  } @else {
                    ✗ Reject Booking
                  }
                </button>
              </div>
            </div>
          }

          <!-- Status Info -->
          @else {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center">
                @if (booking()!.status === 'CONFIRMED') {
                  <div class="flex-shrink-0">
                    <svg class="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Booking Confirmed</h3>
                    <p class="text-gray-600">This booking has been confirmed and is scheduled.</p>
                  </div>
                } @else if (booking()!.status === 'COMPLETED') {
                  <div class="flex-shrink-0">
                    <svg class="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Booking Completed</h3>
                    <p class="text-gray-600">This booking has been completed.</p>
                  </div>
                } @else if (booking()!.status === 'CANCELLED') {
                  <div class="flex-shrink-0">
                    <svg class="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Booking Cancelled</h3>
                    <p class="text-gray-600">This booking has been cancelled.</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ownerApi = inject(OwnerApiService);

  // Signals
  booking = signal<Booking | null>(null);
  isLoading = signal<boolean>(true);
  isUpdating = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

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

    // Get all bookings and find the specific one
    this.ownerApi.getAllBookings().subscribe({
      next: (bookings) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          this.booking.set(booking);
        } else {
          this.errorMessage.set('Booking not found');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading booking:', err);
        this.errorMessage.set('Failed to load booking details. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(status: string): void {
    const b = this.booking();
    if (!b || !b.id) return;

    this.isUpdating.set(true);

    this.ownerApi.updateBookingStatus(b.id, status).subscribe({
      next: () => {
        this.booking.update(booking =>
          booking ? { ...booking, status: status as BookingStatus } : null
        );
        this.isUpdating.set(false);
      },
      error: (err) => {
        console.error('Error updating booking status:', err);
        alert('Failed to update booking status. Please try again.');
        this.isUpdating.set(false);
      }
    });
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
