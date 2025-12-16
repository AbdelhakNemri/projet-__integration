package com.iset.dto;

import com.iset.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {
    private NotificationType type = NotificationType.INTERNAL;
    private String recipientKeycloakId;
    private String recipientEmail;
    private String title;
    private String message;
    private String source;
    private String metadata;
}

