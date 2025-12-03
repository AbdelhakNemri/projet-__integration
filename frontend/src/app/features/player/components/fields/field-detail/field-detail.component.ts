import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldApiService } from '../../../services/field-api.service';
import { BookingApiService } from '../../../services/booking-api.service';
import { Field, FieldAvailability, FieldReview } from '../../../../../core/models/field.model';
import { CreateBookingRequest } from '../../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/player/fields/list" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Fields
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
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Field Header -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <!-- Image Gallery -->
              <div class="h-96 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                @if (field()!.images && field()!.images!.length > 0) {
                  <img [src]="field()!.images![0]" [alt]="field()!.name" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-white text-9xl">
                    {{ getFieldIcon(field()!.type) }}
                  </div>
                }
                
                <!-- Type Badge -->
                <div class="absolute top-6 right-6">
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                    {{ field()!.type }}
                  </span>
                </div>
              </div>

              <!-- Field Info -->
              <div class="p-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ field()!.name }}</h1>
                
                <div class="flex flex-wrap gap-4 mb-6">
                  <div class="flex items-center text-gray-600">
                    <span class="mr-2 text-xl">📍</span>
                    <span>{{ field()!.city }}{{ field()!.address ? ', ' + field()!.address : '' }}</span>
                  </div>
                  
                  @if (field()!.pricePerHour) {
                    <div class="flex items-center">
                      <span class="mr-2 text-xl">💰</span>
                      <span class="text-2xl font-bold text-indigo-600">{{ field()!.pricePerHour }} DT</span>
                      <span class="text-gray-600 ml-1">/hour</span>
                    </div>
                  }
                </div>

                @if (field()!.description) {
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p class="text-gray-600 leading-relaxed">{{ field()!.description }}</p>
                  </div>
                }

                <!-- Amenities -->
                @if (field()!.amenities && field()!.amenities!.length > 0) {
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
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

            <!-- Reviews Section -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-900">Reviews</h3>
                <button (click)="showReviewForm.set(!showReviewForm())" 
                  type="button"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  [class.bg-indigo-600]="!showReviewForm()"
                  [class.text-white]="!showReviewForm()"
                  [class.hover:bg-indigo-700]="!showReviewForm()"
                  [class.bg-gray-200]="showReviewForm()"
                  [class.text-gray-700]="showReviewForm()"
                  [class.hover:bg-gray-300]="showReviewForm()">
                  {{ showReviewForm() ? 'Cancel' : 'Write a Review' }}
                </button>
              </div>

              <!-- Add Review Form -->
              @if (showReviewForm()) {
                <div class="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h4>
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                    <!-- Rating -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                      <div class="flex items-center space-x-1">
                        @for (star of [1,2,3,4,5]; track star) {
                          <button type="button" (click)="reviewForm.patchValue({rating: star})"
                            class="text-3xl focus:outline-none transition-all transform hover:scale-110"
                            [class.text-yellow-400]="star <= reviewForm.get('rating')?.value"
                            [class.text-gray-300]="star > reviewForm.get('rating')?.value">
                            ★
                          </button>
                        }
                        <span class="ml-3 text-sm text-gray-600">
                          {{ reviewForm.get('rating')?.value }} / 5
                        </span>
                      </div>
                    </div>

                    <!-- Comment -->
                    <div class="mb-4">
                      <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
                        Comment <span class="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <textarea id="comment" formControlName="comment" rows="4"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        placeholder="Tell us about your experience with this field..."></textarea>
                      <p class="mt-1 text-xs text-gray-500">
                        {{ reviewForm.get('comment')?.value?.length || 0 }} / 500 characters
                      </p>
                    </div>

                    <div class="flex gap-3">
                      <button type="submit" [disabled]="reviewForm.invalid || isSubmittingReview()"
                        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        @if (isSubmittingReview()) {
                          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        } @else {
                          Submit Review
                        }
                      </button>
                      <button type="button" (click)="showReviewForm.set(false)"
                        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              }
              
              @if (loadingReviews()) {
                <div class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              } @else if (reviews().length === 0) {
                <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <p class="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (review of reviews(); track review.id) {
                    <div class="border-b border-gray-100 pb-4 last:border-0">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-900">{{ review.reviewerEmail || review.playerEmail }}</span>
                        <div class="flex items-center">
                          @for (star of [1,2,3,4,5]; track star) {
                            <span [class]="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
                          }
                        </div>
                      </div>
                      @if (review.content || review.comment) {
                        <p class="text-gray-600">{{ review.content || review.comment }}</p>
                      }
                      <p class="text-xs text-gray-400 mt-1">{{ formatDate(review.createdAt!) }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Booking Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Book This Field</h3>

              <!-- Success Message -->
              @if (bookingSuccess()) {
                <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                  <div class="flex">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <p class="ml-3 text-sm text-green-700">Booking request submitted successfully!</p>
                  </div>
                </div>
              }

              <!-- Booking Error -->
              @if (bookingError()) {
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p class="text-sm text-red-700">{{ bookingError() }}</p>
                </div>
              }

              <form [formGroup]="bookingForm" (ngSubmit)="onBookingSubmit()">
                <!-- Date -->
                <div class="mb-4">
                  <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" id="date" formControlName="bookingDate"
                    [min]="minDate"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('bookingDate')">
                  @if (isFieldInvalid('bookingDate')) {
                    <p class="mt-1 text-sm text-red-600">Please select a date</p>
                  }
                </div>

                <!-- Start Time -->
                <div class="mb-4">
                  <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input type="time" id="startTime" formControlName="startTime"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('startTime')">
                  @if (isFieldInvalid('startTime')) {
                    <p class="mt-1 text-sm text-red-600">Please select start time</p>
                  }
                </div>

                <!-- End Time -->
                <div class="mb-4">
                  <label for="endTime" class="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input type="time" id="endTime" formControlName="endTime"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('endTime')">
                  @if (isFieldInvalid('endTime')) {
                    <p class="mt-1 text-sm text-red-600">Please select end time</p>
                  }
                </div>

                <!-- Price Calculation -->
                @if (estimatedPrice()) {
                  <div class="bg-indigo-50 rounded-lg p-4 mb-6">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-700">Estimated Price:</span>
                      <span class="text-2xl font-bold text-indigo-600">{{ estimatedPrice() }} DT</span>
                    </div>
                  </div>
                }

                <!-- Submit Button -->
                <button type="submit" [disabled]="bookingForm.invalid || isBooking()"
                  class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center">
                  @if (isBooking()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  } @else {
                    Book Now
                  }
                </button>
              </form>

              <p class="text-xs text-gray-500 mt-4 text-center">
                Your booking will be confirmed by the field owner
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FieldDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private fieldApi = inject(FieldApiService);
  private bookingApi = inject(BookingApiService);

  // Signals
  field = signal<Field | null>(null);
  reviews = signal<FieldReview[]>([]);
  isLoading = signal<boolean>(true);
  loadingReviews = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isBooking = signal<boolean>(false);
  bookingSuccess = signal<boolean>(false);
  bookingError = signal<string | null>(null);
  isSubmittingReview = signal<boolean>(false);
  showReviewForm = signal<boolean>(false);

  // Form
  bookingForm: FormGroup;
  reviewForm: FormGroup;
  minDate: string;

  // Computed
  estimatedPrice = computed(() => {
    const f = this.field();
    if (!f || !f.pricePerHour) return null;

    const start = this.bookingForm?.get('startTime')?.value;
    const end = this.bookingForm?.get('endTime')?.value;

    if (!start || !end) return null;

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) return null;

    const hours = (endMinutes - startMinutes) / 60;
    return Math.round(hours * f.pricePerHour * 100) / 100;
  });

  constructor() {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const fieldId = this.route.snapshot.paramMap.get('id');
    if (fieldId) {
      this.loadFieldDetails(+fieldId);
      this.loadReviews(+fieldId);
    } else {
      this.errorMessage.set('Invalid field ID');
      this.isLoading.set(false);
    }
  }

  loadFieldDetails(fieldId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fieldApi.getFieldById(fieldId).subscribe({
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

  loadReviews(fieldId: number): void {
    this.loadingReviews.set(true);

    this.fieldApi.getFieldReviews(fieldId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews.set(false);
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const f = this.field();
    if (!f || !f.id) return;

    this.isSubmittingReview.set(true);
    const { rating, comment } = this.reviewForm.value;

    this.fieldApi.addFieldReview(f.id, rating, comment || undefined).subscribe({
      next: (review) => {
        // Add new review to the beginning of the list
        this.reviews.update(reviews => [review, ...reviews]);
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.isSubmittingReview.set(false);
        this.showReviewForm.set(false);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        alert('Failed to submit review. Please try again.');
        this.isSubmittingReview.set(false);
      }
    });
  }

  onBookingSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const f = this.field();
    if (!f || !f.id) return;

    this.isBooking.set(true);
    this.bookingSuccess.set(false);
    this.bookingError.set(null);

    // Get form values
    const dateStr = this.bookingForm.value.bookingDate; // YYYY-MM-DD
    const startTime = this.bookingForm.value.startTime; // HH:mm
    const endTime = this.bookingForm.value.endTime; // HH:mm

    // Combine date and startTime into ISO datetime string
    const bookingDateTime = `${dateStr}T${startTime}:00`;

    // Calculate duration in hours
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationHours = Math.round((endMinutes - startMinutes) / 60 * 100) / 100;

    const booking: CreateBookingRequest = {
      fieldId: f.id,
      bookingDate: bookingDateTime,
      durationHours: durationHours,
      notes: undefined
    };

    console.log('Creating booking:', booking); // Debug log

    this.bookingApi.createBooking(booking).subscribe({
      next: () => {
        this.bookingSuccess.set(true);
        this.bookingForm.reset();
        this.isBooking.set(false);

        // Redirect to bookings after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/player/bookings/my-bookings']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        let errorMsg = 'Failed to create booking. ';
        if (err.status === 409) {
          errorMsg += 'This time slot is already booked.';
        } else if (err.status === 400) {
          errorMsg += 'Invalid booking details.';
        } else {
          errorMsg += 'Please try again later.';
        }
        this.bookingError.set(errorMsg);
        this.isBooking.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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
