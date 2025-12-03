import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldApiService } from '../../../services/field-api.service';
import { Field, FieldType } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Browse Fields</h2>
        <p class="text-gray-600">Find and book the perfect field for your game</p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input type="text" id="search" [(ngModel)]="searchQuery" (input)="onSearchChange()"
              placeholder="Search by name or city..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>

          <!-- City Filter -->
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select id="city" [(ngModel)]="selectedCity" (change)="applyFilters()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">All Cities</option>
              @for (city of cities(); track city) {
                <option [value]="city">{{ city }}</option>
              }
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
            <select id="type" [(ngModel)]="selectedType" (change)="applyFilters()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">All Types</option>
              <option value="FOOTBALL">Football</option>
              <option value="BASKETBALL">Basketball</option>
              <option value="TENNIS">Tennis</option>
              <option value="VOLLEYBALL">Volleyball</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <!-- Clear Filters -->
        @if (selectedCity || selectedType || searchQuery) {
          <div class="mt-4">
            <button (click)="clearFilters()" 
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Clear all filters
            </button>
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading fields..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Empty State -->
      @else if (filteredFields().length === 0) {
        <app-empty-state
          icon="🏟️"
          title="No fields found"
          message="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          (actionClick)="clearFilters()"
        ></app-empty-state>
      }

      <!-- Fields Grid -->
      @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (field of filteredFields(); track field.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              [routerLink]="['/player/fields', field.id]">
              
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

                @if (field.description) {
                  <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ field.description }}</p>
                }

                <!-- Amenities -->
                @if (field.amenities && field.amenities.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (amenity of field.amenities.slice(0, 3); track amenity) {
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        {{ amenity }}
                      </span>
                    }
                    @if (field.amenities.length > 3) {
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        +{{ field.amenities.length - 3 }} more
                      </span>
                    }
                  </div>
                }

                <!-- View Details Button -->
                <button class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  View Details & Book
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Results Count -->
        <div class="mt-8 text-center text-sm text-gray-600">
          Showing {{ filteredFields().length }} of {{ allFields().length }} fields
        </div>
      }
    </div>
  `
})
export class FieldListComponent implements OnInit {
  private fieldApi = inject(FieldApiService);

  // Signals
  allFields = signal<Field[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filters
  searchQuery = '';
  selectedCity = '';
  selectedType: FieldType | '' = '';

  // Computed
  cities = computed(() => {
    const citySet = new Set(this.allFields().map(f => f.city));
    return Array.from(citySet).sort();
  });

  filteredFields = computed(() => {
    let fields = this.allFields();

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      fields = fields.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.city.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query)
      );
    }

    // City filter
    if (this.selectedCity) {
      fields = fields.filter(f => f.city === this.selectedCity);
    }

    // Type filter
    if (this.selectedType) {
      fields = fields.filter(f => f.type === this.selectedType);
    }

    return fields;
  });

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fieldApi.getAllFields().subscribe({
      next: (fields) => {
        this.allFields.set(fields);
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
    // Trigger filter update (computed signal will recalculate)
    this.allFields.set([...this.allFields()]);
  }

  applyFilters(): void {
    // Trigger filter update (computed signal will recalculate)
    this.allFields.set([...this.allFields()]);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCity = '';
    this.selectedType = '';
    this.applyFilters();
  }

  getFieldIcon(type: FieldType): string {
    const icons: Record<FieldType, string> = {
      FOOTBALL: '⚽',
      BASKETBALL: '🏀',
      TENNIS: '🎾',
      VOLLEYBALL: '🏐',
      OTHER: '🏟️'
    };
    return icons[type] || '🏟️';
  }
}
