import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerApiService } from '../../../../player/services/player-api.service';
import { User } from '../../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

// Extended User interface with role for display
interface UserWithRole extends User {
  role?: string;
  displayName?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">User Management</h2>
          <p class="text-gray-600 mt-1">Manage all users in the system</p>
        </div>
        <button 
          (click)="refreshUsers()"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Information Banner -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              <strong>Note:</strong> This page currently shows only users who have created player profiles. 
              Owners and admins who exist only in Keycloak are not displayed. 
              To see all users including owners and admins, a backend endpoint using Keycloak Admin API is required.
              <a href="/USER_MANAGEMENT_KEYCLOAK_ISSUE.md" target="_blank" class="underline ml-1">Learn more</a>
            </p>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search by name, email, or phone..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>

          <!-- Role Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select 
              [(ngModel)]="roleFilter"
              (change)="onFilterChange()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="ALL">All Roles</option>
              <option value="PLAYER">Players</option>
              <option value="OWNER">Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading users..."></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Users Table -->
      @else if (filteredUsers().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Stats -->
          <div class="p-6 border-b bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-indigo-600">{{ allUsers().length }}</p>
                <p class="text-sm text-gray-600">Total Users</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ getUserCountByRole('PLAYER') }}</p>
                <p class="text-sm text-gray-600">Players</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">{{ getUserCountByRole('OWNER') }}</p>
                <p class="text-sm text-gray-600">Owners</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-purple-600">{{ getUserCountByRole('ADMIN') }}</p>
                <p class="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <!-- User Info -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {{ getUserInitial(user) }}
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.displayName || user.email }}
                          </div>
                          <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Contact -->
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">{{ user.email }}</div>
                      <div class="text-sm text-gray-500">{{ user.tel || 'N/A' }}</div>
                    </td>

                    <!-- Role -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>

                    <!-- Joined Date -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.createdAt) }}
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        (click)="viewUserDetails(user)"
                        class="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Info -->
          <div class="px-6 py-4 border-t bg-gray-50">
            <p class="text-sm text-gray-600">
              Showing {{ filteredUsers().length }} of {{ allUsers().length }} users
            </p>
          </div>
        </div>
      }

      <!-- Empty State -->
      @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      }

      <!-- User Details Modal -->
      @if (selectedUser()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" (click)="closeUserDetails()">
          <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="p-6 border-b">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-gray-900">User Details</h3>
                <button (click)="closeUserDetails()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <!-- User Avatar -->
              <div class="flex items-center space-x-4">
                <div class="h-20 w-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                  {{ getUserInitial(selectedUser()!) }}
                </div>
                <div>
                  <h4 class="text-xl font-bold text-gray-900">
                    {{ selectedUser()!.displayName || selectedUser()!.email }}
                  </h4>
                  <span [class]="getRoleBadgeClass(selectedUser()!.role)">
                    {{ selectedUser()!.role }}
                  </span>
                </div>
              </div>

              <!-- User Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedUser()!.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedUser()!.tel || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Position</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedUser()!.poste || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">User ID</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedUser()!.id }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Keycloak ID</label>
                  <p class="mt-1 text-sm text-gray-900 truncate">{{ selectedUser()!.keycloakId || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Joined Date</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedUser()!.createdAt) }}</p>
                </div>
              </div>

              @if (selectedUser()!.bio) {
                <div>
                  <label class="block text-sm font-medium text-gray-500">Bio</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedUser()!.bio }}</p>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t bg-gray-50">
              <button 
                (click)="closeUserDetails()"
                class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  private playerApi = inject(PlayerApiService);

  // Signals
  allUsers = signal<UserWithRole[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedUser = signal<UserWithRole | null>(null);

  // Filters
  searchQuery = '';
  roleFilter = 'ALL';

  // Computed
  filteredUsers = computed(() => {
    let users = this.allUsers();

    // Filter by role
    if (this.roleFilter !== 'ALL') {
      users = users.filter(u => u.role === this.roleFilter);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      users = users.filter(u =>
        u.email?.toLowerCase().includes(query) ||
        u.nom?.toLowerCase().includes(query) ||
        u.prenom?.toLowerCase().includes(query) ||
        u.tel?.toLowerCase().includes(query) ||
        u.displayName?.toLowerCase().includes(query)
      );
    }

    return users;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.playerApi.getAllPlayers().subscribe({
      next: (users: User[]) => {
        // Transform users to include role and display name
        const usersWithRole: UserWithRole[] = users.map(user => ({
          ...user,
          role: this.guessUserRole(user),
          displayName: this.getDisplayName(user)
        }));
        this.allUsers.set(usersWithRole);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.errorMessage.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  onSearchChange(): void {
    // Trigger recomputation
    this.allUsers.set([...this.allUsers()]);
  }

  onFilterChange(): void {
    // Trigger recomputation
    this.allUsers.set([...this.allUsers()]);
  }

  getUserCountByRole(role: string): number {
    return this.allUsers().filter(u => u.role === role).length;
  }

  getUserInitial(user: UserWithRole): string {
    if (user.prenom) {
      return user.prenom.charAt(0).toUpperCase();
    }
    if (user.nom) {
      return user.nom.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getDisplayName(user: User): string {
    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    if (user.prenom) return user.prenom;
    if (user.nom) return user.nom;
    return user.email.split('@')[0];
  }

  guessUserRole(user: User): string {
    // Since the User model doesn't include role information from Keycloak,
    // we need to infer it from available data or email patterns

    // Check email patterns (this is a workaround - ideally roles come from Keycloak)
    const email = user.email.toLowerCase();

    if (email.includes('admin') || email.includes('administrateur')) {
      return 'ADMIN';
    }

    if (email.includes('owner') || email.includes('proprietaire') || email.includes('proprio')) {
      return 'OWNER';
    }

    // Check if user has poste field indicating they might be an owner
    if (user.poste && (user.poste.toLowerCase().includes('owner') || user.poste.toLowerCase().includes('proprietaire'))) {
      return 'OWNER';
    }

    // Default to PLAYER
    // Note: In production, roles should be fetched from Keycloak or a dedicated endpoint
    // that returns user roles along with user data
    return 'PLAYER';
  }

  getRoleBadgeClass(role: string | undefined): string {
    const classes: Record<string, string> = {
      PLAYER: 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
      OWNER: 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800',
      ADMIN: 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800',
    };
    return classes[role || 'PLAYER'] || classes['PLAYER'];
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewUserDetails(user: UserWithRole): void {
    this.selectedUser.set(user);
  }

  closeUserDetails(): void {
    this.selectedUser.set(null);
  }
}

