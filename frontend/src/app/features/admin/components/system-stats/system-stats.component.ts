import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService, SystemStats } from '../../services/admin-api.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-system-stats',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">System Statistics</h2>
      
      @if (loading()) {
        <app-loading-spinner message="Loading statistics..."></app-loading-spinner>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalUsers || 'N/A' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Fields</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalFields || 'N/A' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Events</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalEvents || 'N/A' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Bookings</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalBookings || 'N/A' }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class SystemStatsComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  stats = signal<SystemStats | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.adminApi.getSystemStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading system stats:', error);
        this.loading.set(false);
      },
    });
  }
}

