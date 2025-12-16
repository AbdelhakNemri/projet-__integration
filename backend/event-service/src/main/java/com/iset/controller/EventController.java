package com.iset.controller;

import com.iset.dto.*;
import com.iset.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Event Controller
 * US6: Create event
 * US7: Invite players
 * US8: Accept/refuse requests
 * US9: Remove player
 * US10: Reserve field
 * US11: Search/join event
 * US12: Rate event
 */
@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Event Service is running");
    }

    /**
     * US6: Create event (match)
     * PLAYER, OWNER, ADMIN can create events
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody CreateEventRequest request) {
        try {
            EventDTO event = eventService.createEvent(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(event);
        } catch (Exception e) {
            e.printStackTrace(); // Debugging
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get event by ID
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        try {
            EventDTO event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * US11: Get all available public events
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/available")
    public ResponseEntity<List<EventDTO>> getAvailableEvents() {
        List<EventDTO> events = eventService.getAvailableEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * US11: Search events
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<List<EventDTO>> searchEvents(@RequestParam String query) {
        List<EventDTO> events = eventService.searchEvents(query);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events organized by current user
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/my-events")
    public ResponseEntity<List<EventDTO>> getMyEvents() {
        List<EventDTO> events = eventService.getMyEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get events where current user is participating
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/my-participations")
    public ResponseEntity<List<EventDTO>> getMyParticipations() {
        List<EventDTO> events = eventService.getMyParticipations();
        return ResponseEntity.ok(events);
    }

    /**
     * US7: Invite players to event
     * Only organizer can invite
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/{eventId}/invite")
    public ResponseEntity<Void> invitePlayers(
            @PathVariable Long eventId,
            @RequestBody InvitePlayersRequest request) {
        try {
            eventService.invitePlayers(eventId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US8: Accept/refuse participation request
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/{eventId}/respond")
    public ResponseEntity<ParticipantDTO> respondToInvitation(
            @PathVariable Long eventId,
            @RequestParam String response) {
        try {
            ParticipantDTO participant = eventService.respondToInvitation(eventId, response);
            return ResponseEntity.ok(participant);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US9: Remove player from event
     * Only organizer can remove players
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @DeleteMapping("/{eventId}/participants/{participantId}")
    public ResponseEntity<Void> removePlayer(
            @PathVariable Long eventId,
            @PathVariable Long participantId) {
        try {
            eventService.removePlayer(eventId, participantId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US11: Join event (for public events)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/{eventId}/join")
    public ResponseEntity<ParticipantDTO> joinEvent(@PathVariable Long eventId) {
        try {
            ParticipantDTO participant = eventService.joinEvent(eventId);
            return ResponseEntity.ok(participant);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US12: Rate event
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/{eventId}/ratings")
    public ResponseEntity<EventRatingDTO> rateEvent(
            @PathVariable Long eventId,
            @RequestBody EventRatingDTO ratingDTO) {
        try {
            EventRatingDTO rating = eventService.rateEvent(eventId, ratingDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(rating);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get ratings for an event
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/{eventId}/ratings")
    public ResponseEntity<List<EventRatingDTO>> getEventRatings(@PathVariable Long eventId) {
        List<EventRatingDTO> ratings = eventService.getEventRatings(eventId);
        return ResponseEntity.ok(ratings);
    }
}
