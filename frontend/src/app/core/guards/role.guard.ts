import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserContextService } from '../services/user-context.service';
import { UserRole } from '../constants/user-roles';

/**
 * Role Guard
 * Protects routes that require specific roles
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const userContext = inject(UserContextService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as UserRole[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement
  }

  if (!userContext.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => userContext.hasRole(role));
  
  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard or home
    router.navigate(['/']);
    return false;
  }

  return true;
};

