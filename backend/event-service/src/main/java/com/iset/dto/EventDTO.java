package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String organizerKeycloakId;
    private String organizerEmail;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Integer duration;
    private Integer maxParticipants;
    private Integer minParticipants;
    private Integer currentParticipants;
    private String sportType;
    private Long fieldId;
    private String status;
    private String location;
    private String requirements;
    private Boolean isPublic;
    private Double averageRating;
    private Integer ratingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ParticipantDTO> participants;
}

