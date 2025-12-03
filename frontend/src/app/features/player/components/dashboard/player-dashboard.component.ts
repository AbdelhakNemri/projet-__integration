import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerApiService } from '../../services/player-api.service';
import { EventApiService } from '../../services/event-api.service';
import { BookingApiService } from '../../services/booking-api.service';
import { User } from '../../../../core/models/user.model';
import { Event } from '../../../../core/models/event.model';
import { Booking } from '../../../../core/models/booking.model';
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
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div>
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ player()?.prenom || player()?.email || 'Player' }}!
        </h2>
        <p class="text-gray-600">Here's an overview of your activity</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (stat of stats(); track stat.title) {
          <div
            [class]="'bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer' + (stat.route ? '' : '')"
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
        <!-- Upcoming Events -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div class="p-6">
            @if (loadingEvents()) {
              <app-loading-spinner message="Loading events..."></app-loading-spinner>
            } @else if (upcomingEvents().length === 0) {
              <app-empty-state
                icon="⚽"
                title="No upcoming events"
                message="You don't have any upcoming events. Browse events to join!"
                actionLabel="Browse Events"
                actionRoute="/player/events/list"
              ></app-empty-state>
            } @else {
              <div class="space-y-4">
                @for (event of upcomingEvents(); track event.id) {
                  <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 mb-1">{{ event.title }}</h4>
                        <p class="text-sm text-gray-600 mb-2">{{ event.description }}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {{ formatDate(event.date) }}</span>
                          @if (event.location) {
                            <span>📍 {{ event.location }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
                <a
                  routerLink="/player/events/list"
                  class="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  View all events →
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
                message="You haven't made any field bookings. Start exploring fields!"
                actionLabel="Browse Fields"
                actionRoute="/player/fields/list"
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
                        <span
                          [class]="'inline-block px-2 py-1 text-xs rounded ' + getStatusClass(booking.status)"
                        >
                          {{ booking.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
                <a
                  routerLink="/player/bookings/my-bookings"
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
export class PlayerDashboardComponent implements OnInit {
  private playerApi = inject(PlayerApiService);
  private eventApi = inject(EventApiService);
  private bookingApi = inject(BookingApiService);

  player = signal<User | null>(null);
  upcomingEvents = signal<Event[]>([]);
  recentBookings = signal<Booking[]>([]);
  loadingEvents = signal(false);
  loadingBookings = signal(false);

  stats = computed<StatCard[]>(() => {
    const events = this.upcomingEvents().length;
    const bookings = this.recentBookings().length;
    const pendingInvitations = 0; // TODO: Get from invitations
    const unreadNotifications = 0; // TODO: Get from notifications

    return [
      {
        title: 'Upcoming Events',
        value: events,
        icon: '⚽',
        color: 'bg-blue-100',
        route: '/player/events/list',
      },
      {
        title: 'Active Bookings',
        value: bookings,
        icon: '📅',
        color: 'bg-green-100',
        route: '/player/bookings/my-bookings',
      },
      {
        title: 'Pending Invitations',
        value: pendingInvitations,
        icon: '📨',
        color: 'bg-yellow-100',
        route: '/player/events/invitations',
      },
      {
        title: 'Notifications',
        value: unreadNotifications,
        icon: '🔔',
        color: 'bg-purple-100',
      },
    ];
  });

  ngOnInit(): void {
    this.loadPlayerProfile();
    this.loadUpcomingEvents();
    this.loadRecentBookings();
  }

  loadPlayerProfile(): void {
    this.playerApi.getCurrentPlayer().subscribe({
      next: (player) => this.player.set(player),
      error: (error) => console.error('Error loading player profile:', error),
    });
  }

  loadUpcomingEvents(): void {
    this.loadingEvents.set(true);
    this.eventApi.getMyParticipations().subscribe({
      next: (events) => {
        // Filter upcoming events and sort by date
        const upcoming = events
          .filter((e) => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        this.upcomingEvents.set(upcoming);
        this.loadingEvents.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loadingEvents.set(false);
      },
    });
  }

  loadRecentBookings(): void {
    this.loadingBookings.set(true);
    this.bookingApi.getMyBookings().subscribe({
      next: (bookings) => {
        // Sort by date and get recent ones
        const recent = bookings
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
          .slice(0, 5);
        this.recentBookings.set(recent);
        this.loadingBookings.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loadingBookings.set(false);
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
