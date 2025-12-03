import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'services',
        loadComponent: () => import('./components/services-health/services-monitoring/services-monitoring.component').then(m => m.ServicesMonitoringComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/user-management/user-management.component').then(m => m.UserManagementComponent),
      },
      {
        path: 'fields',
        loadComponent: () => import('./components/fields/all-fields/all-fields.component').then(m => m.AllFieldsComponent),
      },
      {
        path: 'events',
        loadComponent: () => import('./components/events/all-events/all-events.component').then(m => m.AllEventsComponent),
      },
      {
        path: 'services',
        loadComponent: () => import('./components/services-health/services-monitoring/services-monitoring.component').then(m => m.ServicesMonitoringComponent),
      },
      {
        path: 'stats',
        loadComponent: () => import('./components/system-stats/system-stats.component').then(m => m.SystemStatsComponent),
      },
    ],
  },
];

