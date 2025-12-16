# API Endpoints Overview

This file lists all REST endpoints exposed by the backend services under `backend - Copie`.

---

## Auth Service (`auth-service`)

Base path: `/auth`

- `GET  /auth/health` – Auth service health check
- `POST /auth/login` – Login, returns JWT token
- `GET  /auth/register-url` – Get Keycloak registration URL
- `GET  /auth/me` – Get authenticated user info

---

## Event Service (`event-service`)

Base path: `/events`

- `GET    /events/health` – Event service health check
- `POST   /events` – Create event (US6)
- `GET    /events/{id}` – Get event by ID
- `GET    /events/available` – List available public events (US11)
- `GET    /events/search?query=...` – Search events (US11)
- `GET    /events/my-events` – Get events organized by current user
- `GET    /events/my-participations` – Get events where current user participates
- `POST   /events/{eventId}/invite` – Invite players to event (US7)
- `POST   /events/{eventId}/respond?response=ACCEPT|REFUSE` – Respond to invitation (US8)
- `DELETE /events/{eventId}/participants/{participantId}` – Remove player from event (US9)
- `POST   /events/{eventId}/join` – Join public event (US11)
- `POST   /events/{eventId}/ratings` – Rate event (US12)
- `GET    /events/{eventId}/ratings` – Get ratings for an event

---

## Field Service (`field-service`)

### FieldController (base: `/fields`)

- `GET    /fields/health` – Field service health check
- `POST   /fields` – Create field (US13, OWNER only)
- `GET    /fields/{id}` – Get field by ID
- `GET    /fields` – List all available fields (US17)
- `GET    /fields/my-fields` – Get current owner’s fields
- `GET    /fields/search/city/{city}` – Search fields by city (US17)
- `GET    /fields/search/type/{type}` – Search fields by type (US17)
- `GET    /fields/search?query=...` – General field search (US17)
- `PUT    /fields/{id}` – Update field (US14, OWNER only)
- `DELETE /fields/{id}` – Delete field (OWNER only)

### AvailabilityController (base: `/fields/{fieldId}/availability`)

- `POST   /fields/{fieldId}/availability` – Add availability slot (US15, OWNER only)
- `GET    /fields/{fieldId}/availability` – Get all availability slots for field (US17)
- `GET    /fields/{fieldId}/availability/day/{dayOfWeek}` – Get availability by day (US17)
- `PUT    /fields/{fieldId}/availability/{availabilityId}` – Update availability slot (US15, OWNER only)
- `DELETE /fields/{fieldId}/availability/{availabilityId}` – Delete availability slot (US15, OWNER only)

### FieldReviewController (base: `/fields/{fieldId}/reviews`)

- `POST   /fields/{fieldId}/reviews` – Add review for field (US16)
- `GET    /fields/{fieldId}/reviews` – Get reviews for field
- `GET    /fields/{fieldId}/reviews/rating` – Get average rating for field (US20)
- `DELETE /fields/{fieldId}/reviews/{reviewId}` – Delete review (US16)

### BookingController (base: `/bookings`)

- `POST   /bookings` – Create a new field booking
- `GET    /bookings/{id}` – Get booking by ID
- `GET    /bookings/field/{fieldId}` – Get all bookings for a specific field
- `GET    /bookings/my-bookings` – Get all bookings made by current player
- `GET    /bookings/owner/all` – Get all bookings for current owner's fields
- `GET    /bookings/owner/recent` – Get recent bookings for current owner (last 30 days)
- `GET    /bookings/owner/stats` – Get booking statistics for current owner
- `PUT    /bookings/{id}/status` – Update booking status (OWNER only)
- `DELETE /bookings/{id}` – Cancel a booking

---

## Player Service (`player-service`)

### PlayerController (base: `/players`)

- `GET    /players/health` – Player service health check
- `GET    /players/me` – Get current authenticated player profile
- `GET    /players` – List all active players
- `GET    /players/email/{email}` – Get player by email
- `GET    /players/{id}` – Get player by ID
- `PUT    /players/{id}` – Update player profile

### FeedbackController (base: `/feedbacks`)

- `POST   /feedbacks/player/{playerId}` – Add feedback for player
- `GET    /feedbacks/player/{playerId}` – Get feedbacks for player
- `GET    /feedbacks/player/{playerId}/rating` – Get average rating for player (US20)
- `GET    /feedbacks/given/{giverId}` – Get feedbacks given by player
- `GET    /feedbacks/{id}` – Get feedback by ID
- `DELETE /feedbacks/{id}` – Delete feedback

---

## Notification Service (`notification-service`)

Base path: `/notifications`

- `GET    /notifications/health` – Notification service health check
- `POST   /notifications` – Create general notification
- `POST   /notifications/player-accepted` – Notify that player accepted invitation (US18)
- `POST   /notifications/field-reserved` – Notify that field has been reserved (US19)
- `GET    /notifications` – Get current user’s notifications
- `GET    /notifications/unread-count` – Get unread notifications count for current user
- `PUT    /notifications/{id}/read` – Mark notification as read
- `PUT    /notifications/read-all` – Mark all notifications as read
- `DELETE /notifications/{id}` – Delete notification

