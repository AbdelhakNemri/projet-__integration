package com.iset.repository;

import com.iset.entity.EventRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRatingRepository extends JpaRepository<EventRating, Long> {
    
    List<EventRating> findByEventId(Long eventId);
    
    List<EventRating> findByRaterKeycloakId(String raterKeycloakId);
    
    Optional<EventRating> findByEventIdAndRaterKeycloakId(Long eventId, String raterKeycloakId);
    
    @Query("SELECT AVG(r.rating) FROM EventRating r WHERE r.event.id = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT COUNT(r) FROM EventRating r WHERE r.event.id = :eventId")
    Integer getRatingCountByEventId(@Param("eventId") Long eventId);
    
    boolean existsByEventIdAndRaterKeycloakId(Long eventId, String raterKeycloakId);
}

