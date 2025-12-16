package com.iset.service;

import com.iset.client.FieldServiceClient;
import com.iset.dto.*;
import com.iset.entity.Event;
import com.iset.entity.EventRating;
import com.iset.entity.Participant;
import com.iset.repository.EventRatingRepository;
import com.iset.repository.EventRepository;
import com.iset.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Event Service
 * US6: Create event
 * US7: Invite players
 * US8: Accept/refuse requests
 * US9: Remove player
 * US10: Reserve field
 * US11: Search/join event
 * US12: Rate event
 */
@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRatingRepository eventRatingRepository;

    @Autowired
    private FieldServiceClient fieldServiceClient;

    /**
     * Get current user's Keycloak ID from JWT
     */
    private String getCurrentUserKeycloakId() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getClaimAsString("sub");
    }

    /**
     * Get current user's email from JWT
     */
    private String getCurrentUserEmail() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getClaimAsString("email");
    }

    /**
     * US6: Create event (match)
     */
    @Transactional
    public EventDTO createEvent(CreateEventRequest request) {
        String organizerKeycloakId = getCurrentUserKeycloakId();
        String organizerEmail = getCurrentUserEmail();

        // Validate field if provided (US10)
        if (request.getFieldId() != null) {
            try {
                FieldDTO field = fieldServiceClient.getFieldById(request.getFieldId());
                if (field == null || !field.getEnabled()) {
                    throw new RuntimeException("Field not found or not available");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to validate field: " + e.getMessage());
            }
        }

        Event event = new Event();
        event.setOrganizerKeycloakId(organizerKeycloakId);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setDuration(request.getDuration());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setMinParticipants(request.getMinParticipants());
        event.setSportType(request.getSportType());
        event.setFieldId(request.getFieldId());
        event.setStatus("PLANNED");
        event.setLocation(request.getLocation());
        event.setRequirements(request.getRequirements());
        event.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        event.setCreatedAt(LocalDateTime.now());

        event = eventRepository.save(event);

        // Auto-add organizer as accepted participant
        Participant organizer = new Participant();
        organizer.setEvent(event);
        organizer.setPlayerKeycloakId(organizerKeycloakId);
        organizer.setPlayerEmail(organizerEmail);
        organizer.setStatus("ACCEPTED");
        organizer.setCreatedAt(LocalDateTime.now());
        participantRepository.save(organizer);

        // Invite players if provided (US7)
        if (request.getInvitedPlayerEmails() != null && !request.getInvitedPlayerEmails().isEmpty()) {
            invitePlayers(event.getId(), new InvitePlayersRequest(request.getInvitedPlayerEmails()));
        }

        return mapToDTO(event);
    }

    /**
     * US7: Invite players to event
     */
    @Transactional
    public void invitePlayers(Long eventId, InvitePlayersRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String organizerKeycloakId = getCurrentUserKeycloakId();
        if (!event.getOrganizerKeycloakId().equals(organizerKeycloakId)) {
            throw new RuntimeException("Only the organizer can invite players");
        }

        for (String email : request.getPlayerEmails()) {
            // Note: In a real implementation, you would need to fetch the Keycloak ID from email
            // For now, we'll use email as a placeholder and require the player to join via email
            // Check if already invited/participating (using email as identifier for invitations)
            List<Participant> existing = participantRepository.findByEventId(eventId);
            boolean alreadyExists = existing.stream()
                    .anyMatch(p -> p.getPlayerEmail().equalsIgnoreCase(email));
            
            if (!alreadyExists) {
                Participant participant = new Participant();
                participant.setEvent(event);
                participant.setPlayerKeycloakId("INVITED_" + email); // Placeholder until player accepts
                participant.setPlayerEmail(email);
                participant.setStatus("INVITED");
                participant.setCreatedAt(LocalDateTime.now());
                participantRepository.save(participant);
            }
        }
    }

    /**
     * US8: Accept/refuse participation request
     */
    @Transactional
    public ParticipantDTO respondToInvitation(Long eventId, String response) {
        String playerKeycloakId = getCurrentUserKeycloakId();

        Participant participant = participantRepository
                .findByEventIdAndPlayerKeycloakId(eventId, playerKeycloakId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!participant.getStatus().equals("INVITED") && !participant.getStatus().equals("PENDING")) {
            throw new RuntimeException("Cannot respond to this invitation");
        }

        Event event = participant.getEvent();
        if (response.equalsIgnoreCase("ACCEPT")) {
            // Check if event is full
            Integer currentCount = participantRepository.countAcceptedParticipantsByEventId(eventId);
            if (currentCount >= event.getMaxParticipants()) {
                throw new RuntimeException("Event is full");
            }
            participant.setStatus("ACCEPTED");
        } else if (response.equalsIgnoreCase("REJECT")) {
            participant.setStatus("REJECTED");
        } else {
            throw new RuntimeException("Invalid response. Use 'ACCEPT' or 'REJECT'");
        }

        participant.setUpdatedAt(LocalDateTime.now());
        participant = participantRepository.save(participant);
        return mapParticipantToDTO(participant);
    }

    /**
     * US9: Remove player from event
     */
    @Transactional
    public void removePlayer(Long eventId, Long participantId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String currentUserKeycloakId = getCurrentUserKeycloakId();
        if (!event.getOrganizerKeycloakId().equals(currentUserKeycloakId)) {
            throw new RuntimeException("Only the organizer can remove players");
        }

        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (!participant.getEvent().getId().equals(eventId)) {
            throw new RuntimeException("Participant does not belong to this event");
        }

        participant.setStatus("REMOVED");
        participant.setUpdatedAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    /**
     * US11: Join event (for public events)
     */
    @Transactional
    public ParticipantDTO joinEvent(Long eventId) {
        String playerKeycloakId = getCurrentUserKeycloakId();
        String playerEmail = getCurrentUserEmail();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getIsPublic()) {
            throw new RuntimeException("This event is private. You need an invitation.");
        }

        if (!event.getStatus().equals("PLANNED")) {
            throw new RuntimeException("Cannot join this event. Status: " + event.getStatus());
        }

        // Check if already participating
        if (participantRepository.existsByEventIdAndPlayerKeycloakId(eventId, playerKeycloakId)) {
            throw new RuntimeException("You are already participating in this event");
        }

        // Check if event is full
        Integer currentCount = participantRepository.countAcceptedParticipantsByEventId(eventId);
        if (currentCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Event is full");
        }

        Participant participant = new Participant();
        participant.setEvent(event);
        participant.setPlayerKeycloakId(playerKeycloakId);
        participant.setPlayerEmail(playerEmail);
        participant.setStatus("ACCEPTED");
        participant.setCreatedAt(LocalDateTime.now());

        participant = participantRepository.save(participant);
        return mapParticipantToDTO(participant);
    }

    /**
     * US11: Search events
     */
    public List<EventDTO> searchEvents(String query) {
        List<Event> events = eventRepository.searchEvents(query);
        return events.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Get all available public events
     */
    public List<EventDTO> getAvailableEvents() {
        List<Event> events = eventRepository.findAvailablePublicEvents(LocalDateTime.now());
        return events.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Get event by ID
     */
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToDTO(event);
    }

    /**
     * Get events organized by current user
     */
    public List<EventDTO> getMyEvents() {
        String organizerKeycloakId = getCurrentUserKeycloakId();
        List<Event> events = eventRepository.findByOrganizerKeycloakId(organizerKeycloakId);
        return events.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Get events where current user is participating
     */
    public List<EventDTO> getMyParticipations() {
        String playerKeycloakId = getCurrentUserKeycloakId();
        List<Participant> participants = participantRepository.findByPlayerKeycloakId(playerKeycloakId);
        List<Long> eventIds = participants.stream()
                .filter(p -> p.getStatus().equals("ACCEPTED"))
                .map(p -> p.getEvent().getId())
                .collect(Collectors.toList());
        List<Event> events = eventRepository.findAllById(eventIds);
        return events.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * US12: Rate event
     */
    @Transactional
    public EventRatingDTO rateEvent(Long eventId, EventRatingDTO ratingDTO) {
        String raterKeycloakId = getCurrentUserKeycloakId();
        String raterEmail = getCurrentUserEmail();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if user participated in the event
        Participant participant = participantRepository
                .findByEventIdAndPlayerKeycloakId(eventId, raterKeycloakId)
                .orElse(null);

        if (participant == null || !participant.getStatus().equals("ACCEPTED")) {
            throw new RuntimeException("You must have participated in the event to rate it");
        }

        // Check if already rated
        if (eventRatingRepository.existsByEventIdAndRaterKeycloakId(eventId, raterKeycloakId)) {
            throw new RuntimeException("You have already rated this event");
        }

        if (ratingDTO.getRating() < 1 || ratingDTO.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        EventRating rating = new EventRating();
        rating.setEvent(event);
        rating.setRaterKeycloakId(raterKeycloakId);
        rating.setRaterEmail(raterEmail);
        rating.setRating(ratingDTO.getRating());
        rating.setComment(ratingDTO.getComment());
        rating.setCreatedAt(LocalDateTime.now());

        rating = eventRatingRepository.save(rating);

        // Update event average rating
        updateEventAverageRating(eventId);

        return mapRatingToDTO(rating);
    }

    /**
     * Get ratings for an event
     */
    public List<EventRatingDTO> getEventRatings(Long eventId) {
        List<EventRating> ratings = eventRatingRepository.findByEventId(eventId);
        return ratings.stream().map(this::mapRatingToDTO).collect(Collectors.toList());
    }

    /**
     * Update event's average rating
     */
    private void updateEventAverageRating(Long eventId) {
        Double average = eventRatingRepository.getAverageRatingByEventId(eventId);
        Integer count = eventRatingRepository.getRatingCountByEventId(eventId);
        // Note: We could update Event entity with these values if needed
    }

    /**
     * Map Event to EventDTO
     */
    private EventDTO mapToDTO(Event event) {
        Integer currentParticipants = participantRepository.countAcceptedParticipantsByEventId(event.getId());
        Double averageRating = eventRatingRepository.getAverageRatingByEventId(event.getId());
        Integer ratingCount = eventRatingRepository.getRatingCountByEventId(event.getId());

        List<ParticipantDTO> participants = participantRepository.findByEventId(event.getId())
                .stream()
                .map(this::mapParticipantToDTO)
                .collect(Collectors.toList());

        return new EventDTO(
                event.getId(),
                event.getOrganizerKeycloakId(),
                null, // organizerEmail - would need to fetch from Keycloak
                event.getTitle(),
                event.getDescription(),
                event.getEventDate(),
                event.getDuration(),
                event.getMaxParticipants(),
                event.getMinParticipants(),
                currentParticipants,
                event.getSportType(),
                event.getFieldId(),
                event.getStatus(),
                event.getLocation(),
                event.getRequirements(),
                event.getIsPublic(),
                averageRating != null ? averageRating : 0.0,
                ratingCount != null ? ratingCount : 0,
                event.getCreatedAt(),
                event.getUpdatedAt(),
                participants
        );
    }

    /**
     * Map Participant to ParticipantDTO
     */
    private ParticipantDTO mapParticipantToDTO(Participant participant) {
        return new ParticipantDTO(
                participant.getId(),
                participant.getEvent().getId(),
                participant.getPlayerKeycloakId(),
                participant.getPlayerEmail(),
                participant.getStatus(),
                participant.getCreatedAt(),
                participant.getUpdatedAt()
        );
    }

    /**
     * Map EventRating to EventRatingDTO
     */
    private EventRatingDTO mapRatingToDTO(EventRating rating) {
        return new EventRatingDTO(
                rating.getId(),
                rating.getEvent().getId(),
                rating.getRaterKeycloakId(),
                rating.getRaterEmail(),
                rating.getRating(),
                rating.getComment(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}

