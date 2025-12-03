import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerApiService } from '../../../services/owner-api.service';
import { Field } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-fields',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">My Fields</h2>
          <p class="text-gray-600">Manage your sports fields and availability</p>
        </div>
        <button routerLink="/owner/fields/create" 
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add New Field
        </button>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
          placeholder="Search fields by name, city, or type..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading your fields..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (filteredFields().length === 0 && !searchQuery) {
        <app-empty-state
          icon="🏟️"
          title="No fields yet"
          message="Start by adding your first sports field"
          actionLabel="Add New Field"
          actionRoute="/owner/fields/create"
        ></app-empty-state>
      }

      <!-- No Search Results -->
      @else if (filteredFields().length === 0 && searchQuery) {
        <app-empty-state
          icon="🔍"
          title="No fields found"
          message="Try adjusting your search"
        ></app-empty-state>
      }

      <!-- Fields Grid -->
      @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (field of filteredFields(); track field.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <!-- Field Image -->
              <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                @if (field.images && field.images.length > 0) {
                  <img [src]="field.images[0]" [alt]="field.name" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-white text-6xl">
                    {{ getFieldIcon(field.type) }}
                  </div>
                }
                
                <!-- Field Type Badge -->
                <div class="absolute top-4 right-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                    {{ field.type }}
                  </span>
                </div>
              </div>

              <!-- Field Info -->
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ field.name }}</h3>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <span class="mr-2">📍</span>
                    <span>{{ field.city }}{{ field.address ? ', ' + field.address : '' }}</span>
                  </div>
                  
                  @if (field.pricePerHour) {
                    <div class="flex items-center text-sm text-gray-600">
                      <span class="mr-2">💰</span>
                      <span class="font-semibold text-indigo-600">{{ field.pricePerHour }} DT/hour</span>
                    </div>
                  }
                </div>

                <!-- Amenities -->
                @if (field.amenities && field.amenities.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (amenity of field.amenities.slice(0, 2); track amenity) {
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        {{ amenity }}
                      </span>
                    }
                    @if (field.amenities.length > 2) {
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        +{{ field.amenities.length - 2 }}
                      </span>
                    }
                  </div>
                }

                <!-- Actions -->
                <div class="flex gap-2">
                  <button [routerLink]="['/owner/fields', field.id]"
                    class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    View
                  </button>
                  <button [routerLink]="['/owner/fields/edit', field.id]"
                    class="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                    Edit
                  </button>
                  <button (click)="confirmDelete(field)"
                    class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Results Count -->
        <div class="mt-8 text-center text-sm text-gray-600">
          Showing {{ filteredFields().length }} of {{ allFields().length }} fields
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (fieldToDelete()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Field?</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{{ fieldToDelete()!.name }}</strong>? This action cannot be undone and will also delete all associated bookings and availability slots.
            </p>
            <div class="flex gap-3">
              <button (click)="fieldToDelete.set(null)"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button (click)="deleteField()" [disabled]="isDeleting()"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isDeleting()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                } @else {
                  Yes, Delete
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyFieldsComponent implements OnInit {
  private ownerApi = inject(OwnerApiService);

  // Signals
  allFields = signal<Field[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  searchQuery = '';
  fieldToDelete = signal<Field | null>(null);
  isDeleting = signal<boolean>(false);

  // Computed
  filteredFields = signal<Field[]>([]);

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ownerApi.getMyFields().subscribe({
      next: (fields) => {
        this.allFields.set(fields);
        this.filteredFields.set(fields);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading fields:', err);
        this.errorMessage.set('Failed to load fields. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredFields.set(this.allFields());
      return;
    }

    const filtered = this.allFields().filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.city.toLowerCase().includes(query) ||
      f.type.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query)
    );
    this.filteredFields.set(filtered);
  }

  confirmDelete(field: Field): void {
    this.fieldToDelete.set(field);
  }

  deleteField(): void {
    const field = this.fieldToDelete();
    if (!field || !field.id) return;

    this.isDeleting.set(true);

    this.ownerApi.deleteField(field.id).subscribe({
      next: () => {
        // Remove from list
        this.allFields.update(fields => fields.filter(f => f.id !== field.id));
        this.onSearchChange(); // Update filtered list
        this.fieldToDelete.set(null);
        this.isDeleting.set(false);
      },
      error: (err) => {
        console.error('Error deleting field:', err);
        alert('Failed to delete field. Please try again.');
        this.isDeleting.set(false);
      }
    });
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
}
