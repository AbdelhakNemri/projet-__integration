package com.iset.repository;

import com.iset.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
    List<Feedback> findByGiverIdOrderByCreatedAtDesc(Long giverId);
}
