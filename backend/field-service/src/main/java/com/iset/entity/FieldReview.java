package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Field Review/Rating Entity
 * US16: Player leaves review/rating for terrain
 * US20: Average ratings calculation
 */
@Entity
@Table(name = "field_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    // Reviewer's Keycloak ID (player who used the field)
    @Column(nullable = false)
    private String reviewerKeycloakId;

    @Column(nullable = false)
    private String reviewerEmail;

    // Rating from 1-5
    @Column(nullable = false)
    private Integer rating; // 1-5

    // Review content
    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
