import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerApiService } from '../../services/player-api.service';
import { User } from '../../../../core/models/user.model';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">My Profile</h2>
        <p class="mt-2 text-gray-600">Manage your personal information and preferences.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ errorMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div *ngIf="successMessage()" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded shadow-sm">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <div *ngIf="!isLoading() && user()" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div class="p-8">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            
            <!-- Header with Avatar -->
            <div class="flex items-center mb-8 pb-8 border-b border-gray-100">
              <div class="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-white shadow-md">
                {{ getInitials() }}
              </div>
              <div class="ml-6">
                <h3 class="text-xl font-semibold text-gray-900">{{ user()?.prenom }} {{ user()?.nom }}</h3>
                <p class="text-gray-500">{{ user()?.email }}</p>
                <div class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ user()?.poste || 'Player' }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" id="prenom" formControlName="prenom"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  [class.border-red-300]="isFieldInvalid('prenom')">
                <p *ngIf="isFieldInvalid('prenom')" class="mt-1 text-sm text-red-600">First name is required</p>
              </div>

              <!-- Last Name -->
              <div>
                <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" id="nom" formControlName="nom"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  [class.border-red-300]="isFieldInvalid('nom')">
                <p *ngIf="isFieldInvalid('nom')" class="mt-1 text-sm text-red-600">Last name is required</p>
              </div>

              <!-- Email (Read-only) -->
              <div class="md:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" [value]="user()?.email" disabled
                  class="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed">
                <p class="mt-1 text-xs text-gray-500">Email cannot be changed directly. Contact support for assistance.</p>
              </div>

              <!-- Position -->
              <div>
                <label for="poste" class="block text-sm font-medium text-gray-700 mb-1">Position / Role</label>
                <select id="poste" formControlName="poste"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                  <option value="">Select a position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                  <option value="Striker">Striker</option>
                  <option value="Coach">Coach</option>
                </select>
              </div>

              <!-- Phone -->
              <div>
                <label for="tel" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="tel" formControlName="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
              </div>

              <!-- Bio -->
              <div class="md:col-span-2">
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio / About Me</label>
                <textarea id="bio" formControlName="bio" rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Tell us a bit about yourself..."></textarea>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button type="button" (click)="resetForm()" 
                class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="profileForm.invalid || isSaving()"
                class="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
                <svg *ngIf="isSaving()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PlayerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playerApi = inject(PlayerApiService);
  private userContext = inject(UserContextService);

  // Signals
  user = signal<User | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      poste: [''],
      tel: ['', [Validators.pattern('^[0-9+\\-\\s()]*$')]],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    console.log('🔍 Loading player profile...');
    this.playerApi.getCurrentPlayer().subscribe({
      next: (user) => {
        console.log('✅ Profile loaded successfully:', user);
        this.user.set(user);
        this.updateForm(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading profile:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error object:', err.error);

        let errorMsg = 'Failed to load profile. ';
        if (err.status === 404) {
          errorMsg += 'Service not found. Please ensure player-service is running.';
        } else if (err.status === 401 || err.status === 403) {
          errorMsg += 'Authentication failed. Please login again.';
        } else if (err.status === 500) {
          errorMsg += 'Server error. Check player-service logs.';
        } else if (err.status === 0) {
          errorMsg += 'Cannot connect to server. Check if Gateway is running.';
        } else {
          errorMsg += 'Please try again later.';
        }

        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  updateForm(user: User): void {
    this.profileForm.patchValue({
      nom: user.nom || '',
      prenom: user.prenom || '',
      poste: user.poste || '',
      tel: user.tel || '',
      bio: user.bio || ''
    });
  }

  resetForm(): void {
    const user = this.user();
    if (user) {
      this.updateForm(user);
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser || !currentUser.id) {
      this.errorMessage.set('User ID not found.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValues = this.profileForm.value;

    this.playerApi.updatePlayer(currentUser.id, formValues).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.userContext.updateCurrentUser(updatedUser); // Update global context
        this.successMessage.set('Profile updated successfully!');
        this.isSaving.set(false);

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage.set('Failed to update profile. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return '';
    const first = u.prenom ? u.prenom.charAt(0).toUpperCase() : '';
    const last = u.nom ? u.nom.charAt(0).toUpperCase() : '';
    return first + last;
  }
}
