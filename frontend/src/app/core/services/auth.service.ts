import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { UserContextService } from './user-context.service';
import { LoginRequest, LoginResponse, AuthUserInfo } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { USER_ROLES, UserRole } from '../constants/user-roles';

/**
 * Authentication Service
 * Handles login, logout, and authentication state
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);
  private tokenStorage = inject(TokenStorageService);
  private userContext = inject(UserContextService);

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((response) => {
        // Store token
        this.tokenStorage.saveToken(response.access_token);

        // Decode token and set user context
        const payload = this.tokenStorage.decodeToken(response.access_token);
        console.log('🔍 JWT Payload:', payload);
        
        if (payload) {
          // Extract roles from Keycloak structure (realm_access or resource_access)
          let userRoles: UserRole[] = [];

          if (payload['realm_access'] && payload['realm_access'].roles) {
            const allRoles = payload['realm_access'].roles;
            console.log('📋 Found roles in realm_access:', allRoles);
            // Filter only valid app roles
            userRoles = allRoles.filter((role: string) => 
              Object.values(USER_ROLES).includes(role as UserRole)
            ) as UserRole[];
          } else if (payload['resource_access'] && payload['resource_access']['web-frontend'] && payload['resource_access']['web-frontend'].roles) {
            const allRoles = payload['resource_access']['web-frontend'].roles;
            console.log('📋 Found roles in resource_access.web-frontend:', allRoles);
            userRoles = allRoles.filter((role: string) => 
              Object.values(USER_ROLES).includes(role as UserRole)
            ) as UserRole[];
          } else if (payload.roles) {
            const allRoles = payload.roles;
            console.log('📋 Found roles in roles:', allRoles);
            userRoles = (Array.isArray(allRoles) ? allRoles : [allRoles]).filter((role: string) => 
              Object.values(USER_ROLES).includes(role as UserRole)
            ) as UserRole[];
          }

          console.log('✅ Extracted valid roles:', userRoles);

          const authInfo: AuthUserInfo = {
            keycloakId: payload.sub,
            email: payload.email,
            roles: userRoles,
          };
          this.userContext.setAuthUserInfo(authInfo);
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.userContext.clear();
    this.router.navigate(['/login']);
  }

  /**
   * Get current authenticated user info
   */
  getCurrentUserInfo(): Observable<AuthUserInfo> {
    return this.api.get<AuthUserInfo>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Get Keycloak registration URL
   */
  getRegisterUrl(): Observable<{ url: string }> {
    return this.api.get<{ url: string }>(API_ENDPOINTS.AUTH.REGISTER_URL);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) return false;
    return !this.tokenStorage.isTokenExpired(token);
  }

  /**
   * Redirect user to appropriate dashboard based on role
   */
  redirectToDashboard(): void {
    const role = this.userContext.userRole();
    const authInfo = this.userContext.authUserInfo();

    console.log('🚀 Redirecting to dashboard. Role:', role);
    console.log('👤 Auth info:', authInfo);

    if (!role || !authInfo || authInfo.roles.length === 0) {
      console.error('❌ No valid role found! Cannot redirect to dashboard.');
      console.error('User roles:', authInfo?.roles);
      // Stay on current page instead of redirecting
      throw new Error('No valid user role assigned. Please contact administrator.');
    }

    switch (role) {
      case USER_ROLES.PLAYER:
        this.router.navigate(['/player/dashboard']);
        break;
      case USER_ROLES.OWNER:
        this.router.navigate(['/owner/dashboard']);
        break;
      case USER_ROLES.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        console.error('❌ Unknown role:', role);
        throw new Error(`Unknown user role: ${role}. Please contact administrator.`);
    }
  }
}
