/**
 * Notification Model
 */
export interface Notification {
  id?: number;
  recipientKeycloakId: string;
  recipientEmail?: string;
  userId?: string; // Alias for recipientKeycloakId for backwards compatibility
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  read?: boolean; // Alias for isRead
  source?: string;
  metadata?: string;
  relatedEntityId?: number; // Event ID, Booking ID, etc.
  relatedEntityType?: string; // 'EVENT', 'BOOKING', etc.
  createdAt?: string;
  readAt?: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'EVENT' | 'BOOKING' | 'INTERNAL' | 'PLAYER_ACCEPTED' | 'FIELD_RESERVED';

/**
 * Create Notification Request
 */
export interface CreateNotificationRequest {
  recipientKeycloakId: string;
  recipientEmail?: string;
  title: string;
  message: string;
  type: NotificationType;
  source?: string;
  metadata?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

/**
 * Player Accepted Notification Request
 */
export interface PlayerAcceptedNotificationRequest {
  eventId: number;
  eventTitle: string;
  organizerKeycloakId: string;
  organizerEmail: string;
  playerKeycloakId: string;
  playerEmail: string;
  message: string;
}

/**
 * Field Reserved Notification Request
 */
export interface FieldReservedNotificationRequest {
  fieldId: number;
  fieldName: string;
  ownerKeycloakId: string;
  ownerEmail: string;
  playerKeycloakId: string;
  playerEmail: string;
  bookingDate: string;
  message: string;
}

