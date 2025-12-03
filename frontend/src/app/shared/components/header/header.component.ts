import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserContextService } from '../../../core/services/user-context.service';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="text-2xl font-bold text-primary-600">
              Sports Arena
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-6">
            <a routerLink="/" routerLinkActive="text-primary-600" 
               class="text-gray-700 hover:text-primary-600 transition">
              Home
            </a>
            <a href="#features" class="text-gray-700 hover:text-primary-600 transition">
              Features
            </a>
            <a href="#about" class="text-gray-700 hover:text-primary-600 transition">
              About
            </a>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            @if (isAuthenticated()) {
              <span class="text-gray-700 text-sm">
                {{ currentUser()?.email || 'User' }}
              </span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >
                Logout
              </button>
              <a
                [routerLink]="dashboardLink()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Dashboard
              </a>
            } @else {
              <a
                routerLink="/login"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >
                Login
              </a>
              <a
                routerLink="/register"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </a>
            }
          </div>
        </div>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  private userContext = inject(UserContextService);
  private authService = inject(AuthService);

  isAuthenticated = this.userContext.isAuthenticated;
  currentUser = this.userContext.currentUser;
  userRole = this.userContext.userRole;

  dashboardLink = computed(() => {
    const role = this.userRole();
    if (role === 'PLAYER') return '/player/dashboard';
    if (role === 'OWNER') return '/owner/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  });

  logout(): void {
    this.authService.logout();
  }
}

