import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventApiService } from '../../../services/event-api.service';
import { Event } from '../../../../../core/models/event.model';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/player/events/list" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Events
      </button>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading event details..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Event Details -->
      @else if (event()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Event Header -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                <div class="flex items-center justify-between mb-4">
                  <h1 class="text-3xl font-bold text-white">{{ event()!.title }}</h1>
                  @if (event()!.status) {
                    <span [class]="getStatusBadgeClass(event()!.status!)">
                      {{ event()!.status }}
                    </span>
                  }
                </div>
                <div class="flex items-center text-indigo-100">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>Organized by {{ event()!.organizerEmail || 'Unknown' }}</span>
                </div>
              </div>

              <!-- Event Info -->
              <div class="p-8">
                @if (event()!.description) {
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p class="text-gray-600 leading-relaxed">{{ event()!.description }}</p>
                  </div>
                }

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Date & Time -->
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <label class="block text-sm font-medium text-gray-500 mb-1">Date & Time</label>
                      <p class="text-lg font-semibold text-gray-900">{{ formatDate(event()!.date) }}</p>
                      @if (event()!.time) {
                        <p class="text-sm text-gray-600">{{ event()!.time }}</p>
                      }
                    </div>
                  </div>

                  <!-- Location -->
                  @if (event()!.location) {
                    <div class="flex items-start">
                      <div class="flex-shrink-0">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <label class="block text-sm font-medium text-gray-500 mb-1">Location</label>
                        <p class="text-lg font-semibold text-gray-900">{{ event()!.location }}</p>
                      </div>
                    </div>
                  }

                  <!-- Participants -->
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <label class="block text-sm font-medium text-gray-500 mb-1">Participants</label>
                      <p class="text-lg font-semibold text-gray-900">
                        {{ event()!.currentParticipants || 0 }}{{ event()!.maxParticipants ? '/' + event()!.maxParticipants : '' }}
                      </p>
                      @if (event()!.maxParticipants && event()!.currentParticipants) {
                        <p class="text-sm text-gray-600">
                          {{ event()!.maxParticipants! - event()!.currentParticipants! }} spots left
                        </p>
                      }
                    </div>
                  </div>

                  <!-- Visibility -->
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <label class="block text-sm font-medium text-gray-500 mb-1">Visibility</label>
                      <p class="text-lg font-semibold text-gray-900">
                        {{ event()!.isPublic ? 'Public' : 'Private' }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ event()!.isPublic ? 'Anyone can join' : 'Invite only' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Participants List -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Participating Players</h3>
              
              @if (event()!.participants && event()!.participants!.length > 0) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (participant of event()!.participants; track participant.id || participant.email) {
                    <div class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3 flex-shrink-0">
                        {{ getParticipantInitial(participant) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-gray-900 truncate">
                          {{ getParticipantName(participant) }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No participants yet. Be the first to join!</p>
                </div>
              }
            </div>

          </div>

          <!-- Action Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6 space-y-4">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Actions</h3>

              <!-- Join Event -->
              @if (canJoinEvent()) {
                <button (click)="joinEvent()" [disabled]="isJoining()"
                  class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  @if (isJoining()) {
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  } @else {
                    Join Event
                  }
                </button>
              }

              <!-- View Booking -->
              @if (event()!.bookingId) {
                <button [routerLink]="['/player/bookings', event()!.bookingId]"
                  class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  View Booking
                </button>
              }

              <!-- Invite Players (if organizer) -->
              @if (isOrganizer() && !event()!.isPublic) {
                <div class="pt-4 border-t border-gray-100">
                  <h4 class="font-medium text-gray-900 mb-3">Invite Players</h4>
                  <form [formGroup]="inviteForm" (ngSubmit)="invitePlayer()">
                    <input type="email" formControlName="email" placeholder="player@example.com"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2">
                    <button type="submit" [disabled]="inviteForm.invalid || isInviting()"
                      class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (isInviting()) {
                        Inviting...
                      } @else {
                        Send Invitation
                      }
                    </button>
                  </form>
                </div>
              }

              <!-- Event Info -->
              <div class="pt-4 border-t border-gray-100">
                <div class="space-y-2 text-sm">
                  @if (event()!.createdAt) {
                    <div>
                      <span class="text-gray-500">Created:</span>
                      <span class="ml-2 text-gray-900">{{ formatDateTime(event()!.createdAt!) }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private eventApi = inject(EventApiService);
  private userContext = inject(UserContextService);

  // Signals
  event = signal<Event | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isJoining = signal<boolean>(false);
  isInviting = signal<boolean>(false);

  // Form
  inviteForm: FormGroup;

  // Computed
  canJoinEvent = computed(() => {
    const e = this.event();
    if (!e) return false;
    if (!e.isPublic) return false;
    if (e.status && e.status !== 'UPCOMING') return false;
    if (e.maxParticipants && e.currentParticipants &&
      e.currentParticipants >= e.maxParticipants) {
      return false;
    }
    return true;
  });

  isOrganizer = computed(() => {
    const e = this.event();
    const authInfo = this.userContext.authUserInfo();
    if (!e || !authInfo) return false;
    return e.organizerEmail === authInfo.email;
  });

  constructor() {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(+eventId);
    } else {
      this.errorMessage.set('Invalid event ID');
      this.isLoading.set(false);
    }
  }

  loadEventDetails(eventId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventApi.getEventById(eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.errorMessage.set('Failed to load event details. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }


  joinEvent(): void {
    const e = this.event();
    if (!e || !e.id) return;

    this.isJoining.set(true);

    this.eventApi.joinEvent(e.id).subscribe({
      next: () => {
        this.router.navigate(['/player/events/my-participations']);
      },
      error: (err) => {
        console.error('Error joining event:', err);
        alert('Failed to join event. You may already be a participant.');
        this.isJoining.set(false);
      }
    });
  }

  invitePlayer(): void {
    if (this.inviteForm.invalid) return;

    const e = this.event();
    if (!e || !e.id) return;

    this.isInviting.set(true);

    const email = this.inviteForm.value.email;
    this.eventApi.invitePlayer(e.id, email).subscribe({
      next: () => {
        alert(`Invitation sent to ${email}`);
        this.inviteForm.reset();
        this.isInviting.set(false);
      },
      error: (err) => {
        console.error('Error inviting player:', err);
        alert('Failed to send invitation. Please try again.');
        this.isInviting.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      UPCOMING: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-green-800 border-2 border-white',
      ONGOING: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-blue-800 border-2 border-white',
      COMPLETED: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-800 border-2 border-white',
      CANCELLED: 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 text-red-800 border-2 border-white'
    };
    return classes[status] || classes['UPCOMING'];
  }

  getParticipantInitial(participant: any): string {
    if (participant.prenom) return participant.prenom.charAt(0).toUpperCase();
    if (participant.firstName) return participant.firstName.charAt(0).toUpperCase();
    if (participant.nom) return participant.nom.charAt(0).toUpperCase();
    if (participant.lastName) return participant.lastName.charAt(0).toUpperCase();

    const email = participant.playerEmail || participant.email;
    if (email) return email.charAt(0).toUpperCase();

    return 'P';
  }

  getParticipantName(participant: any): string {
    if (participant.prenom && participant.nom) {
      return `${participant.prenom} ${participant.nom}`;
    }
    if (participant.firstName && participant.lastName) {
      return `${participant.firstName} ${participant.lastName}`;
    }

    // Fallback to email username
    const email = participant.playerEmail || participant.email;
    if (email) {
      const username = email.split('@')[0];
      // Capitalize and replace dots/underscores with spaces
      return username
        .replace(/[._]/g, ' ')
        .split(' ')
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    }

    return 'Unknown Player';
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
