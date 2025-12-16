package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Event Entity
 * US6: Create event (match)
 * US10: Reserve field for event
 */
@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String organizerKeycloakId; // Event creator

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column(nullable = false)
    private Integer duration; // Duration in minutes

    @Column(nullable = false)
    private Integer maxParticipants;

    @Column(nullable = false)
    private Integer minParticipants;

    @Column(nullable = false)
    private String sportType; // Football, Basketball, etc.

    private Long fieldId; // Reserved field ID from field-service

    @Column(nullable = false)
    private String status; // PLANNED, ONGOING, COMPLETED, CANCELLED

    @Column(nullable = false)
    private String location; // City or address

    private String requirements; // Equipment, skill level, etc.

    @Column(nullable = false)
    private Boolean isPublic = true; // Public or private event

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Participant> participants;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventRating> ratings;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

