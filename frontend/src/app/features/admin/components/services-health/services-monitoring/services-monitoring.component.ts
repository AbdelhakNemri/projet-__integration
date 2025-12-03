import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService, ServiceHealth } from '../../../services/admin-api.service';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-services-monitoring',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div>
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Service Health Monitoring</h2>
        <p class="text-gray-600">Monitor the status of all backend services</p>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">All Services</h3>
          <button
            (click)="refreshHealth()"
            [disabled]="loading()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 text-sm"
          >
            {{ loading() ? 'Checking...' : 'Refresh All' }}
          </button>
        </div>
        <div class="p-6">
          @if (loading()) {
            <app-loading-spinner message="Checking service health..."></app-loading-spinner>
          } @else {
            <div class="space-y-4">
              @for (service of services(); track service.service) {
                <div class="border rounded-lg p-6">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                      <div
                        [class]="'w-4 h-4 rounded-full ' + (service.status === 'UP' ? 'bg-green-500' : 'bg-red-500')"
                      ></div>
                      <div>
                        <h4 class="font-semibold text-gray-900 text-lg">
                          {{ formatServiceName(service.service) }}
                        </h4>
                        <p class="text-sm text-gray-500">{{ service.service }}</p>
                      </div>
                    </div>
                    <span
                      [class]="'px-4 py-2 rounded-lg font-medium ' + (service.status === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')"
                    >
                      {{ service.status }}
                    </span>
                  </div>
                  @if (service.message) {
                    <p class="text-gray-600 text-sm">{{ service.message }}</p>
                  }
                  @if (service.timestamp) {
                    <p class="text-xs text-gray-400 mt-2">Last checked: {{ service.timestamp }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ServicesMonitoringComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  services = signal<ServiceHealth[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.refreshHealth();
  }

  refreshHealth(): void {
    this.loading.set(true);
    this.adminApi.checkAllServicesHealth().subscribe({
      next: (health) => {
        this.services.set(health.map(s => ({
          ...s,
          timestamp: new Date().toLocaleString(),
        })));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error checking service health:', error);
        this.loading.set(false);
      },
    });
  }

  formatServiceName(service: string): string {
    return service
      .replace('-service', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

