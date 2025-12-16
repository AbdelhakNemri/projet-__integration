package com.iset.service;

import com.iset.dto.AvailabilityDTO;
import com.iset.entity.Availability;
import com.iset.entity.Field;
import com.iset.repository.AvailabilityRepository;
import com.iset.repository.FieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Availability Service
 * US15: Owner sets field availability
 * US17: Player sees available time slots
 */
@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private FieldRepository fieldRepository;

    /**
     * Add availability slot for a field (US15)
     */
    public AvailabilityDTO addAvailability(Long fieldId, AvailabilityDTO availabilityDTO) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        Availability availability = new Availability();
        availability.setField(field);
        availability.setDayOfWeek(convertDayOfWeekToInteger(availabilityDTO.getDayOfWeek()));
        availability.setStartTime(availabilityDTO.getStartTime());
        availability.setEndTime(availabilityDTO.getEndTime());
        availability.setIsAvailable(true);
        availability.setMaxBookings(availabilityDTO.getMaxBookings() != null ? availabilityDTO.getMaxBookings() : 1);
        availability.setCurrentBookings(0);

        availability = availabilityRepository.save(availability);
        return convertToDTO(availability);
    }

    /**
     * Get all availability slots for a field
     */
    public List<AvailabilityDTO> getFieldAvailability(Long fieldId) {
        List<Availability> availabilities = availabilityRepository.findByFieldId(fieldId);
        return availabilities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Get available slots for a specific day
     */
    public List<AvailabilityDTO> getAvailabilityByDay(Long fieldId, String dayOfWeek) {
        Integer dayOfWeekInt = convertDayOfWeekToInteger(dayOfWeek);
        List<Availability> availabilities = availabilityRepository.findByFieldIdAndDayOfWeek(fieldId, dayOfWeekInt);
        return availabilities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Update availability slot
     */
    public AvailabilityDTO updateAvailability(Long id, AvailabilityDTO availabilityDTO) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        if (availabilityDTO.getStartTime() != null) {
            availability.setStartTime(availabilityDTO.getStartTime());
        }
        if (availabilityDTO.getEndTime() != null) {
            availability.setEndTime(availabilityDTO.getEndTime());
        }
        if (availabilityDTO.getIsAvailable() != null) {
            availability.setIsAvailable(availabilityDTO.getIsAvailable());
        }
        if (availabilityDTO.getMaxBookings() != null) {
            availability.setMaxBookings(availabilityDTO.getMaxBookings());
        }

        availability = availabilityRepository.save(availability);
        return convertToDTO(availability);
    }

    /**
     * Delete availability slot
     */
    public void deleteAvailability(Long id) {
        availabilityRepository.deleteById(id);
    }

    /**
     * Increment current bookings for a slot
     */
    public void incrementBooking(Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        if (availability.getCurrentBookings() < availability.getMaxBookings()) {
            availability.setCurrentBookings(availability.getCurrentBookings() + 1);
            availabilityRepository.save(availability);
        }
    }

    /**
     * Decrement current bookings for a slot
     */
    public void decrementBooking(Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        if (availability.getCurrentBookings() > 0) {
            availability.setCurrentBookings(availability.getCurrentBookings() - 1);
            availabilityRepository.save(availability);
        }
    }

    /**
     * Convert Availability entity to DTO
     */
    private AvailabilityDTO convertToDTO(Availability availability) {
        AvailabilityDTO dto = new AvailabilityDTO();
        dto.setId(availability.getId());
        dto.setFieldId(availability.getField().getId());
        dto.setDayOfWeek(convertDayOfWeekToString(availability.getDayOfWeek()));
        dto.setStartTime(availability.getStartTime());
        dto.setEndTime(availability.getEndTime());
        dto.setIsAvailable(availability.getIsAvailable());
        dto.setMaxBookings(availability.getMaxBookings());
        dto.setCurrentBookings(availability.getCurrentBookings());
        return dto;
    }

    /**
     * Convert day of week string to integer (MONDAY=1, SUNDAY=7)
     */
    private Integer convertDayOfWeekToInteger(String dayOfWeek) {
        if (dayOfWeek == null) return null;
        switch (dayOfWeek.toUpperCase()) {
            case "MONDAY": return 1;
            case "TUESDAY": return 2;
            case "WEDNESDAY": return 3;
            case "THURSDAY": return 4;
            case "FRIDAY": return 5;
            case "SATURDAY": return 6;
            case "SUNDAY": return 7;
            default: throw new IllegalArgumentException("Invalid day of week: " + dayOfWeek);
        }
    }

    /**
     * Convert day of week integer to string (1=MONDAY, 7=SUNDAY)
     */
    private String convertDayOfWeekToString(Integer dayOfWeek) {
        if (dayOfWeek == null) return null;
        switch (dayOfWeek) {
            case 1: return "MONDAY";
            case 2: return "TUESDAY";
            case 3: return "WEDNESDAY";
            case 4: return "THURSDAY";
            case 5: return "FRIDAY";
            case 6: return "SATURDAY";
            case 7: return "SUNDAY";
            default: throw new IllegalArgumentException("Invalid day of week number: " + dayOfWeek);
        }
    }
}
