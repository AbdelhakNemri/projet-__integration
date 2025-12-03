import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { UserRole, USER_ROLES } from './core/constants/user-roles';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },

  // Player routes (lazy-loaded)
  {
    path: 'player',
    loadChildren: () => import('./features/player/player.routes').then(m => m.PLAYER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.PLAYER] },
  },

  // Owner routes (lazy-loaded)
  {
    path: 'owner',
    loadChildren: () => import('./features/owner/owner.routes').then(m => m.OWNER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.OWNER] },
  },

  // Admin routes (lazy-loaded)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.ADMIN] },
  },

  // Notifications route (accessible to all authenticated users)
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/components/notification-list/notification-list.component').then(m => m.NotificationListComponent),
    canActivate: [authGuard],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
