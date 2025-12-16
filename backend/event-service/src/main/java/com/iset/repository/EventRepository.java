package com.iset.repository;

import com.iset.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByOrganizerKeycloakId(String organizerKeycloakId);
    
    List<Event> findByStatus(String status);
    
    List<Event> findBySportType(String sportType);
    
    List<Event> findByLocation(String location);
    
    List<Event> findByIsPublicTrue();
    
    List<Event> findByEventDateAfter(LocalDateTime date);
    
    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND e.status = 'PLANNED' AND e.eventDate > :now")
    List<Event> findAvailablePublicEvents(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Event e WHERE " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.sportType) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND e.isPublic = true AND e.status = 'PLANNED'")
    List<Event> searchEvents(@Param("query") String query);
}

