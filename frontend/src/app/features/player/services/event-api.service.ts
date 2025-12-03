import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Event, CreateEventRequest, EventRating, EventInvitation } from '../../../core/models/event.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

/**
 * Event API Service
 * Handles all event-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class EventApiService extends ApiService {
  /**
   * Get all available public events
   */
  getAvailableEvents(): Observable<Event[]> {
    return this.get<any[]>(API_ENDPOINTS.EVENT.AVAILABLE).pipe(
      map(events => events.map(e => this.mapToEvent(e)))
    );
  }

  /**
   * Search events
   */
  searchEvents(query: string): Observable<Event[]> {
    const params = new HttpParams().set('query', query);
    return this.get<any[]>(API_ENDPOINTS.EVENT.SEARCH, params).pipe(
      map(events => events.map(e => this.mapToEvent(e)))
    );
  }

  /**
   * Get event by ID
   */
  getEventById(id: number): Observable<Event> {
    return this.get<any>(API_ENDPOINTS.EVENT.BY_ID(id)).pipe(
      map(e => this.mapToEvent(e))
    );
  }

  /**
   * Get events organized by current user
   */
  getMyEvents(): Observable<Event[]> {
    return this.get<any[]>(API_ENDPOINTS.EVENT.MY_EVENTS).pipe(
      map(events => events.map(e => this.mapToEvent(e)))
    );
  }

  /**
   * Get events where current user participates
   */
  getMyParticipations(): Observable<Event[]> {
    return this.get<any[]>(API_ENDPOINTS.EVENT.MY_PARTICIPATIONS).pipe(
      map(events => events.map(e => this.mapToEvent(e)))
    );
  }

  /**
   * Create event
   */
  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.post<any>(API_ENDPOINTS.EVENT.CREATE, event).pipe(
      map(e => this.mapToEvent(e))
    );
  }

  /**
   * Map backend DTO to frontend Event model
   */
  private mapToEvent(dto: any): Event {
    const dateObj = new Date(dto.eventDate);
    const date = dto.eventDate.split('T')[0];
    const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return {
      ...dto,
      date,
      time
    };
  }

  /**
   * Join public event
   */
  joinEvent(eventId: number): Observable<void> {
    return this.post<void>(API_ENDPOINTS.EVENT.JOIN(eventId), {});
  }

  /**
   * Invite player to event
   */
  invitePlayer(eventId: number, playerEmail: string): Observable<void> {
    return this.post<void>(API_ENDPOINTS.EVENT.INVITE(eventId), { playerEmail });
  }

  /**
   * Respond to event invitation
   */
  respondToInvitation(eventId: number, response: 'ACCEPT' | 'REFUSE'): Observable<void> {
    const params = new HttpParams().set('response', response);
    return this.post<void>(API_ENDPOINTS.EVENT.RESPOND(eventId), {}, { params });
  }

  /**
   * Remove participant from event
   */
  removeParticipant(eventId: number, participantId: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.EVENT.REMOVE_PARTICIPANT(eventId, participantId));
  }

  /**
   * Rate event
   */
  rateEvent(eventId: number, rating: number, comment?: string): Observable<EventRating> {
    return this.post<EventRating>(API_ENDPOINTS.EVENT.RATE(eventId), { rating, comment });
  }

  /**
   * Get event ratings
   */
  getEventRatings(eventId: number): Observable<EventRating[]> {
    return this.get<EventRating[]>(API_ENDPOINTS.EVENT.RATINGS(eventId));
  }
}

