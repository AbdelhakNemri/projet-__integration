import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService } from '../../../services/owner-api.service';
import { Field, FieldReview } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-field-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Field Reviews</h2>
        <p class="text-gray-600">See what players are saying about your fields</p>
      </div>

      <!-- Field Selector -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <label for="fieldSelect" class="block text-sm font-medium text-gray-700 mb-2">Select Field</label>
        <select
          id="fieldSelect"
          [ngModel]="selectedFieldId()"
          (ngModelChange)="onFieldSelect($event)"
          class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option [ngValue]="null">Select a field...</option>
          @for (field of myFields(); track field.id) {
            <option [value]="field.id">{{ field.name }} ({{ field.city }})</option>
          }
        </select>
      </div>

      <!-- Content -->
      @if (loadingFields()) {
        <app-loading-spinner message="Loading fields..."></app-loading-spinner>
      } @else if (selectedFieldId()) {
        @if (loadingReviews()) {
          <app-loading-spinner message="Loading reviews..."></app-loading-spinner>
        } @else if (reviews().length === 0) {
          <app-empty-state
            icon="⭐"
            title="No reviews yet"
            message="This field hasn't received any reviews yet."
          ></app-empty-state>
        } @else {
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Average Rating -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Average Rating</h3>
              <div class="flex items-end gap-2">
                <span class="text-4xl font-bold text-gray-900">{{ averageRating() | number:'1.1-1' }}</span>
                <div class="flex items-center mb-1">
                  <span class="text-yellow-400 text-xl">★</span>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-2">Based on {{ reviews().length }} reviews</p>
            </div>

            <!-- Rating Distribution -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
              <h3 class="text-sm font-medium text-gray-500 mb-4">Rating Distribution</h3>
              <div class="space-y-2">
                @for (star of [5, 4, 3, 2, 1]; track star) {
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-600 w-3">{{ star }}</span>
                    <span class="text-yellow-400 text-sm">★</span>
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-yellow-400 rounded-full"
                        [style.width.%]="getRatingPercentage(star)"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 w-8 text-right">{{ getRatingCount(star) }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Reviews List -->
          <div class="space-y-4">
            @for (review of reviews(); track review.id) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {{ (review.playerEmail?.charAt(0) || 'U').toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ review.playerEmail || 'Anonymous Player' }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                    <span class="text-yellow-500 mr-1">★</span>
                    <span class="font-bold text-gray-900">{{ review.rating }}</span>
                  </div>
                </div>
                @if (review.comment) {
                  <p class="text-gray-600 leading-relaxed">{{ review.comment }}</p>
                }
              </div>
            }
          </div>
        }
      } @else {
        <app-empty-state
          icon="👈"
          title="Select a field"
          message="Please select a field from the dropdown above to view its reviews."
        ></app-empty-state>
      }
    </div>
  `,
})
export class FieldReviewsComponent implements OnInit {
  private ownerApi = inject(OwnerApiService);

  myFields = signal<Field[]>([]);
  selectedFieldId = signal<number | null>(null);
  reviews = signal<FieldReview[]>([]);

  loadingFields = signal(false);
  loadingReviews = signal(false);

  // Computed stats
  averageRating = computed(() => {
    const currentReviews = this.reviews();
    if (currentReviews.length === 0) return 0;
    const sum = currentReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / currentReviews.length;
  });

  ngOnInit() {
    this.loadFields();
  }

  loadFields() {
    this.loadingFields.set(true);
    this.ownerApi.getMyFields().subscribe({
      next: (fields) => {
        this.myFields.set(fields);
        this.loadingFields.set(false);

        // Auto-select first field if available
        if (fields.length > 0) {
          this.onFieldSelect(fields[0].id!);
        }
      },
      error: (err) => {
        console.error('Error loading fields:', err);
        this.loadingFields.set(false);
      }
    });
  }

  onFieldSelect(fieldId: number) {
    this.selectedFieldId.set(fieldId);
    if (fieldId) {
      this.loadReviews(fieldId);
    } else {
      this.reviews.set([]);
    }
  }

  loadReviews(fieldId: number) {
    this.loadingReviews.set(true);
    this.ownerApi.getFieldReviews(fieldId).subscribe({
      next: (reviews) => {
        // Sort by date (newest first)
        const sorted = reviews.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        this.reviews.set(sorted);
        this.loadingReviews.set(false);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews.set(false);
      }
    });
  }

  getRatingCount(rating: number): number {
    return this.reviews().filter(r => Math.round(r.rating) === rating).length;
  }

  getRatingPercentage(rating: number): number {
    const total = this.reviews().length;
    if (total === 0) return 0;
    return (this.getRatingCount(rating) / total) * 100;
  }

  formatDate(date?: string): string {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
