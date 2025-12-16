package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldReservedNotificationRequest {
    private Long fieldId;
    private String fieldName;
    private String ownerKeycloakId;
    private String ownerEmail;
    private String reservedByKeycloakId;
    private String reservedByEmail;
    private LocalDateTime reservationDate;
    private Integer durationMinutes;
    private String message;
}

