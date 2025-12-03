import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p class="text-xl mb-8 text-gray-100">
            Join thousands of players and field owners already using Sports Arena.
          </p>
          @if (!isAuthenticated()) {
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                routerLink="/register"
                class="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Create Free Account
              </a>
              <a
                routerLink="/login"
                class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition"
              >
                Sign In
              </a>
            </div>
          } @else {
            <a
              [routerLink]="dashboardLink()"
              class="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class CtaSectionComponent {
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

