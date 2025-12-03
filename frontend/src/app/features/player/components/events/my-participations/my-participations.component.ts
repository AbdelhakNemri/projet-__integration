import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventApiService } from '../../../services/event-api.service';
import { Event } from '../../../../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-participations',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">My Events</h2>
        <p class="text-gray-600">Events you're organizing or participating in</p>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button (click)="selectedTab.set('all')"
              [class]="selectedTab() === 'all' 
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              All ({{ allEvents().length }})
            </button>
            <button (click)="selectedTab.set('upcoming')"
              [class]="selectedTab() === 'upcoming'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Upcoming ({{ upcomingEvents().length }})
            </button>
            <button (click)="selectedTab.set('past')"
              [class]="selectedTab() === 'past'
                ? 'border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'">
              Past ({{ pastEvents().length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading your events..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (displayedEvents().length === 0) {
        <app-empty-state
          icon="⚽"
          [title]="getEmptyTitle()"
          [message]="getEmptyMessage()"
          actionLabel="Browse Events"
          actionRoute="/player/events/list"
        ></app-empty-state>
      }

      <!-- Events List -->
      @else {
        <div class="space-y-4">
          @for (event of displayedEvents(); track event.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div class="p-6">
                <div class="flex items-start justify-between">
                  <!-- Event Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                      <h3 class="text-xl font-bold text-gray-900">{{ event.title }}</h3>
                      @if (event.status) {
                        <span [class]="getStatusBadgeClass(event.status)">
                          {{ event.status }}
                        </span>
                      }
                      @if (isOrganizer(event)) {
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Organizer
                        </span>
                      }
                    </div>

                    @if (event.description) {
                      <p class="text-gray-600 mb-4">{{ event.description }}</p>
                    }

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <!-- Date & Time -->
                      <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>{{ formatDate(event.date) }}{{ event.time ? ' at ' + event.time : '' }}</span>
                      </div>

                      <!-- Location -->
                      @if (event.location) {
                        <div class="flex items-center text-gray-600">
                          <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{{ event.location }}</span>
                        </div>
                      }

                      <!-- Participants -->
                      <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span>{{ event.currentParticipants || 0 }}{{ event.maxParticipants ? '/' + event.maxParticipants : '' }} participants</span>
                      </div>
                    </div>

                    <!-- Visibility -->
                    <div class="mt-4 flex items-center gap-4 text-sm">
                      <span [class]="event.isPublic ? 'text-green-600' : 'text-gray-600'">
                        {{ event.isPublic ? '🌐 Public Event' : '🔒 Private Event' }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-2 ml-4">
                    <button [routerLink]="['/player/events', event.id]"
                      class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap">
                      View Details
                    </button>
                    
                    @if (!isOrganizer(event) && event.status === 'UPCOMING') {
                      <button (click)="confirmLeave(event)"
                        [disabled]="leavingId() === event.id"
                        class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                        @if (leavingId() === event.id) {
                          <span class="flex items-center">
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        } @else {
                          Leave Event
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Leave Confirmation Modal -->
      @if (eventToLeave()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Leave Event?</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to leave <strong>{{ eventToLeave()!.title }}</strong>?
            </p>
            <div class="flex gap-3">
              <button (click)="eventToLeave.set(null)"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button (click)="leaveEvent()"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyParticipationsComponent implements OnInit {
  private eventApi = inject(EventApiService);

  // Signals
  allEvents = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedTab = signal<'all' | 'upcoming' | 'past'>('all');
  eventToLeave = signal<Event | null>(null);
  leavingId = signal<number | null>(null);

  // Computed
  upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allEvents().filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && (e.status === 'UPCOMING' || !e.status);
    });
  });

  pastEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allEvents().filter(e => {
      const eventDate = new Date(e.date);
      return eventDate < today || e.status === 'COMPLETED' || e.status === 'CANCELLED';
    });
  });

  displayedEvents = computed(() => {
    switch (this.selectedTab()) {
      case 'upcoming':
        return this.upcomingEvents();
      case 'past':
        return this.pastEvents();
      default:
        return this.allEvents();
    }
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventApi.getMyParticipations().subscribe({
      next: (events) => {
        // Sort by date (upcoming first)
        const sorted = events.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.allEvents.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.errorMessage.set('Failed to load your events. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  isOrganizer(event: Event): boolean {
    // This would need to check against current user ID
    // For now, we'll check if organizerEmail matches (you'd need to get current user email)
    return false; // TODO: Implement proper check
  }

  confirmLeave(event: Event): void {
    this.eventToLeave.set(event);
  }

  leaveEvent(): void {
    const event = this.eventToLeave();
    if (!event || !event.id) return;

    this.leavingId.set(event.id);

    // Note: You might need to add a leaveEvent method to EventApiService
    // For now, using removeParticipant with current user's ID
    // This is a placeholder - adjust based on your API
    this.eventApi.joinEvent(event.id).subscribe({
      next: () => {
        // Remove from list
        this.allEvents.update(events =>
          events.filter(e => e.id !== event.id)
        );
        this.eventToLeave.set(null);
        this.leavingId.set(null);
      },
      error: (err) => {
        console.error('Error leaving event:', err);
        alert('Failed to leave event. Please try again.');
        this.leavingId.set(null);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      UPCOMING: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
      ONGOING: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      COMPLETED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      CANCELLED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[status] || classes['UPCOMING'];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getEmptyTitle(): string {
    switch (this.selectedTab()) {
      case 'upcoming':
        return 'No upcoming events';
      case 'past':
        return 'No past events';
      default:
        return 'No events yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.selectedTab()) {
      case 'upcoming':
        return 'You have no upcoming events. Browse and join events!';
      case 'past':
        return 'You have no past events';
      default:
        return 'You haven\'t joined any events yet. Start by browsing available events!';
    }
  }
}
