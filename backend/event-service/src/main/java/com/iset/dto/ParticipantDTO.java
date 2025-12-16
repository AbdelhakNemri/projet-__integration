package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private Long id;
    private Long eventId;
    private String playerKeycloakId;
    private String playerEmail;
    private String status; // INVITED, PENDING, ACCEPTED, REJECTED, REMOVED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

