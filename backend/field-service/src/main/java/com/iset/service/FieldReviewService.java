package com.iset.service;

import com.iset.dto.FieldReviewDTO;
import com.iset.entity.Field;
import com.iset.entity.FieldReview;
import com.iset.repository.FieldRepository;
import com.iset.repository.FieldReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Field Review Service
 * US16: Player leaves review/rating for terrain
 * US20: Average ratings calculation
 */
@Service
public class FieldReviewService {

    @Autowired
    private FieldReviewRepository fieldReviewRepository;

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private FieldService fieldService;

    /**
     * Get current user's Keycloak ID and email from JWT
     */
    private String getCurrentUserKeycloakId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getSubject();
        }
        return null;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("email");
        }
        return null;
    }

    /**
     * Add review for a field (US16)
     */
    public FieldReviewDTO addReview(Long fieldId, FieldReviewDTO reviewDTO) {
        String reviewerKeycloakId = getCurrentUserKeycloakId();
        String reviewerEmail = getCurrentUserEmail();

        if (reviewerKeycloakId == null) {
            throw new RuntimeException("User not authenticated");
        }

        if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        FieldReview review = new FieldReview();
        review.setField(field);
        review.setReviewerKeycloakId(reviewerKeycloakId);
        review.setReviewerEmail(reviewerEmail);
        review.setRating(reviewDTO.getRating());
        review.setContent(reviewDTO.getContent());

        review = fieldReviewRepository.save(review);

        // Update field's average rating
        updateFieldRating(fieldId);

        return convertToDTO(review);
    }

    /**
     * Get all reviews for a field
     */
    public List<FieldReviewDTO> getReviewsByField(Long fieldId) {
        List<FieldReview> reviews = fieldReviewRepository.findByFieldId(fieldId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Get all reviews given by a user
     */
    public List<FieldReviewDTO> getReviewsByReviewer(String reviewerKeycloakId) {
        List<FieldReview> reviews = fieldReviewRepository.findByReviewerKeycloakId(reviewerKeycloakId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Get average rating for a field (US20)
     */
    public Double getAverageRating(Long fieldId) {
        Double average = fieldReviewRepository.getAverageRatingByFieldId(fieldId);
        return average != null ? average : 0.0;
    }

    /**
     * Delete review
     */
    public void deleteReview(Long reviewId) {
        FieldReview review = fieldReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        String currentUserKeycloakId = getCurrentUserKeycloakId();
        if (!review.getReviewerKeycloakId().equals(currentUserKeycloakId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        fieldReviewRepository.deleteById(reviewId);

        // Update field's average rating
        updateFieldRating(review.getField().getId());
    }

    /**
     * Update field's average rating and review count
     */
    private void updateFieldRating(Long fieldId) {
        fieldService.updateAverageRating(fieldId);
    }

    /**
     * Convert FieldReview entity to DTO
     */
    private FieldReviewDTO convertToDTO(FieldReview review) {
        FieldReviewDTO dto = new FieldReviewDTO();
        dto.setId(review.getId());
        dto.setFieldId(review.getField().getId());
        dto.setReviewerKeycloakId(review.getReviewerKeycloakId());
        dto.setReviewerEmail(review.getReviewerEmail());
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
