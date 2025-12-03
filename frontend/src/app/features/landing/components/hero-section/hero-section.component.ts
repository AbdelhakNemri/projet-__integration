import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V4h4V2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
      </div>

      <div class="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to Sports Arena
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
            Connect, Play, and Manage. Your ultimate platform for sports field bookings, 
            event organization, and player networking.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            @if (!isAuthenticated()) {
              <a
                routerLink="/register"
                class="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </a>
              <a
                routerLink="/login"
                class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition"
              >
                Sign In
              </a>
            } @else {
              <a
                [routerLink]="dashboardLink()"
                class="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Wave Separator -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {
  private userContext = inject(UserContextService);

  isAuthenticated = this.userContext.isAuthenticated;
  userRole = this.userContext.userRole;

  dashboardLink = computed(() => {
    const role = this.userRole();
    if (role === 'PLAYER') return '/player/dashboard';
    if (role === 'OWNER') return '/owner/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  });
}

