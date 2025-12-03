import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redirecting to Registration
          </h2>
        </div>
        
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ errorMessage() }}
          </div>
        }
        
        <div class="mt-8">
          <div class="flex justify-center">
            <svg class="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-center text-gray-600 mt-4">
            Please wait while we redirect you to the registration page...
          </p>
          
          @if (errorMessage()) {
            <button
              (click)="redirectToRegister()"
              class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try Again
            </button>
          }
        </div>
        
        <p class="text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/login" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Automatically redirect to Keycloak registration on component load
    this.redirectToRegister();
  }

  redirectToRegister(): void {
    console.log('Attempting to redirect to Keycloak registration...');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Try to get URL from backend first
    this.authService.getRegisterUrl().subscribe({
      next: (response) => {
        console.log('Received registration URL response:', response);
        const url = (response as any).registrationUrl || response.url;
        console.log('Extracted URL:', url);

        if (url) {
          console.log('Redirecting to:', url);
          window.location.href = url;
        } else {
          console.error('No URL found in response, using fallback');
          this.useFallbackUrl();
        }
      },
      error: (error) => {
        console.error('Error getting register URL from backend:', error);
        console.error('Error status:', error.status);
        console.error('Using fallback URL instead');

        // Use fallback URL if backend fails
        this.useFallbackUrl();
      },
    });
  }

  private useFallbackUrl(): void {
    // Construct Keycloak registration URL directly
    const keycloakUrl = 'http://localhost:8080/realms/sports-arena/protocol/openid-connect/auth';
    const params = new URLSearchParams({
      client_id: 'web-frontend',
      response_type: 'code',
      redirect_uri: 'http://localhost:4200',
      scope: 'openid profile email',
      kc_action: 'register'
    });

    const fullUrl = `${keycloakUrl}?${params.toString()}`;
    console.log('Using fallback registration URL:', fullUrl);
    window.location.href = fullUrl;
  }
}


