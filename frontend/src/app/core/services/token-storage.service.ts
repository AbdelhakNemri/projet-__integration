import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../constants/app-config';

/**
 * Token Storage Service
 * Handles JWT token storage and retrieval
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly storage: Storage;
  private readonly tokenKey = APP_CONFIG.STORAGE_KEYS.TOKEN;

  constructor() {
    this.storage = APP_CONFIG.TOKEN.STORAGE_TYPE === 'localStorage'
      ? localStorage
      : sessionStorage;
  }

  /**
   * Save token to storage
   */
  saveToken(token: string): void {
    this.storage.setItem(this.tokenKey, token);
  }

  /**
   * Get token from storage
   */
  getToken(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  /**
   * Remove token from storage
   */
  removeToken(): void {
    this.storage.removeItem(this.tokenKey);
  }

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Decode JWT token (basic decoding, no verification)
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      console.error('Token causing error:', token);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      console.warn('Token expired check failed: Invalid token or missing exp claim', decoded);
      return true;
    }
    const expirationDate = decoded.exp * 1000; // Convert to milliseconds
    const isExpired = Date.now() >= expirationDate;
    if (isExpired) {
      console.warn('Token is expired. Exp:', new Date(expirationDate), 'Now:', new Date());
    }
    return isExpired;
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  }
}

