import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventApiService } from '../../../services/event-api.service';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { Event } from '../../../../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Browse Events</h2>
          <p class="text-gray-600">Find and join sports events in your area</p>
        </div>
        <button routerLink="/player/events/create" 
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Create Event
        </button>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex gap-4">
          <div class="flex-1">
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
              placeholder="Search events by title or description..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          @if (searchQuery) {
            <button (click)="clearSearch()" 
              class="px-4 py-2 text-gray-600 hover:text-gray-900">
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading events..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (filteredEvents().length === 0) {
        <app-empty-state
          icon="⚽"
          title="No events found"
          [message]="searchQuery ? 'Try adjusting your search' : 'No public events available at the moment'"
          actionLabel="Create Event"
          actionRoute="/player/events/create"
        ></app-empty-state>
      }

      <!-- Events Grid -->
      @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (event of filteredEvents(); track event.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <!-- Event Header -->
              <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h3 class="text-xl font-bold mb-2">{{ event.title }}</h3>
                <div class="flex items-center text-indigo-100 text-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>{{ event.organizerEmail || 'Organizer' }}</span>
                </div>
              </div>

              <!-- Event Details -->
              <div class="p-6">
                @if (event.description) {
                  <p class="text-gray-600 mb-4 line-clamp-2">{{ event.description }}</p>
                }

                <div class="space-y-3 mb-4">
                  <!-- Date & Time -->
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(event.date) }}{{ event.time ? ' at ' + event.time : '' }}</span>
                  </div>

                  <!-- Location -->
                  @if (event.location) {
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ event.location }}</span>
                    </div>
                  }

                  <!-- Participants -->
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>
                      {{ event.currentParticipants || 0 }}{{ event.maxParticipants ? '/' + event.maxParticipants : '' }} participants
                    </span>
                  </div>
                </div>

                <!-- Status Badge -->
                @if (event.status) {
                  <div class="mb-4">
                    <span [class]="getStatusBadgeClass(event.status)">
                      {{ event.status }}
                    </span>
                  </div>
                }

                <!-- Actions -->
                <div class="flex gap-2">
                  <button [routerLink]="['/player/events', event.id]"
                    class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  
                  @if (isParticipant(event)) {
                    <button disabled
                      class="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium border border-gray-200">
                      Joined
                    </button>
                  } @else if (canJoinEvent(event)) {
                    <button (click)="joinEvent(event)"
                      [disabled]="joiningId() === event.id"
                      class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (joiningId() === event.id) {
                        <span class="flex items-center justify-center">
                          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      } @else {
                        Join
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Results Count -->
        <div class="mt-8 text-center text-sm text-gray-600">
          Showing {{ filteredEvents().length }} of {{ allEvents().length }} events
        </div>
      }
    </div>
  `
})
export class EventListComponent implements OnInit {
  private eventApi = inject(EventApiService);
  private router = inject(Router);
  private userContext = inject(UserContextService);

  // Signals
  allEvents = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  searchQuery = '';
  joiningId = signal<number | null>(null);
  currentUser = this.userContext.authUserInfo;

  // Computed
  filteredEvents = computed(() => {
    let events = this.allEvents();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query)
      );
    }

    return events;
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventApi.getAvailableEvents().subscribe({
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
        this.errorMessage.set('Failed to load events. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    // Trigger filter update
    this.allEvents.set([...this.allEvents()]);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  isParticipant(event: Event): boolean {
    const user = this.currentUser();
    if (!user || !event.participants) return false;
    return event.participants.some(p => p.playerEmail === user.email);
  }

  canJoinEvent(event: Event): boolean {
    // Can join if:
    // - Event is public
    // - Not full (if maxParticipants is set)
    // - Status is UPCOMING or PLANNED
    // - Not already a participant
    if (!event.isPublic) return false;
    if (event.status && event.status !== 'UPCOMING' && event.status !== 'PLANNED') return false;
    if (this.isParticipant(event)) return false;
    if (event.maxParticipants && event.currentParticipants &&
      event.currentParticipants >= event.maxParticipants) {
      return false;
    }
    return true;
  }

  joinEvent(event: Event): void {
    if (!event.id) return;

    this.joiningId.set(event.id);

    this.eventApi.joinEvent(event.id).subscribe({
      next: () => {
        this.router.navigate(['/player/events/my-participations']);
      },
      error: (err) => {
        console.error('Error joining event:', err);
        alert('Failed to join event. You may already be a participant.');
        this.joiningId.set(null);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      PLANNED: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
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
}
