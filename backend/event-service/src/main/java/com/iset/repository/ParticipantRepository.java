package com.iset.repository;

import com.iset.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    
    List<Participant> findByEventId(Long eventId);
    
    List<Participant> findByPlayerKeycloakId(String playerKeycloakId);
    
    List<Participant> findByEventIdAndStatus(Long eventId, String status);
    
    Optional<Participant> findByEventIdAndPlayerKeycloakId(Long eventId, String playerKeycloakId);
    
    @Query("SELECT COUNT(p) FROM Participant p WHERE p.event.id = :eventId AND p.status = 'ACCEPTED'")
    Integer countAcceptedParticipantsByEventId(@Param("eventId") Long eventId);
    
    boolean existsByEventIdAndPlayerKeycloakId(Long eventId, String playerKeycloakId);
}

