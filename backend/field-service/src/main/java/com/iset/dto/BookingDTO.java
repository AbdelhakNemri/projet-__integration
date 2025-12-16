package com.iset.dto;

import com.iset.entity.Booking.BookingStatus;
import com.iset.entity.Booking.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long fieldId;
    private String fieldName;
    private String playerKeycloakId;
    private LocalDateTime bookingDate;
    private Integer durationHours;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
