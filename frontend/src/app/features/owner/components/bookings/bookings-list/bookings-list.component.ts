import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerApiService } from '../../../services/owner-api.service';
import { Booking, BookingStatus } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ getTitle() }}</h2>
        <p class="text-gray-600">{{ getDescription() }}</p>
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
            <button (click)="selectedTab.set('pending')"
              [class]="selectedTab() === 'pending'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Pending ({{ pendingBookings().length }})
            </button>
            <button (click)="selectedTab.set('confirmed')"
              [class]="selectedTab() === 'confirmed'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Confirmed ({{ confirmedBookings().length }})
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

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <input type="text" [value]="searchQuery" (input)="searchQuery = $any($event.target).value; onSearchChange()"
          placeholder="Search by field name or booking ID..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
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
          [title]="getEmptyTitle()"
          [message]="getEmptyMessage()"
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
                      <h3 class="text-xl font-bold text-gray-900">{{ booking.field?.name || 'Field #' + booking.fieldId }}</h3>
                      <span [class]="getStatusBadgeClass(booking.status)">
                        {{ booking.status }}
                      </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <!-- Booking ID -->
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Booking ID</label>
                        <p class="text-sm font-semibold text-gray-900">#{{ booking.id }}</p>
                      </div>

                      <!-- Date -->
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <p class="text-sm text-gray-900">{{ formatDate(booking.bookingDate) }}</p>
                      </div>

                      <!-- Time -->
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Time</label>
                        <p class="text-sm text-gray-900">{{ booking.startTime }} - {{ booking.endTime }}</p>
                      </div>

                      <!-- Price -->
                      @if (booking.totalPrice) {
                        <div>
                          <label class="block text-xs font-medium text-gray-500 mb-1">Price</label>
                          <p class="text-sm font-semibold text-indigo-600">{{ booking.totalPrice }} DT</p>
                        </div>
                      }
                    </div>

                    <!-- Field Info -->
                    @if (booking.field) {
                      <div class="flex items-center gap-4 text-sm text-gray-600">
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {{ booking.field.city }}
                        </span>
                        <span>{{ getFieldIcon(booking.field.type) }} {{ booking.field.type }}</span>
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-2 ml-4">
                    <button [routerLink]="['/owner/bookings', booking.id]"
                      class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap">
                      View Details
                    </button>
                    
                    @if (booking.status === 'PENDING') {
                      <div class="flex gap-2">
                        <button (click)="updateStatus(booking.id!, 'CONFIRMED')"
                          [disabled]="updatingId() === booking.id"
                          class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50">
                          Accept
                        </button>
                        <button (click)="updateStatus(booking.id!, 'CANCELLED')"
                          [disabled]="updatingId() === booking.id"
                          class="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Results Count -->
        <div class="mt-8 text-center text-sm text-gray-600">
          Showing {{ displayedBookings().length }} of {{ allBookings().length }} bookings
        </div>
      }
    </div>
  `
})
export class BookingsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ownerApi = inject(OwnerApiService);

  // Signals
  allBookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedTab = signal<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  searchQuery = '';
  filteredBookings = signal<Booking[]>([]);
  updatingId = signal<number | null>(null);
  viewMode = signal<'all' | 'recent'>('all');

  // Computed
  pendingBookings = computed(() =>
    this.allBookings().filter(b => b.status === 'PENDING')
  );

  confirmedBookings = computed(() =>
    this.allBookings().filter(b => b.status === 'CONFIRMED')
  );

  completedBookings = computed(() =>
    this.allBookings().filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
  );

  displayedBookings = computed(() => {
    let bookings = this.filteredBookings();

    switch (this.selectedTab()) {
      case 'pending':
        bookings = bookings.filter(b => b.status === 'PENDING');
        break;
      case 'confirmed':
        bookings = bookings.filter(b => b.status === 'CONFIRMED');
        break;
      case 'completed':
        bookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
        break;
    }

    return bookings;
  });

  ngOnInit(): void {
    // Check route to determine view mode
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'recent') {
      this.viewMode.set('recent');
    }

    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request = this.viewMode() === 'recent'
      ? this.ownerApi.getRecentBookings()
      : this.ownerApi.getAllBookings();

    request.subscribe({
      next: (bookings) => {
        // Sort by date (newest first)
        const sorted = bookings.sort((a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
        this.allBookings.set(sorted);
        this.filteredBookings.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.errorMessage.set('Failed to load bookings. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredBookings.set(this.allBookings());
      return;
    }

    const filtered = this.allBookings().filter(b =>
      b.field?.name.toLowerCase().includes(query) ||
      b.id?.toString().includes(query)
    );
    this.filteredBookings.set(filtered);
  }

  updateStatus(bookingId: number, status: string): void {
    this.updatingId.set(bookingId);

    this.ownerApi.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        // Update booking in list
        this.allBookings.update(bookings =>
          bookings.map(b => b.id === bookingId ? { ...b, status: status as BookingStatus } : b)
        );
        this.onSearchChange(); // Refresh filtered list
        this.updatingId.set(null);
      },
      error: (err) => {
        console.error('Error updating booking status:', err);
        alert('Failed to update booking status. Please try again.');
        this.updatingId.set(null);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTitle(): string {
    return this.viewMode() === 'recent' ? 'Recent Bookings' : 'All Bookings';
  }

  getDescription(): string {
    return this.viewMode() === 'recent'
      ? 'Bookings from the last 30 days'
      : 'Manage all bookings for your fields';
  }

  getEmptyTitle(): string {
    switch (this.selectedTab()) {
      case 'pending':
        return 'No pending bookings';
      case 'confirmed':
        return 'No confirmed bookings';
      case 'completed':
        return 'No completed bookings';
      default:
        return 'No bookings yet';
    }
  }

  getEmptyMessage(): string {
    if (this.searchQuery) {
      return 'Try adjusting your search';
    }
    return 'Bookings will appear here once players book your fields';
  }
}
