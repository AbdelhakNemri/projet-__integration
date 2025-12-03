import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventApiService } from '../../../services/event-api.service';
import { BookingApiService } from '../../../services/booking-api.service';
import { CreateEventRequest } from '../../../../../core/models/event.model';
import { Booking } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/player/events/list" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Events
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Event</h2>
        <p class="text-gray-600">Organize a sports event using one of your confirmed bookings</p>
      </div>

      <!-- Loading Bookings -->
      @if (loadingBookings()) {
        <app-loading-spinner message="Loading your bookings..."></app-loading-spinner>
      }

      <!-- No Confirmed Bookings -->
      @else if (confirmedBookings().length === 0) {
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded shadow-sm">
          <div class="flex">
            <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-yellow-800 mb-2">No Confirmed Bookings</h3>
              <p class="text-yellow-700 mb-4">
                You need a confirmed field booking to create an event. Book a field first!
              </p>
              <button routerLink="/player/fields/list"
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Browse Fields
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Event Form -->
      @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
            
            <!-- Select Booking -->
            <div class="mb-6">
              <label for="booking" class="block text-sm font-medium text-gray-700 mb-2">
                Select Your Booking <span class="text-red-500">*</span>
              </label>
              <select id="booking" formControlName="bookingId"
                (change)="onBookingChange()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="isFieldInvalid('bookingId')">
                <option value="">Choose a confirmed booking...</option>
                @for (booking of confirmedBookings(); track booking.id) {
                  <option [value]="booking.id">
                    {{ booking.field?.name }} - {{ formatDate(booking.bookingDate) }} ({{ booking.startTime }} - {{ booking.endTime }})
                  </option>
                }
              </select>
              @if (isFieldInvalid('bookingId')) {
                <p class="mt-1 text-sm text-red-600">Please select a booking</p>
              }
              <p class="mt-1 text-xs text-gray-500">
                The event will be created for the selected booking's date, time, and location
              </p>
            </div>

            <!-- Event Title -->
            <div class="mb-6">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span class="text-red-500">*</span>
              </label>
              <input type="text" id="title" formControlName="title"
                placeholder="e.g., Friendly Football Match"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="isFieldInvalid('title')">
              @if (isFieldInvalid('title')) {
                <p class="mt-1 text-sm text-red-600">Title is required (min 3 characters)</p>
              }
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea id="description" formControlName="description" rows="4"
                placeholder="Describe your event, skill level, rules, etc..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <!-- Max Participants -->
            <div class="mb-6">
              <label for="maxParticipants" class="block text-sm font-medium text-gray-700 mb-2">
                Maximum Participants
              </label>
              <input type="number" id="maxParticipants" formControlName="maxParticipants"
                min="2" max="50"
                placeholder="e.g., 10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <p class="mt-1 text-xs text-gray-500">Leave empty for unlimited participants</p>
            </div>

            <!-- Public/Private -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Event Visibility <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <label class="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  [class.border-indigo-500]="eventForm.get('isPublic')?.value === true"
                  [class.bg-indigo-50]="eventForm.get('isPublic')?.value === true">
                  <input type="radio" formControlName="isPublic" [value]="true" class="mt-1">
                  <div class="ml-3">
                    <span class="font-medium text-gray-900">Public Event</span>
                    <p class="text-sm text-gray-600">Anyone can see and join this event</p>
                  </div>
                </label>
                
              </div>
            </div>

            <!-- Selected Booking Info -->
            @if (selectedBooking()) {
              <div class="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 class="font-medium text-indigo-900 mb-2">Event Details (from booking)</h4>
                <div class="space-y-1 text-sm text-indigo-700">
                  <p><strong>Date:</strong> {{ formatDate(selectedBooking()!.bookingDate) }}</p>
                  <p><strong>Time:</strong> {{ selectedBooking()!.startTime }} - {{ selectedBooking()!.endTime }}</p>
                  <p><strong>Location:</strong> {{ selectedBooking()!.field?.name }} ({{ selectedBooking()!.field?.city }})</p>
                </div>
              </div>
            }

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-sm text-red-700">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="text-sm text-green-700">{{ successMessage() }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-4">
              <button type="button" routerLink="/player/events/list"
                class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="eventForm.invalid || isCreating()"
                class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                @if (isCreating()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                } @else {
                  Create Event
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class CreateEventComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventApi = inject(EventApiService);
  private bookingApi = inject(BookingApiService);

  // Signals
  confirmedBookings = signal<Booking[]>([]);
  loadingBookings = signal<boolean>(true);
  selectedBooking = signal<Booking | null>(null);
  isCreating = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  eventForm: FormGroup;

  constructor() {
    this.eventForm = this.fb.group({
      bookingId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      maxParticipants: [''],
      isPublic: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadConfirmedBookings();
  }

  loadConfirmedBookings(): void {
    this.loadingBookings.set(true);

    this.bookingApi.getMyBookings().subscribe({
      next: (bookings) => {
        // Filter for confirmed bookings with future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const confirmed = bookings.filter(b =>
          b.status === 'CONFIRMED' &&
          new Date(b.bookingDate) >= today
        );

        this.confirmedBookings.set(confirmed);
        this.loadingBookings.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loadingBookings.set(false);
      }
    });
  }

  onBookingChange(): void {
    const bookingId = this.eventForm.get('bookingId')?.value;
    if (bookingId) {
      const booking = this.confirmedBookings().find(b => b.id === +bookingId);
      this.selectedBooking.set(booking || null);
    } else {
      this.selectedBooking.set(null);
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const booking = this.selectedBooking();
    if (!booking) {
      this.errorMessage.set('Please select a booking');
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!booking.startTime || !booking.endTime) {
      this.errorMessage.set('Selected booking has invalid time data');
      return;
    }

    // Ensure time is padded (e.g. "09:00" instead of "9:00")
    const padTime = (time: string) => time ? time.split(':').map(part => part.padStart(2, '0')).join(':') : '00:00';
    const startTime = padTime(booking.startTime);
    const endTime = padTime(booking.endTime);

    // Combine date and time to ISO string
    const dateTimeString = `${booking.bookingDate}T${startTime}:00`;

    // Calculate duration in minutes
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const eventData: CreateEventRequest = {
      title: this.eventForm.value.title,
      description: this.eventForm.value.description || undefined,
      eventDate: dateTimeString,
      duration: Math.round(durationMinutes),
      location: `${booking.field?.name}, ${booking.field?.city}`,
      maxParticipants: this.eventForm.value.maxParticipants ? Number(this.eventForm.value.maxParticipants) : 20,
      minParticipants: 2,
      isPublic: this.eventForm.value.isPublic,
      // fieldId: booking.fieldId, // Temporarily disabled to debug 400 error
      sportType: booking.field?.type || 'OTHER'
    };

    console.log('Sending Create Event Request:', eventData);

    this.eventApi.createEvent(eventData).subscribe({
      next: (event) => {
        this.successMessage.set('Event created successfully!');
        this.isCreating.set(false);

        // Redirect after 1 second
        setTimeout(() => {
          this.router.navigate(['/player/events', event.id]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error creating event:', err);
        this.errorMessage.set('Failed to create event. Please try again.');
        this.isCreating.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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
