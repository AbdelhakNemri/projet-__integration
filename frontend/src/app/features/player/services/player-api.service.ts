import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Player API Service
 * Handles all player-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerApiService extends ApiService {
  /**
   * Get current player profile
   */
  getCurrentPlayer(): Observable<User> {
    return this.get<User>(API_ENDPOINTS.PLAYER.ME);
  }

  /**
   * Get player by ID
   */
  getPlayerById(id: number): Observable<User> {
    return this.get<User>(API_ENDPOINTS.PLAYER.BY_ID(id));
  }

  /**
   * Get player by email
   */
  getPlayerByEmail(email: string): Observable<User> {
    return this.get<User>(API_ENDPOINTS.PLAYER.BY_EMAIL(email));
  }

  /**
   * Get all players
   */
  getAllPlayers(): Observable<User[]> {
    return this.get<User[]>(API_ENDPOINTS.PLAYER.ALL);
  }

  /**
   * Update player profile
   */
  updatePlayer(id: number, updates: Partial<User>): Observable<User> {
    return this.put<User>(API_ENDPOINTS.PLAYER.UPDATE(id), updates);
  }
}

