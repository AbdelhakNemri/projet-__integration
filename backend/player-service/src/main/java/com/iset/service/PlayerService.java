package com.iset.service;

import com.iset.dto.PlayerDTO;
import com.iset.entity.Player;
import com.iset.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    /**
     * Créer ou mettre à jour un joueur depuis Keycloak
     */
    public PlayerDTO registerOrUpdatePlayer(String keycloakId, String email, String nom, String prenom) {
        Optional<Player> existing = playerRepository.findByKeycloakId(keycloakId);
        
        Player player;
        if (existing.isPresent()) {
            player = existing.get();
            player.setEmail(email);
            player.setNom(nom);
            player.setPrenom(prenom);
            player.setUpdatedAt(LocalDateTime.now());
        } else {
            player = new Player();
            player.setKeycloakId(keycloakId);
            player.setEmail(email);
            player.setNom(nom);
            player.setPrenom(prenom);
        }
        
        Player saved = playerRepository.save(player);
        return mapToDTO(saved);
    }

    /**
     * Récupérer le profil du joueur authentifié
     * Auto-crée si n'existe pas
     */
    public PlayerDTO getCurrentPlayer() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String keycloakId = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        
        // Auto-créer le joueur s'il n'existe pas
        Optional<Player> existing = playerRepository.findByKeycloakId(keycloakId);
        if (existing.isEmpty()) {
            Player newPlayer = new Player();
            newPlayer.setKeycloakId(keycloakId);
            newPlayer.setEmail(email);
            newPlayer.setNom(lastName != null ? lastName : "");
            newPlayer.setPrenom(firstName != null ? firstName : "");
            newPlayer.setEnabled(true);
            playerRepository.save(newPlayer);
        }
        
        Player player = playerRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé"));
        
        return mapToDTO(player);
    }

    /**
     * Récupérer un joueur par ID
     */
    public PlayerDTO getPlayerById(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé: " + id));
        
        return mapToDTO(player);
    }

    /**
     * Récupérer un joueur par email
     */
    public PlayerDTO getPlayerByEmail(String email) {
        Player player = playerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé: " + email));
        
        return mapToDTO(player);
    }

    /**
     * Récupérer un joueur par Keycloak ID
     */
    public PlayerDTO getPlayerByKeycloakId(String keycloakId) {
        Player player = playerRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé"));
        
        return mapToDTO(player);
    }

    /**
     * Lister tous les joueurs actifs
     */
    public List<PlayerDTO> getAllActivePlayers() {
        return playerRepository.findByEnabledTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mettre à jour le profil du joueur
     */
    public PlayerDTO updatePlayerProfile(Long id, PlayerDTO updates) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joueur non trouvé: " + id));

        if (updates.getNom() != null) player.setNom(updates.getNom());
        if (updates.getPrenom() != null) player.setPrenom(updates.getPrenom());
        if (updates.getPoste() != null) player.setPoste(updates.getPoste());
        if (updates.getPhoto() != null) player.setPhoto(updates.getPhoto());
        if (updates.getTel() != null) player.setTel(updates.getTel());
        if (updates.getBio() != null) player.setBio(updates.getBio());

        player.setUpdatedAt(LocalDateTime.now());
        Player updated = playerRepository.save(player);
        
        return mapToDTO(updated);
    }

    /**
     * Convertir Player en PlayerDTO
     */
    private PlayerDTO mapToDTO(Player player) {
        return new PlayerDTO(
                player.getId(),
                player.getKeycloakId(),
                player.getEmail(),
                player.getNom(),
                player.getPrenom(),
                player.getPoste(),
                player.getPhoto(),
                player.getTel(),
                player.getBio(),
                player.getCreatedAt(),
                player.getUpdatedAt(),
                player.getEnabled()
        );
    }
}
