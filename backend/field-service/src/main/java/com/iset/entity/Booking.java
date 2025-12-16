package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Booking Entity
 * Represents a field reservation/booking by a player
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    // Player's Keycloak ID who made the booking
    @Column(nullable = false)
    private String playerKeycloakId;

    // Booking date and time
    @Column(nullable = false)
    private LocalDateTime bookingDate;

    // Duration in hours
    @Column(nullable = false)
    private Integer durationHours = 1;

    // Total price
    @Column(nullable = false)
    private BigDecimal totalPrice;

    // Booking status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    // Payment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Notes from player
    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELLED,
        COMPLETED
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        REFUNDED
    }
}
