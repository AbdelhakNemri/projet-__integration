package com.iset.repository;

import com.iset.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientKeycloakIdOrderByCreatedAtDesc(String recipientKeycloakId);

    Long countByRecipientKeycloakIdAndReadIsFalse(String recipientKeycloakId);
}

