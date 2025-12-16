package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerAcceptedNotificationRequest {
    private Long eventId;
    private String eventTitle;
    private String organizerKeycloakId;
    private String organizerEmail;
    private String playerKeycloakId;
    private String playerEmail;
    private String message;
}

