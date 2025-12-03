import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvailabilityApiService } from '../../../services/availability-api.service';
import { OwnerApiService } from '../../../services/owner-api.service';
import { FieldAvailability, CreateAvailabilityRequest } from '../../../../../core/models/field.model';
import { Field } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-availability-management',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <!-- Back Button -->
      <button [routerLink]="['/owner/fields', fieldId()]" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Field Details
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Manage Availability</h2>
        @if (field()) {
          <p class="text-gray-600">Set available time slots for <strong>{{ field()!.name }}</strong></p>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading availability..."></app-loading-spinner>
      }

      <!-- Content -->
      @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Add Availability Form -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Add Time Slot</h3>
              
              <form [formGroup]="availabilityForm" (ngSubmit)="onSubmit()">
                <!-- Day of Week -->
                <div class="mb-4">
                  <label for="dayOfWeek" class="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week <span class="text-red-500">*</span>
                  </label>
                  <select id="dayOfWeek" formControlName="dayOfWeek"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('dayOfWeek')">
                    <option value="">Select day...</option>
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                  </select>
                  @if (isFieldInvalid('dayOfWeek')) {
                    <p class="mt-1 text-sm text-red-600">Please select a day</p>
                  }
                </div>

                <!-- Start Time -->
                <div class="mb-4">
                  <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span class="text-red-500">*</span>
                  </label>
                  <input type="time" id="startTime" formControlName="startTime"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('startTime')">
                  @if (isFieldInvalid('startTime')) {
                    <p class="mt-1 text-sm text-red-600">Please select start time</p>
                  }
                </div>

                <!-- End Time -->
                <div class="mb-4">
                  <label for="endTime" class="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span class="text-red-500">*</span>
                  </label>
                  <input type="time" id="endTime" formControlName="endTime"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="isFieldInvalid('endTime')">
                  @if (isFieldInvalid('endTime')) {
                    <p class="mt-1 text-sm text-red-600">Please select end time</p>
                  }
                </div>

                <!-- Available Toggle -->
                <div class="mb-6">
                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="isAvailable" class="sr-only peer">
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span class="ml-3 text-sm font-medium text-gray-700">Available</span>
                  </label>
                  <p class="mt-1 text-xs text-gray-500">Toggle to mark this time slot as available or unavailable</p>
                </div>

                <!-- Error Message -->
                @if (errorMessage()) {
                  <div class="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <p class="text-sm text-red-700">{{ errorMessage() }}</p>
                  </div>
                }

                <!-- Success Message -->
                @if (successMessage()) {
                  <div class="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p class="text-sm text-green-700">{{ successMessage() }}</p>
                  </div>
                }

                <!-- Submit Button -->
                <button type="submit" [disabled]="availabilityForm.invalid || isSaving()"
                  class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  @if (isSaving()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  } @else {
                    Add Time Slot
                  }
                </button>
              </form>
            </div>
          </div>

          <!-- Availability List -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Weekly Schedule</h3>

              @if (loadingSlots()) {
                <div class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              } @else if (availabilitySlots().length === 0) {
                <div class="text-center py-12">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="mt-4 text-gray-500">No time slots added yet</p>
                  <p class="text-sm text-gray-400">Add your first availability slot using the form</p>
                </div>
              } @else {
                <!-- Group by Day -->
                @for (day of daysOfWeek; track day) {
                  @if (getSlotsByDay(day).length > 0) {
                    <div class="mb-6 last:mb-0">
                      <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <span class="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                        {{ day }}
                      </h4>
                      <div class="space-y-2">
                        @for (slot of getSlotsByDay(day); track slot.id) {
                          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                            [class.bg-gray-50]="!slot.isAvailable">
                            <div class="flex items-center gap-4">
                              <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span class="font-medium text-gray-900">{{ slot.startTime }} - {{ slot.endTime }}</span>
                              </div>
                              <span [class]="slot.isAvailable 
                                ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                                : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'">
                                {{ slot.isAvailable ? 'Available' : 'Unavailable' }}
                              </span>
                            </div>
                            <button (click)="deleteSlot(slot)" [disabled]="deletingId() === slot.id"
                              class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                              @if (deletingId() === slot.id) {
                                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              } @else {
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              }
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AvailabilityManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private availabilityApi = inject(AvailabilityApiService);
  private ownerApi = inject(OwnerApiService);

  // Signals
  fieldId = signal<number | null>(null);
  field = signal<Field | null>(null);
  availabilitySlots = signal<FieldAvailability[]>([]);
  isLoading = signal<boolean>(true);
  loadingSlots = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Form
  availabilityForm: FormGroup;

  // Days of week
  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor() {
    this.availabilityForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fieldId.set(+id);
      this.loadField(+id);
      this.loadAvailability(+id);
    } else {
      this.errorMessage.set('Invalid field ID');
      this.isLoading.set(false);
    }
  }

  loadField(fieldId: number): void {
    this.ownerApi.getFieldById(fieldId).subscribe({
      next: (field) => {
        this.field.set(field);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading field:', err);
        this.errorMessage.set('Failed to load field details.');
        this.isLoading.set(false);
      }
    });
  }

  loadAvailability(fieldId: number): void {
    this.loadingSlots.set(true);

    this.availabilityApi.getFieldAvailability(fieldId).subscribe({
      next: (slots) => {
        // Sort by day of week and time
        const sorted = slots.sort((a, b) => {
          const dayOrder = this.daysOfWeek.indexOf(a.dayOfWeek) - this.daysOfWeek.indexOf(b.dayOfWeek);
          if (dayOrder !== 0) return dayOrder;
          return a.startTime.localeCompare(b.startTime);
        });
        this.availabilitySlots.set(sorted);
        this.loadingSlots.set(false);
      },
      error: (err) => {
        console.error('Error loading availability:', err);
        this.loadingSlots.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.availabilityForm.invalid || !this.fieldId()) {
      this.availabilityForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const availabilityData: CreateAvailabilityRequest = {
      dayOfWeek: this.availabilityForm.value.dayOfWeek,
      startTime: this.availabilityForm.value.startTime,
      endTime: this.availabilityForm.value.endTime,
      isAvailable: this.availabilityForm.value.isAvailable
    };

    this.availabilityApi.createAvailability(this.fieldId()!, availabilityData).subscribe({
      next: (slot) => {
        this.successMessage.set('Time slot added successfully!');
        this.availabilitySlots.update(slots => [...slots, slot]);
        this.availabilityForm.reset({ isAvailable: true });
        this.isSaving.set(false);

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Error creating availability:', err);
        this.errorMessage.set('Failed to add time slot. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  deleteSlot(slot: FieldAvailability): void {
    if (!slot.id || !this.fieldId()) return;

    this.deletingId.set(slot.id);

    this.availabilityApi.deleteAvailability(this.fieldId()!, slot.id).subscribe({
      next: () => {
        this.availabilitySlots.update(slots => slots.filter(s => s.id !== slot.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        console.error('Error deleting availability:', err);
        alert('Failed to delete time slot. Please try again.');
        this.deletingId.set(null);
      }
    });
  }

  getSlotsByDay(day: string): FieldAvailability[] {
    return this.availabilitySlots().filter(slot => slot.dayOfWeek === day);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.availabilityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
