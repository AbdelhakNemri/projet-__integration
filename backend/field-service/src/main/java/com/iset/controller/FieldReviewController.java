package com.iset.controller;

import com.iset.dto.FieldReviewDTO;
import com.iset.service.FieldReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Field Review Controller
 * US16: Player leaves review/rating for terrain
 * US20: Average ratings calculation
 */
@RestController
@RequestMapping("/fields/{fieldId}/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class FieldReviewController {

    @Autowired
    private FieldReviewService fieldReviewService;

    /**
     * Add review for a field (US16)
     * Only PLAYER and ADMIN can add reviews
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<FieldReviewDTO> addReview(
            @PathVariable Long fieldId,
            @RequestBody FieldReviewDTO reviewDTO) {
        try {
            FieldReviewDTO created = fieldReviewService.addReview(fieldId, reviewDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all reviews for a field
     * Any authenticated user can view reviews
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<FieldReviewDTO>> getReviewsByField(@PathVariable Long fieldId) {
        List<FieldReviewDTO> reviews = fieldReviewService.getReviewsByField(fieldId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get average rating for a field (US20)
     * Any authenticated user can view average rating
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long fieldId) {
        Double average = fieldReviewService.getAverageRating(fieldId);
        return ResponseEntity.ok(Map.of("fieldId", fieldId, "averageRating", average));
    }

    /**
     * Delete review (US16)
     * Only the reviewer or ADMIN can delete their review
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long fieldId,
            @PathVariable Long reviewId) {
        try {
            fieldReviewService.deleteReview(reviewId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
