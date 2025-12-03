/**
 * Event Model
 */
export interface Event {
  id?: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isPublic: boolean;
  organizerId?: number;
  organizerEmail?: string;
  bookingId?: number; // Link to confirmed booking
  status?: EventStatus;
  createdAt?: string;
  updatedAt?: string;
  participants?: any[]; // List of participants
}

export type EventStatus = 'PLANNED' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

/**
 * Event Invitation
 */
export interface EventInvitation {
  id?: number;
  eventId: number;
  playerId: number;
  playerEmail: string;
  status: InvitationStatus;
  createdAt?: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED';

/**
 * Event Rating
 */
export interface EventRating {
  id?: number;
  eventId: number;
  playerId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt?: string;
}

/**
 * Create Event Request
 */
export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string; // ISO datetime string
  duration?: number; // in minutes
  maxParticipants?: number;
  minParticipants?: number;
  sportType?: string;
  fieldId?: number;
  location?: string;
  isPublic: boolean;
  invitedPlayerEmails?: string[];
}

