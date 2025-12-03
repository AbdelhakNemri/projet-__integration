import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService, ServiceHealth, SystemStats } from '../../services/admin-api.service';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p class="text-gray-600">Monitor system health and manage the platform</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (stat of stats(); track stat.title) {
          <div
            [class]="'bg-white rounded-lg shadow p-6 hover:shadow-lg transition' + (stat.route ? ' cursor-pointer' : '')"
            [routerLink]="stat.route || null"
          >
            <div class="flex items-center justify-between mb-4">
              <div [class]="'p-3 rounded-lg ' + stat.color">
                <span class="text-2xl">{{ stat.icon }}</span>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</h3>
            <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              routerLink="/admin/users"
              class="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-gray-900">User Management</h4>
                  <p class="text-sm text-gray-600">Manage system users</p>
                </div>
                <span class="text-2xl">👥</span>
              </div>
            </a>
            <a
              routerLink="/admin/fields"
              class="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-gray-900">All Fields</h4>
                  <p class="text-sm text-gray-600">View all sports fields</p>
                </div>
                <span class="text-2xl">🏟️</span>
              </div>
            </a>
            <a
              routerLink="/admin/events"
              class="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-gray-900">All Events</h4>
                  <p class="text-sm text-gray-600">View all events</p>
                </div>
                <span class="text-2xl">⚽</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  servicesHealth = signal<ServiceHealth[]>([]);
  systemStats = signal<SystemStats | null>(null);
  loadingHealth = signal(false);
  lastHealthCheck = signal<string | null>(null);

  activeServicesCount = computed(() => {
    return this.servicesHealth().filter(s => s.status === 'UP').length;
  });

  downServicesCount = computed(() => {
    return this.servicesHealth().filter(s => s.status === 'DOWN').length;
  });

  stats = computed<StatCard[]>(() => {
    const stats = this.systemStats();

    return [
      {
        title: 'Total Users',
        value: stats?.totalUsers || 'N/A',
        icon: '👥',
        color: 'bg-blue-100',
        route: '/admin/users',
      },
      {
        title: 'Total Fields',
        value: stats?.totalFields || 'N/A',
        icon: '🏟️',
        color: 'bg-green-100',
      },
      {
        title: 'Total Events',
        value: stats?.totalEvents || 'N/A',
        icon: '⚽',
        color: 'bg-yellow-100',
      },
    ];
  });

  ngOnInit(): void {
    this.refreshHealth();
    this.loadSystemStats();
  }

  refreshHealth(): void {
    this.loadingHealth.set(true);
    this.adminApi.checkAllServicesHealth().subscribe({
      next: (health) => {
        this.servicesHealth.set(health);
        this.lastHealthCheck.set(new Date().toLocaleTimeString());
        this.loadingHealth.set(false);
      },
      error: (error) => {
        console.error('Error checking service health:', error);
        this.loadingHealth.set(false);
      },
    });
  }

  loadSystemStats(): void {
    this.adminApi.getSystemStats().subscribe({
      next: (stats) => {
        this.systemStats.set(stats);
      },
      error: (error) => {
        console.error('Error loading system stats:', error);
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
