import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';

export const PLAYER_ROUTES: Routes = [
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
        loadComponent: () => import('./components/dashboard/player-dashboard.component').then(m => m.PlayerDashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/player-profile.component').then(m => m.PlayerProfileComponent),
      },
      {
        path: 'events',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./components/events/event-list/event-list.component').then(m => m.EventListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./components/events/create-event/create-event.component').then(m => m.CreateEventComponent),
          },
          {
            path: 'my-participations',
            loadComponent: () => import('./components/events/my-participations/my-participations.component').then(m => m.MyParticipationsComponent),
          },
          {
            path: 'invitations',
            loadComponent: () => import('./components/events/event-invitations/event-invitations.component').then(m => m.EventInvitationsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./components/events/event-detail/event-detail.component').then(m => m.EventDetailComponent),
          },
        ],
      },
      {
        path: 'fields',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./components/fields/field-list/field-list.component').then(m => m.FieldListComponent),
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
            path: 'my-bookings',
            loadComponent: () => import('./components/bookings/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./components/bookings/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
          },
        ],
      },

    ],
  },
];

