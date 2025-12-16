package com.iset.controller;
import com.iset.dto.FeedbackDTO;
import com.iset.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/feedbacks")
@CrossOrigin(origins = "http://localhost:4200")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    /**
     * Ajouter un feedback pour un joueur
     * Accessible: PLAYER, ADMIN (les PLAYER donnent du feedback à d'autres PLAYER)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'ADMIN')")
    @PostMapping("/player/{playerId}")
    public ResponseEntity<FeedbackDTO> addFeedback(
            @PathVariable Long playerId,
            @RequestBody Map<String, Object> request) {
        try {
            String content = (String) request.get("content");
            int rating = (int) request.get("rating");

            if (content == null || content.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().build();
            }

            FeedbackDTO feedback = feedbackService.addFeedback(playerId, content, rating);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Récupérer tous les feedbacks d'un joueur
     * Accessible: PLAYER, OWNER, ADMIN (public - see ratings)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByPlayer(@PathVariable Long playerId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByPlayerId(playerId);
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * Récupérer la note moyenne d'un joueur (US20)
     * Accessible: PLAYER, OWNER, ADMIN (voir les notes moyennes)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/player/{playerId}/rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long playerId) {
        double average = feedbackService.getAverageRating(playerId);
        return ResponseEntity.ok(Map.of("playerId", playerId, "averageRating", average));
    }

    /**
     * Récupérer tous les feedbacks donnés par un joueur
     * Accessible: PLAYER, ADMIN
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'ADMIN')")
    @GetMapping("/given/{giverId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByGiver(@PathVariable Long giverId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByGiverId(giverId);
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * Récupérer un feedback par ID
     * Accessible: PLAYER, OWNER, ADMIN
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(@PathVariable Long id) {
        try {
            FeedbackDTO feedback = feedbackService.getFeedbackById(id);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Supprimer un feedback
     * Accessible: PLAYER (own feedback), ADMIN (modérer)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

