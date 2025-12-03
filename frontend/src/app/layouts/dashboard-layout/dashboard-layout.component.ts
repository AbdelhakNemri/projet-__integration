import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserContextService } from '../../core/services/user-context.service';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside
        class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen"
      >
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="p-6 border-b">
            <a routerLink="/" class="text-2xl font-bold text-primary-600">
              Sports Arena
            </a>
          </div>

          <!-- User Info -->
          <div class="p-4 border-b">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ userInitial() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ currentUser()?.email || 'User' }}
                </p>
                <p class="text-xs text-gray-500 capitalize">
                  {{ userRole()?.toLowerCase() }}
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto p-4">
            <ul class="space-y-2">
              @for (item of navItems(); track item.route) {
                <li>
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-primary-50 text-primary-600 border-l-4 border-primary-600"
                    [routerLinkActiveOptions]="{ exact: false }"
                    class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <span class="text-xl">{{ item.icon }}</span>
                    <span class="font-medium">{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </nav>

          <!-- Logout -->
          <div class="p-4 border-t">
            <button
              (click)="logout()"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <span class="text-xl">🚪</span>
              <span class="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      @if (sidebarOpen) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          (click)="toggleSidebar()"
        ></div>
      }

      <!-- Main Content -->
      <div class="md:ml-64">
        <!-- Top Bar -->
        <header class="bg-white shadow-sm sticky top-0 z-20">
          <div class="flex items-center justify-between px-6 py-4">
            <button
              (click)="toggleSidebar()"
              class="md:hidden text-gray-600 hover:text-gray-900"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle() }}</h1>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private userContext = inject(UserContextService);
  private authService = inject(AuthService);

  sidebarOpen = true;
  currentUser = this.userContext.currentUser;
  userRole = this.userContext.userRole;

  userInitial = computed(() => {
    const user = this.currentUser();
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  });

  pageTitle = signal('Dashboard'); // Will be updated by child components

  navItems = computed<NavItem[]>(() => {
    const role = this.userRole();
    const basePath = role?.toLowerCase() || 'player';

    if (role === 'PLAYER') {
      return [
        { label: 'Dashboard', route: `/${basePath}/dashboard`, icon: '📊' },
        { label: 'Profile', route: `/${basePath}/profile`, icon: '👤' },
        { label: 'Events', route: `/${basePath}/events/list`, icon: '⚽' },
        { label: 'Fields', route: `/${basePath}/fields/list`, icon: '🏟️' },
        { label: 'Bookings', route: `/${basePath}/bookings/my-bookings`, icon: '📅' },
      ];
    }

    if (role === 'OWNER') {
      return [
        { label: 'Dashboard', route: `/${basePath}/dashboard`, icon: '📊' },
        { label: 'My Fields', route: `/${basePath}/fields/my-fields`, icon: '🏟️' },
        { label: 'Bookings', route: `/${basePath}/bookings/all`, icon: '📅' },
        { label: 'Reviews', route: `/${basePath}/reviews`, icon: '⭐' },
      ];
    }

    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', route: `/${basePath}/dashboard`, icon: '📊' },
        { label: 'Users', route: `/${basePath}/users`, icon: '👥' },
        { label: 'Fields', route: `/${basePath}/fields`, icon: '🏟️' },
        { label: 'Events', route: `/${basePath}/events`, icon: '⚽' },
      ];
    }

    return [];
  });

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}

