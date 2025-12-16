package com.iset.repository;

import com.iset.entity.Booking;
import com.iset.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find all bookings for a specific field
    List<Booking> findByFieldId(Long fieldId);

    // Find all bookings for a specific field with status
    List<Booking> findByFieldIdAndStatus(Long fieldId, BookingStatus status);

    // Find all bookings by a specific player
    List<Booking> findByPlayerKeycloakId(String playerKeycloakId);

    // Find bookings for fields owned by a specific owner
    @Query("SELECT b FROM Booking b WHERE b.field.ownerKeycloakId = :ownerKeycloakId ORDER BY b.bookingDate DESC")
    List<Booking> findByFieldOwnerKeycloakId(@Param("ownerKeycloakId") String ownerKeycloakId);

    // Find recent bookings for an owner (last N days)
    @Query("SELECT b FROM Booking b WHERE b.field.ownerKeycloakId = :ownerKeycloakId " +
           "AND b.createdAt >= :since ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookingsByOwner(@Param("ownerKeycloakId") String ownerKeycloakId,
                                            @Param("since") LocalDateTime since);

    // Count bookings by status for an owner
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.field.ownerKeycloakId = :ownerKeycloakId AND b.status = :status")
    Long countByOwnerAndStatus(@Param("ownerKeycloakId") String ownerKeycloakId,
                                @Param("status") BookingStatus status);

    // Find upcoming bookings for a field
    @Query("SELECT b FROM Booking b WHERE b.field.id = :fieldId " +
           "AND b.bookingDate >= :now AND b.status IN ('PENDING', 'CONFIRMED') " +
           "ORDER BY b.bookingDate ASC")
    List<Booking> findUpcomingBookingsByField(@Param("fieldId") Long fieldId,
                                               @Param("now") LocalDateTime now);
}
