import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';

export const OWNER_ROUTES: Routes = [
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
        loadComponent: () => import('./components/dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
      },
      {
        path: 'fields',
        children: [
          {
            path: 'my-fields',
            loadComponent: () => import('./components/fields/my-fields/my-fields.component').then(m => m.MyFieldsComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./components/fields/field-form/field-form.component').then(m => m.FieldFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/fields/field-form/field-form.component').then(m => m.FieldFormComponent),
          },
          {
            path: ':id/availability',
            loadComponent: () => import('./components/fields/availability-management/availability-management.component').then(m => m.AvailabilityManagementComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./components/fields/field-detail/field-detail.component').then(m => m.FieldDetailComponent),
          },
        ],
      },
      {
        path: 'bookings',
        children: [
          {
            path: 'all',
            loadComponent: () => import('./components/bookings/bookings-list/bookings-list.component').then(m => m.BookingsListComponent),
          },
          {
            path: 'recent',
            loadComponent: () => import('./components/bookings/bookings-list/bookings-list.component').then(m => m.BookingsListComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./components/bookings/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'reviews',
        loadComponent: () => import('./components/reviews/field-reviews/field-reviews.component').then(m => m.FieldReviewsComponent),
      },
    ],
  },
];

