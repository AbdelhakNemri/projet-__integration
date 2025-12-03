import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerApiService } from '../../../services/owner-api.service';
import { CreateFieldRequest, FieldType } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-field-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Back Button -->
      <button routerLink="/owner/fields/my-fields" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to My Fields
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ isEditMode() ? 'Edit Field' : 'Add New Field' }}</h2>
        <p class="text-gray-600">{{ isEditMode() ? 'Update your field information' : 'Create a new sports field' }}</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading field data..."></app-loading-spinner>
      }

      <!-- Form -->
      @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form [formGroup]="fieldForm" (ngSubmit)="onSubmit()">
            
            <!-- Field Name -->
            <div class="mb-6">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Field Name <span class="text-red-500">*</span>
              </label>
              <input type="text" id="name" formControlName="name"
                placeholder="e.g., Stade Municipal"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="isFieldInvalid('name')">
              @if (isFieldInvalid('name')) {
                <p class="mt-1 text-sm text-red-600">Field name is required (min 3 characters)</p>
              }
            </div>

            <!-- Field Type -->
            <div class="mb-6">
              <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
                Field Type <span class="text-red-500">*</span>
              </label>
              <select id="type" formControlName="type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="isFieldInvalid('type')">
                <option value="">Select field type...</option>
                <option value="FOOTBALL">⚽ Football</option>
                <option value="BASKETBALL">🏀 Basketball</option>
                <option value="TENNIS">🎾 Tennis</option>
                <option value="VOLLEYBALL">🏐 Volleyball</option>
                <option value="OTHER">🏟️ Other</option>
              </select>
              @if (isFieldInvalid('type')) {
                <p class="mt-1 text-sm text-red-600">Please select a field type</p>
              }
            </div>

            <!-- City -->
            <div class="mb-6">
              <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                City <span class="text-red-500">*</span>
              </label>
              <input type="text" id="city" formControlName="city"
                placeholder="e.g., Tunis"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="isFieldInvalid('city')">
              @if (isFieldInvalid('city')) {
                <p class="mt-1 text-sm text-red-600">City is required</p>
              }
            </div>

            <!-- Address -->
            <div class="mb-6">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input type="text" id="address" formControlName="address"
                placeholder="e.g., Avenue Habib Bourguiba"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea id="description" formControlName="description" rows="4"
                placeholder="Describe your field, facilities, rules, etc..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <!-- Price per Hour -->
            <div class="mb-6">
              <label for="pricePerHour" class="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour (DT)
              </label>
              <input type="number" id="pricePerHour" formControlName="pricePerHour"
                min="0" step="0.5"
                placeholder="e.g., 50"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <!-- Amenities -->
            <div class="mb-6">
              <label for="amenities" class="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <input type="text" id="amenities" [value]="amenitiesInput"
                (input)="amenitiesInput = $any($event.target).value"
                (keydown.enter)="addAmenity($event)"
                placeholder="Type amenity and press Enter (e.g., Parking, Showers, Lighting)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              
              <!-- Amenities Tags -->
              @if (amenities().length > 0) {
                <div class="mt-3 flex flex-wrap gap-2">
                  @for (amenity of amenities(); track amenity) {
                    <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{ amenity }}
                      <button type="button" (click)="removeAmenity(amenity)" class="ml-2 hover:text-indigo-900">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </span>
                  }
                </div>
              }
            </div>

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
              <button type="button" routerLink="/owner/fields/my-fields"
                class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="fieldForm.invalid || isSaving()"
                class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                @if (isSaving()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditMode() ? 'Updating...' : 'Creating...' }}
                } @else {
                  {{ isEditMode() ? 'Update Field' : 'Create Field' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class FieldFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ownerApi = inject(OwnerApiService);

  // Signals
  isEditMode = signal<boolean>(false);
  fieldId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  amenities = signal<string[]>([]);

  // Form
  fieldForm: FormGroup;
  amenitiesInput = '';

  constructor() {
    this.fieldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      city: ['', Validators.required],
      address: [''],
      description: [''],
      pricePerHour: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.fieldId.set(+id);
      this.loadField(+id);
    }
  }

  loadField(id: number): void {
    this.isLoading.set(true);

    this.ownerApi.getFieldById(id).subscribe({
      next: (field) => {
        this.fieldForm.patchValue({
          name: field.name,
          type: field.type,
          city: field.city,
          address: field.address || '',
          description: field.description || '',
          pricePerHour: field.pricePerHour || ''
        });

        if (field.amenities) {
          this.amenities.set([...field.amenities]);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading field:', err);
        this.errorMessage.set('Failed to load field data.');
        this.isLoading.set(false);
      }
    });
  }

  addAmenity(event: Event): void {
    event.preventDefault();
    const amenity = this.amenitiesInput.trim();
    if (amenity && !this.amenities().includes(amenity)) {
      this.amenities.update(list => [...list, amenity]);
      this.amenitiesInput = '';
    }
  }

  removeAmenity(amenity: string): void {
    this.amenities.update(list => list.filter(a => a !== amenity));
  }

  onSubmit(): void {
    if (this.fieldForm.invalid) {
      this.fieldForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const fieldData: CreateFieldRequest = {
      name: this.fieldForm.value.name,
      type: this.fieldForm.value.type as FieldType,
      city: this.fieldForm.value.city,
      address: this.fieldForm.value.address || undefined,
      description: this.fieldForm.value.description || undefined,
      pricePerHour: this.fieldForm.value.pricePerHour || undefined,
      amenities: this.amenities().length > 0 ? this.amenities() : undefined
    };

    const request = this.isEditMode()
      ? this.ownerApi.updateField(this.fieldId()!, fieldData)
      : this.ownerApi.createField(fieldData);

    request.subscribe({
      next: (field) => {
        this.successMessage.set(this.isEditMode() ? 'Field updated successfully!' : 'Field created successfully!');
        this.isSaving.set(false);

        // Redirect after 1 second
        setTimeout(() => {
          this.router.navigate(['/owner/fields', field.id]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error saving field:', err);
        this.errorMessage.set('Failed to save field. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.fieldForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
