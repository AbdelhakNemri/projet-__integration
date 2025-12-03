import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OwnerApiService } from '../../../services/owner-api.service';
import { Field } from '../../../../../core/models/field.model';
import { Booking } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/owner/fields/my-fields" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to My Fields
      </button>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading field details..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Field Details -->
      @else if (field()) {
        <div class="space-y-6">
          <!-- Header Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-3xl font-bold text-white mb-2">{{ field()!.name }}</h1>
                  <div class="flex items-center gap-4 text-indigo-100">
                    <span class="flex items-center">
                      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ field()!.city }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      {{ getFieldIcon(field()!.type) }} {{ field()!.type }}
                    </span>
                  </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex gap-2">
                  <button [routerLink]="['/owner/fields/edit', field()!.id]"
                    class="px-4 py-2 bg-white/90 backdrop-blur-sm text-indigo-700 rounded-lg hover:bg-white transition-colors font-medium">
                    Edit Field
                  </button>
                  <button (click)="confirmDelete()"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Field Info -->
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <!-- Address -->
                @if (field()!.address) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p class="text-lg text-gray-900">{{ field()!.address }}</p>
                  </div>
                }

                <!-- Price -->
                @if (field()!.pricePerHour) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Price per Hour</label>
                    <p class="text-2xl font-bold text-indigo-600">{{ field()!.pricePerHour }} DT</p>
                  </div>
                }

                <!-- Created Date -->
                @if (field()!.createdAt) {
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1">Created</label>
                    <p class="text-lg text-gray-900">{{ formatDate(field()!.createdAt!) }}</p>
                  </div>
                }
              </div>

              <!-- Description -->
              @if (field()!.description) {
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p class="text-gray-700 leading-relaxed">{{ field()!.description }}</p>
                </div>
              }

              <!-- Amenities -->
              @if (field()!.amenities && field()!.amenities!.length > 0) {
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-3">Amenities</label>
                  <div class="flex flex-wrap gap-2">
                    @for (amenity of field()!.amenities; track amenity) {
                      <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                        ✓ {{ amenity }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Total Bookings -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-500">Total Bookings</span>
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ fieldBookings().length }}</p>
            </div>

            <!-- Pending Bookings -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-500">Pending</span>
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ getPendingCount() }}</p>
            </div>

            <!-- Confirmed Bookings -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-500">Confirmed</span>
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ getConfirmedCount() }}</p>
            </div>

            <!-- Total Revenue -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-500">Total Revenue</span>
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ getTotalRevenue() }} DT</p>
            </div>
          </div>

          <!-- Recent Bookings -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Recent Bookings</h2>
              <button [routerLink]="['/owner/fields', field()!.id, 'availability']"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Manage Availability
              </button>
            </div>

            @if (loadingBookings()) {
              <div class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            } @else if (fieldBookings().length === 0) {
              <div class="text-center py-12">
                <p class="text-gray-500">No bookings yet</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (booking of fieldBookings().slice(0, 5); track booking.id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h3 class="font-semibold text-gray-900">Booking #{{ booking.id }}</h3>
                          <span [class]="getStatusBadgeClass(booking.status)">
                            {{ booking.status }}
                          </span>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span class="font-medium">Date:</span>
                            <span class="ml-1">{{ formatDate(booking.bookingDate) }}</span>
                          </div>
                          <div>
                            <span class="font-medium">Time:</span>
                            <span class="ml-1">{{ booking.startTime }} - {{ booking.endTime }}</span>
                          </div>
                          @if (booking.totalPrice) {
                            <div>
                              <span class="font-medium">Price:</span>
                              <span class="ml-1 text-indigo-600 font-semibold">{{ booking.totalPrice }} DT</span>
                            </div>
                          }
                          @if (booking.createdAt) {
                            <div>
                              <span class="font-medium">Booked:</span>
                              <span class="ml-1">{{ formatDate(booking.createdAt!) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      @if (booking.status === 'PENDING') {
                        <div class="flex gap-2 ml-4">
                          <button (click)="updateBookingStatus(booking.id!, 'CONFIRMED')"
                            [disabled]="updatingBookingId() === booking.id"
                            class="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50">
                            Accept
                          </button>
                          <button (click)="updateBookingStatus(booking.id!, 'CANCELLED')"
                            [disabled]="updatingBookingId() === booking.id"
                            class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50">
                            Reject
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              @if (fieldBookings().length > 5) {
                <div class="mt-6 text-center">
                  <button routerLink="/owner/bookings/all"
                    class="text-indigo-600 hover:text-indigo-700 font-medium">
                    View All Bookings →
                  </button>
                </div>
              }
            }
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        @if (showDeleteConfirm()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Field?</h3>
              <p class="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{{ field()!.name }}</strong>? This will also delete all associated bookings and availability slots. This action cannot be undone.
              </p>
              <div class="flex gap-3">
                <button (click)="showDeleteConfirm.set(false)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button (click)="deleteField()" [disabled]="isDeleting()"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (isDeleting()) {
                    <span class="flex items-center justify-center">
                      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  } @else {
                    Yes, Delete
                  }
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class FieldDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ownerApi = inject(OwnerApiService);

  // Signals
  field = signal<Field | null>(null);
  fieldBookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);
  loadingBookings = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showDeleteConfirm = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  updatingBookingId = signal<number | null>(null);

  ngOnInit(): void {
    const fieldId = this.route.snapshot.paramMap.get('id');
    if (fieldId) {
      this.loadField(+fieldId);
      this.loadBookings(+fieldId);
    } else {
      this.errorMessage.set('Invalid field ID');
      this.isLoading.set(false);
    }
  }

  loadField(fieldId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ownerApi.getFieldById(fieldId).subscribe({
      next: (field) => {
        this.field.set(field);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading field:', err);
        this.errorMessage.set('Failed to load field details. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  loadBookings(fieldId: number): void {
    this.loadingBookings.set(true);

    // Get all bookings and filter by field ID
    this.ownerApi.getAllBookings().subscribe({
      next: (bookings) => {
        const filtered = bookings.filter(b => b.fieldId === fieldId);
        // Sort by date (newest first)
        const sorted = filtered.sort((a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
        this.fieldBookings.set(sorted);
        this.loadingBookings.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loadingBookings.set(false);
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteField(): void {
    const f = this.field();
    if (!f || !f.id) return;

    this.isDeleting.set(true);

    this.ownerApi.deleteField(f.id).subscribe({
      next: () => {
        this.router.navigate(['/owner/fields/my-fields']);
      },
      error: (err) => {
        console.error('Error deleting field:', err);
        alert('Failed to delete field. Please try again.');
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }

  updateBookingStatus(bookingId: number, status: string): void {
    this.updatingBookingId.set(bookingId);

    this.ownerApi.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        // Update booking in list
        this.fieldBookings.update(bookings =>
          bookings.map(b => b.id === bookingId ? { ...b, status: status as any } : b)
        );
        this.updatingBookingId.set(null);
      },
      error: (err) => {
        console.error('Error updating booking status:', err);
        alert('Failed to update booking status. Please try again.');
        this.updatingBookingId.set(null);
      }
    });
  }

  getPendingCount(): number {
    return this.fieldBookings().filter(b => b.status === 'PENDING').length;
  }

  getConfirmedCount(): number {
    return this.fieldBookings().filter(b => b.status === 'CONFIRMED').length;
  }

  getTotalRevenue(): number {
    return this.fieldBookings()
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      CONFIRMED: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      COMPLETED: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      CANCELLED: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[status] || classes['PENDING'];
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
