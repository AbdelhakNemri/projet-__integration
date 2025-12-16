package com.iset.controller;
import com.iset.dto.AvailabilityDTO;
import com.iset.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Availability Controller
 * US15: Owner sets field availability
 * US17: Player sees available time slots
 */
@RestController
@RequestMapping("/fields/{fieldId}/availability")
@CrossOrigin(origins = "http://localhost:4200")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    /**
     * Add availability slot for a field (US15)
     * Only OWNER can add availability
     */
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ResponseEntity<AvailabilityDTO> addAvailability(
            @PathVariable Long fieldId,
            @RequestBody AvailabilityDTO availabilityDTO) {
        try {
            AvailabilityDTO created = availabilityService.addAvailability(fieldId, availabilityDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all availability slots for a field (US17)
     * Any authenticated user can view availability
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<AvailabilityDTO>> getFieldAvailability(@PathVariable Long fieldId) {
        List<AvailabilityDTO> availabilities = availabilityService.getFieldAvailability(fieldId);
        return ResponseEntity.ok(availabilities);
    }

    /**
     * Get available slots for a specific day (US17)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<AvailabilityDTO>> getAvailabilityByDay(
            @PathVariable Long fieldId,
            @PathVariable String dayOfWeek) {
        List<AvailabilityDTO> availabilities = availabilityService.getAvailabilityByDay(fieldId, dayOfWeek);
        return ResponseEntity.ok(availabilities);
    }

    /**
     * Update availability slot (US15)
     * Only OWNER can update availability
     */
    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{availabilityId}")
    public ResponseEntity<AvailabilityDTO> updateAvailability(
            @PathVariable Long fieldId,
            @PathVariable Long availabilityId,
            @RequestBody AvailabilityDTO availabilityDTO) {
        try {
            AvailabilityDTO updated = availabilityService.updateAvailability(availabilityId, availabilityDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete availability slot (US15)
     * Only OWNER can delete availability
     */
    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long fieldId,
            @PathVariable Long availabilityId) {
        try {
            availabilityService.deleteAvailability(availabilityId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
