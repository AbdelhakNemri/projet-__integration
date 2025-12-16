package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Field/Terrain Entity
 * US13: Create field (terrain) with details
 * US14: Modify field information
 * US17: Player sees available terrains
 */
@Entity
@Table(name = "fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner's Keycloak ID
    @Column(nullable = false)
    private String ownerKeycloakId;

    @Column(nullable = false)
    private String name;

    private String description;
    private String location;
    private String city;
    private String postalCode;
    private Integer capacity;
    private String type; // Football, Basketball, Tennis, etc.

    @Column(nullable = false)
    private BigDecimal pricePerHour;

    private String facilities; // JSON or comma-separated
    private String photoUrl;

    private Double averageRating;
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
