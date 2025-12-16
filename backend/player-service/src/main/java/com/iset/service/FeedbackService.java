package com.iset.service;
import com.iset.dto.FeedbackDTO;
import com.iset.entity.Feedback;
import com.iset.entity.Player;
import com.iset.repository.FeedbackRepository;
import com.iset.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PlayerRepository playerRepository;

    /**
     * Ajouter un feedback pour un joueur
     */
    public FeedbackDTO addFeedback(Long playerId, String content, int rating) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String giverId = jwt.getClaimAsString("sub");
        String giverEmail = jwt.getClaimAsString("email");

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé: " + playerId));

        Feedback feedback = new Feedback();
        feedback.setPlayer(player);
        feedback.setGiverId(Long.parseLong(giverId));
        feedback.setGiverEmail(giverEmail);
        feedback.setContent(content);
        feedback.setRating(rating);

        Feedback saved = feedbackRepository.save(feedback);
        return mapToDTO(saved);
    }

    /**
     * Récupérer tous les feedbacks d'un joueur
     */
    public List<FeedbackDTO> getFeedbacksByPlayerId(Long playerId) {
        return feedbackRepository.findByPlayerIdOrderByCreatedAtDesc(playerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer tous les feedbacks donnés par un joueur
     */
    public List<FeedbackDTO> getFeedbacksByGiverId(Long giverId) {
        return feedbackRepository.findByGiverIdOrderByCreatedAtDesc(giverId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calculer la note moyenne d'un joueur
     */
    public double getAverageRating(Long playerId) {
        List<Feedback> feedbacks = feedbackRepository.findByPlayerIdOrderByCreatedAtDesc(playerId);
        
        if (feedbacks.isEmpty()) {
            return 0.0;
        }
        
        double average = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        
        return Math.round(average * 100.0) / 100.0;
    }

    /**
     * Récupérer un feedback par ID
     */
    public FeedbackDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback non trouvé: " + id));
        
        return mapToDTO(feedback);
    }

    /**
     * Supprimer un feedback (avec vérification de propriété)
     */
    public void deleteFeedback(Long feedbackId) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String keycloakId = jwt.getClaimAsString("sub");
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback non trouvé: " + feedbackId));

        // Vérifier que le feedback appartient à l'utilisateur authentifié
        if (!feedback.getGiverId().equals(Long.parseLong(keycloakId))) {
            throw new RuntimeException("Non autorisé à supprimer ce feedback");
        }

        feedbackRepository.delete(feedback);
    }

    /**
     * Convertir Feedback en FeedbackDTO
     */
    private FeedbackDTO mapToDTO(Feedback feedback) {
        return new FeedbackDTO(
                feedback.getId(),
                feedback.getPlayer().getId(),
                feedback.getGiverId(),
                feedback.getGiverEmail(),
                feedback.getContent(),
                feedback.getRating(),
                feedback.getCreatedAt()
        );
    }
}
