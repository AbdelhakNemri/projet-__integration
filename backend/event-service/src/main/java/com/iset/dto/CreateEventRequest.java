package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Integer duration;
    private Integer maxParticipants;
    private Integer minParticipants;
    private String sportType;
    private Long fieldId; // Optional - to reserve a field
    private String location;
    private String requirements;
    private Boolean isPublic = true;
    private List<String> invitedPlayerEmails; // Optional - to invite players
}

