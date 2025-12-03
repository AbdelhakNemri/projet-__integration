import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerApiService } from '../../services/owner-api.service';
import { Field } from '../../../../core/models/field.model';
import { Booking, BookingStats } from '../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div>
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h2>
        <p class="text-gray-600">Manage your fields and track your bookings</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (stat of stats(); track stat.title) {
          <div
            [class]="'bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer'"
            [routerLink]="stat.route || null"
          >
            <div class="flex items-center justify-between mb-4">
              <div [class]="'p-3 rounded-lg ' + stat.color">
                <span class="text-2xl">{{ stat.icon }}</span>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- My Fields -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">My Fields</h3>
            <a
              routerLink="/owner/fields/create"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Field
            </a>
          </div>
          <div class="p-6">
            @if (loadingFields()) {
              <app-loading-spinner message="Loading fields..."></app-loading-spinner>
            } @else if (myFields().length === 0) {
              <app-empty-state
                icon="🏟️"
                title="No fields yet"
                message="Start by creating your first sports field!"
                actionLabel="Create Field"
                actionRoute="/owner/fields/create"
              ></app-empty-state>
            } @else {
              <div class="space-y-4">
                @for (field of myFields().slice(0, 5); track field.id) {
                  <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 mb-1">{{ field.name }}</h4>
                        <p class="text-sm text-gray-600 mb-2">{{ field.type }} • {{ field.city }}</p>
                        @if (field.pricePerHour) {
                          <p class="text-sm font-medium text-primary-600">
                            {{ field.pricePerHour }} DT/hour
                          </p>
                        }
                      </div>
                      <a
                        [routerLink]="['/owner/fields', field.id]"
                        class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                }
                <a
                  routerLink="/owner/fields/my-fields"
                  class="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  View all fields →
                </a>
              </div>
            }
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div class="p-6">
            @if (loadingBookings()) {
              <app-loading-spinner message="Loading bookings..."></app-loading-spinner>
            } @else if (recentBookings().length === 0) {
              <app-empty-state
                icon="📅"
                title="No bookings yet"
                message="Bookings for your fields will appear here."
                actionLabel="View All Bookings"
                actionRoute="/owner/bookings/all"
              ></app-empty-state>
            } @else {
              <div class="space-y-4">
                @for (booking of recentBookings(); track booking.id) {
                  <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 mb-1">
                          {{ booking.field?.name || 'Field' }}
                        </h4>
                        <p class="text-sm text-gray-600 mb-2">
                          {{ formatDate(booking.bookingDate) }} • 
                          {{ booking.startTime }} - {{ booking.endTime }}
                        </p>
                        <div class="flex items-center gap-2">
                          <span
                            [class]="'inline-block px-2 py-1 text-xs rounded ' + getStatusClass(booking.status)"
                          >
                            {{ booking.status }}
                          </span>
                          @if (booking.player) {
                            <span class="text-xs text-gray-500">
                              by {{ booking.player.email }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
                <a
                  routerLink="/owner/bookings/all"
                  class="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  View all bookings →
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OwnerDashboardComponent implements OnInit {
  private ownerApi = inject(OwnerApiService);

  myFields = signal<Field[]>([]);
  recentBookings = signal<Booking[]>([]);
  bookingStats = signal<BookingStats | null>(null);
  loadingFields = signal(false);
  loadingBookings = signal(false);

  stats = computed<StatCard[]>(() => {
    const stats = this.bookingStats();
    const totalBookings = stats?.total || 0;
    const pendingBookings = stats?.pending || 0;
    const confirmedBookings = stats?.confirmed || 0;

    // Calculate total revenue from confirmed and completed bookings
    const revenue = this.recentBookings()
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return [
      {
        title: 'Total Bookings',
        value: totalBookings,
        icon: '📅',
        color: 'bg-indigo-100',
        route: '/owner/bookings/all',
      },
      {
        title: 'Pending',
        value: pendingBookings,
        icon: '⏳',
        color: 'bg-yellow-100',
        route: '/owner/bookings/all',
      },
      {
        title: 'Confirmed',
        value: confirmedBookings,
        icon: '✅',
        color: 'bg-green-100',
        route: '/owner/bookings/all',
      },
      {
        title: 'Total Revenue',
        value: revenue > 0 ? `${revenue} DT` : '0 DT',
        icon: '💰',
        color: 'bg-purple-100',
        route: '/owner/bookings/all',
      },
    ];
  });

  ngOnInit(): void {
    this.loadMyFields();
    this.loadRecentBookings();
    this.loadBookingStats();
  }

  loadMyFields(): void {
    this.loadingFields.set(true);
    this.ownerApi.getMyFields().subscribe({
      next: (fields) => {
        this.myFields.set(fields);
        this.loadingFields.set(false);
      },
      error: (error) => {
        console.error('Error loading fields:', error);
        this.loadingFields.set(false);
      },
    });
  }

  loadRecentBookings(): void {
    this.loadingBookings.set(true);
    this.ownerApi.getRecentBookings().subscribe({
      next: (bookings) => {
        this.recentBookings.set(bookings);
        this.loadingBookings.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loadingBookings.set(false);
      },
    });
  }

  loadBookingStats(): void {
    this.ownerApi.getBookingStats().subscribe({
      next: (stats) => {
        this.bookingStats.set(stats);
      },
      error: (error) => {
        console.error('Error loading booking stats:', error);
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
