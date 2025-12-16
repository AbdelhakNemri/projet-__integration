package com.iset.dto;

import com.iset.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String recipientKeycloakId;
    private String recipientEmail;
    private NotificationType type;
    private String title;
    private String message;
    private String source;
    private Boolean read;
    private LocalDateTime readAt;
    private String metadata;
    private LocalDateTime createdAt;
}

