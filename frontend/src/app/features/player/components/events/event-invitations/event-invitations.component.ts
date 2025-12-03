import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventApiService } from '../../../services/event-api.service';
import { Event } from '../../../../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-event-invitations',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Event Invitations</h2>
        <p class="text-gray-600">Respond to event invitations from other players</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading invitations..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (invitations().length === 0) {
        <app-empty-state
          icon="📨"
          title="No pending invitations"
          message="You don't have any event invitations at the moment"
          actionLabel="Browse Events"
          actionRoute="/player/events/list"
        ></app-empty-state>
      }

      <!-- Invitations List -->
      @else {
        <div class="space-y-4">
          @for (invitation of invitations(); track invitation.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <!-- Invitation Header -->
              <div class="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-bold text-white">{{ invitation.title }}</h3>
                    <p class="text-purple-100 text-sm mt-1">
                      Invited by {{ invitation.organizerEmail || 'Event Organizer' }}
                    </p>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-purple-900">
                    Pending
                  </span>
                </div>
              </div>

              <!-- Invitation Details -->
              <div class="p-6">
                @if (invitation.description) {
                  <p class="text-gray-600 mb-4">{{ invitation.description }}</p>
                }

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <!-- Date & Time -->
                  <div class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(invitation.date) }}{{ invitation.time ? ' at ' + invitation.time : '' }}</span>
                  </div>

                  <!-- Location -->
                  @if (invitation.location) {
                    <div class="flex items-center text-gray-600">
                      <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ invitation.location }}</span>
                    </div>
                  }

                  <!-- Participants -->
                  <div class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>{{ invitation.currentParticipants || 0 }}{{ invitation.maxParticipants ? '/' + invitation.maxParticipants : '' }} participants</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <button [routerLink]="['/player/events', invitation.id]"
                    class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                    View Details
                  </button>
                  <button (click)="respondToInvitation(invitation, 'REFUSE')"
                    [disabled]="respondingId() === invitation.id"
                    class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    @if (respondingId() === invitation.id && respondingAction() === 'REFUSE') {
                      <span class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    } @else {
                      Decline
                    }
                  </button>
                  <button (click)="respondToInvitation(invitation, 'ACCEPT')"
                    [disabled]="respondingId() === invitation.id"
                    class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    @if (respondingId() === invitation.id && respondingAction() === 'ACCEPT') {
                      <span class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    } @else {
                      Accept
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class EventInvitationsComponent implements OnInit {
  private eventApi = inject(EventApiService);

  // Signals
  invitations = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  respondingId = signal<number | null>(null);
  respondingAction = signal<'ACCEPT' | 'REFUSE' | null>(null);

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Note: You might need to add a getMyInvitations method to EventApiService
    // For now, this is a placeholder
    // Replace with actual API call when available
    this.eventApi.getMyParticipations().subscribe({
      next: (events) => {
        // Filter for pending invitations
        // This is a placeholder - adjust based on your actual API structure
        this.invitations.set([]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading invitations:', err);
        this.errorMessage.set('Failed to load invitations. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  respondToInvitation(event: Event, response: 'ACCEPT' | 'REFUSE'): void {
    if (!event.id) return;

    this.respondingId.set(event.id);
    this.respondingAction.set(response);

    this.eventApi.respondToInvitation(event.id, response).subscribe({
      next: () => {
        // Remove from invitations list
        this.invitations.update(invitations =>
          invitations.filter(inv => inv.id !== event.id)
        );
        this.respondingId.set(null);
        this.respondingAction.set(null);
      },
      error: (err) => {
        console.error('Error responding to invitation:', err);
        alert(`Failed to ${response.toLowerCase()} invitation. Please try again.`);
        this.respondingId.set(null);
        this.respondingAction.set(null);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
