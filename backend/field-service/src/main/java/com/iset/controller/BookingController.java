package com.iset.controller;

import com.iset.dto.BookingDTO;
import com.iset.entity.Booking.BookingStatus;
import com.iset.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Booking Controller
 * Handles field booking/reservation operations
 */
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking
     * POST /bookings
     */
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateBookingRequest request) {

        String playerKeycloakId = jwt.getSubject();

        BookingDTO booking = bookingService.createBooking(
                request.fieldId(),
                playerKeycloakId,
                request.bookingDate(),
                request.durationHours(),
                request.notes());

        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    /**
     * Get all bookings for a specific field
     * GET /bookings/field/{fieldId}
     */
    @GetMapping("/field/{fieldId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByField(@PathVariable Long fieldId) {
        List<BookingDTO> bookings = bookingService.getBookingsByField(fieldId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get all bookings made by the current player
     * GET /bookings/my-bookings
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@AuthenticationPrincipal Jwt jwt) {
        String playerKeycloakId = jwt.getSubject();
        List<BookingDTO> bookings = bookingService.getBookingsByPlayer(playerKeycloakId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get all bookings for fields owned by the current owner
     * GET /bookings/owner/all
     */
    @GetMapping("/owner/all")
    public ResponseEntity<List<BookingDTO>> getOwnerBookings(@AuthenticationPrincipal Jwt jwt) {
        String ownerKeycloakId = jwt.getSubject();
        List<BookingDTO> bookings = bookingService.getBookingsByOwner(ownerKeycloakId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get recent bookings for the current owner (last 30 days)
     * GET /bookings/owner/recent
     */
    @GetMapping("/owner/recent")
    public ResponseEntity<List<BookingDTO>> getOwnerRecentBookings(@AuthenticationPrincipal Jwt jwt) {
        String ownerKeycloakId = jwt.getSubject();
        List<BookingDTO> bookings = bookingService.getRecentBookingsByOwner(ownerKeycloakId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking statistics for the current owner
     * GET /bookings/owner/stats
     */
    @GetMapping("/owner/stats")
    public ResponseEntity<BookingService.BookingStats> getOwnerBookingStats(@AuthenticationPrincipal Jwt jwt) {
        String ownerKeycloakId = jwt.getSubject();
        BookingService.BookingStats stats = bookingService.getOwnerBookingStats(ownerKeycloakId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Update booking status (Owner only)
     * PUT /bookings/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        BookingStatus status = BookingStatus.valueOf(request.get("status"));
        BookingDTO updated = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cancel a booking
     * DELETE /bookings/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        String userKeycloakId = jwt.getSubject();
        bookingService.cancelBooking(id, userKeycloakId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get a specific booking by ID
     * GET /bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        // This would need to be implemented in the service
        return ResponseEntity.ok(null); // Placeholder
    }

    // Request DTOs
    public record CreateBookingRequest(
            Long fieldId,
            LocalDateTime bookingDate,
            Integer durationHours,
            String notes) {
    }
}
