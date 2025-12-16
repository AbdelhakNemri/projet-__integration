package com.iset.service;

import com.iset.dto.BookingDTO;
import com.iset.entity.Booking;
import com.iset.entity.Booking.BookingStatus;
import com.iset.entity.Field;
import com.iset.repository.BookingRepository;
import com.iset.repository.FieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FieldRepository fieldRepository;

    /**
     * Create a new booking
     */
    @Transactional
    public BookingDTO createBooking(Long fieldId, String playerKeycloakId, LocalDateTime bookingDate,
            Integer durationHours, String notes) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        // Calculate total price
        BigDecimal totalPrice = field.getPricePerHour().multiply(BigDecimal.valueOf(durationHours));

        Booking booking = new Booking();
        booking.setField(field);
        booking.setPlayerKeycloakId(playerKeycloakId);
        booking.setBookingDate(bookingDate);
        booking.setDurationHours(durationHours);
        booking.setTotalPrice(totalPrice);
        booking.setNotes(notes);
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return toDTO(saved);
    }

    /**
     * Get all bookings for a specific field
     */
    public List<BookingDTO> getBookingsByField(Long fieldId) {
        return bookingRepository.findByFieldId(fieldId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings made by a player
     */
    public List<BookingDTO> getBookingsByPlayer(String playerKeycloakId) {
        return bookingRepository.findByPlayerKeycloakId(playerKeycloakId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for fields owned by an owner
     */
    public List<BookingDTO> getBookingsByOwner(String ownerKeycloakId) {
        return bookingRepository.findByFieldOwnerKeycloakId(ownerKeycloakId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recent bookings for an owner (last 30 days)
     */
    public List<BookingDTO> getRecentBookingsByOwner(String ownerKeycloakId) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        return bookingRepository.findRecentBookingsByOwner(ownerKeycloakId, since).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update booking status
     */
    @Transactional
    public BookingDTO updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        return toDTO(updated);
    }

    /**
     * Cancel a booking
     */
    @Transactional
    public void cancelBooking(Long bookingId, String userKeycloakId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if user is the player or the field owner
        boolean isPlayer = booking.getPlayerKeycloakId().equals(userKeycloakId);
        boolean isOwner = booking.getField().getOwnerKeycloakId().equals(userKeycloakId);

        if (!isPlayer && !isOwner) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    /**
     * Get booking statistics for an owner
     */
    public BookingStats getOwnerBookingStats(String ownerKeycloakId) {
        Long pendingCount = bookingRepository.countByOwnerAndStatus(ownerKeycloakId, BookingStatus.PENDING);
        Long confirmedCount = bookingRepository.countByOwnerAndStatus(ownerKeycloakId, BookingStatus.CONFIRMED);
        Long completedCount = bookingRepository.countByOwnerAndStatus(ownerKeycloakId, BookingStatus.COMPLETED);
        Long cancelledCount = bookingRepository.countByOwnerAndStatus(ownerKeycloakId, BookingStatus.CANCELLED);

        return new BookingStats(pendingCount, confirmedCount, completedCount, cancelledCount);
    }

    /**
     * Convert Booking entity to DTO
     */
    private BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setFieldId(booking.getField().getId());
        dto.setFieldName(booking.getField().getName());
        dto.setPlayerKeycloakId(booking.getPlayerKeycloakId());
        dto.setBookingDate(booking.getBookingDate());
        dto.setDurationHours(booking.getDurationHours());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStatus(booking.getStatus());
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setNotes(booking.getNotes());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    // Inner class for statistics
    public static class BookingStats {
        public Long pending;
        public Long confirmed;
        public Long completed;
        public Long cancelled;

        public BookingStats(Long pending, Long confirmed, Long completed, Long cancelled) {
            this.pending = pending;
            this.confirmed = confirmed;
            this.completed = completed;
            this.cancelled = cancelled;
        }
    }
}
