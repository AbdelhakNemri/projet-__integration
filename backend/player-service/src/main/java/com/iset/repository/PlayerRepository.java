package com.iset.repository;

import com.iset.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByEmail(String email);
    Optional<Player> findByKeycloakId(String keycloakId);
    boolean existsByEmail(String email);
    boolean existsByKeycloakId(String keycloakId);
    List<Player> findByEnabledTrue();
}
