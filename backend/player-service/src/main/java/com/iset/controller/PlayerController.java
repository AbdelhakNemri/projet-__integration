package com.iset.controller;
import com.iset.dto.PlayerDTO;
import com.iset.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
@CrossOrigin(origins = "http://localhost:4200")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    /**
     * Health check - MUST be first!
     * Accessible: Public
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Player Service is running");
    }

    /**
     * Récupérer le profil du joueur authentifié
     * Accessible: PLAYER, OWNER, ADMIN
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<PlayerDTO> getCurrentPlayer() {
        try {
            PlayerDTO player = playerService.getCurrentPlayer();
            return ResponseEntity.ok(player);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Lister tous les joueurs actifs
     * Accessible: PLAYER, OWNER, ADMIN (pour trouver des joueurs)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllActivePlayers() {
        List<PlayerDTO> players = playerService.getAllActivePlayers();
        return ResponseEntity.ok(players);
    }

    /**
     * Récupérer un joueur par email
     * Accessible: PLAYER, OWNER, ADMIN
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<PlayerDTO> getPlayerByEmail(@PathVariable String email) {
        try {
            PlayerDTO player = playerService.getPlayerByEmail(email);
            return ResponseEntity.ok(player);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Récupérer un joueur par ID
     * Accessible: PLAYER, OWNER, ADMIN (public, mais mieux avec authentification)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Long id) {
        try {
            PlayerDTO player = playerService.getPlayerById(id);
            return ResponseEntity.ok(player);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mettre à jour le profil du joueur authentifié
     * Accessible: PLAYER, OWNER, ADMIN (pour modifier son profil)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PlayerDTO> updatePlayerProfile(
            @PathVariable Long id,
            @RequestBody PlayerDTO updates) {
        try {
            PlayerDTO updated = playerService.updatePlayerProfile(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
