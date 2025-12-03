import { UserRole } from '../constants/user-roles';

/**
 * User/Player Model
 */
export interface User {
  id?: number;
  keycloakId: string;
  email: string;
  nom?: string;
  prenom?: string;
  poste?: string;
  photo?: string | ArrayBuffer;
  tel?: string;
  bio?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * JWT Token Payload
 */
export interface JwtPayload {
  sub: string; // Keycloak user ID
  email: string;
  roles: string[];
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Login Request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
}

/**
 * Auth User Info
 */
export interface AuthUserInfo {
  keycloakId: string;
  email: string;
  roles: UserRole[];
}

