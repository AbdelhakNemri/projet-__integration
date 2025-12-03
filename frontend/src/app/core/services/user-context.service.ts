import { Injectable, signal, computed } from '@angular/core';
import { User, JwtPayload, AuthUserInfo } from '../models/user.model';
import { UserRole, USER_ROLES } from '../constants/user-roles';
import { TokenStorageService } from './token-storage.service';

/**
 * User Context Service
 * Manages current user state using signals
 */
@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  // Signals for reactive state management
  private _currentUser = signal<User | null>(null);
  private _authUserInfo = signal<AuthUserInfo | null>(null);
  private _userRole = signal<UserRole | null>(null);

  // Computed signals
  currentUser = this._currentUser.asReadonly();
  authUserInfo = this._authUserInfo.asReadonly();
  userRole = this._userRole.asReadonly();
  isAuthenticated = computed(() => this._authUserInfo() !== null);
  isPlayer = computed(() => this._userRole() === USER_ROLES.PLAYER);
  isOwner = computed(() => this._userRole() === USER_ROLES.OWNER);
  isAdmin = computed(() => this._userRole() === USER_ROLES.ADMIN);

  constructor(private tokenStorage: TokenStorageService) {
    // Initialize from token if available
    this.initializeFromToken();
  }

  /**
   * Initialize user context from stored token
   */
  private initializeFromToken(): void {
    const token = this.tokenStorage.getToken();
    if (token && !this.tokenStorage.isTokenExpired(token)) {
      const payload = this.tokenStorage.decodeToken(token) as JwtPayload;
      if (payload) {
        // Extract roles from Keycloak structure
        let userRoles: UserRole[] = [];
        if (payload['realm_access'] && payload['realm_access'].roles) {
          userRoles = payload['realm_access'].roles as UserRole[];
        } else if (payload['resource_access'] && payload['resource_access']['web-frontend'] && payload['resource_access']['web-frontend'].roles) {
          userRoles = payload['resource_access']['web-frontend'].roles as UserRole[];
        } else if (payload.roles) {
          userRoles = payload.roles as unknown as UserRole[];
        }

        this.setAuthUserInfo({
          keycloakId: payload.sub,
          email: payload.email,
          roles: userRoles,
        });
      }
    }
  }

  /**
   * Set authentication user info from JWT payload
   */
  setAuthUserInfo(authInfo: AuthUserInfo): void {
    console.log('🔧 Setting auth user info:', authInfo);
    this._authUserInfo.set(authInfo);

    // Determine primary role (first role in array, or null if no roles)
    const primaryRole = authInfo.roles.length > 0 ? authInfo.roles[0] : null;
    console.log('🎭 Setting primary role:', primaryRole);
    console.log('📌 All roles:', authInfo.roles);
    this._userRole.set(primaryRole as UserRole);
  }

  /**
   * Set current user (player profile)
   */
  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  /**
   * Update current user
   */
  updateCurrentUser(updates: Partial<User>): void {
    const current = this._currentUser();
    if (current) {
      this._currentUser.set({ ...current, ...updates });
    }
  }

  /**
   * Clear user context (logout)
   */
  clear(): void {
    this._currentUser.set(null);
    this._authUserInfo.set(null);
    this._userRole.set(null);
    this.tokenStorage.removeToken();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const authInfo = this._authUserInfo();
    if (!authInfo) return false;
    return authInfo.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}

