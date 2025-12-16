package com.iset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

/**
 * Availability Entity
 * US15: Owner sets field availability (jours/heures disponibles)
 * US17: Player sees available terrains
 */
@Entity
@Table(name = "availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    // Day of week (MONDAY, TUESDAY, etc.)
    @Column(nullable = false)
    private Integer dayOfWeek; // 1-7 (Monday-Sunday)

    // Start time (e.g., 08:00)
    @Column(nullable = false)
    private LocalTime startTime;

    // End time (e.g., 22:00)
    @Column(nullable = false)
    private LocalTime endTime;

    // Is this slot available
    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isAvailable = true;

    // Max bookings for this slot
    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer maxBookings = 1;

    // Current bookings
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentBookings = 0;
}
