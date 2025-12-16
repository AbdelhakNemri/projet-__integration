package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRatingDTO {
    private Long id;
    private Long eventId;
    private String raterKeycloakId;
    private String raterEmail;
    private Integer rating; // 1-5
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

