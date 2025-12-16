package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {

    private Long id;
    private Long fieldId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    private Integer maxBookings;
    private Integer currentBookings;
}
