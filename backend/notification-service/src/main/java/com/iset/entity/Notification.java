package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientKeycloakId;

    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    private String source; // Which service produced it

    @Column(nullable = false, name = "`read`")
    private Boolean read = false;

    private LocalDateTime readAt;

    @Lob
    private String metadata; // JSON payload for extra info

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        if (Boolean.TRUE.equals(read) && readAt == null) {
            readAt = LocalDateTime.now();
        }
    }
}
