package com.iset.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iset.dto.*;
import com.iset.entity.Notification;
import com.iset.entity.NotificationType;
import com.iset.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String currentUserId() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getClaimAsString("sub");
    }

    private String currentUserEmail() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getClaimAsString("email");
    }

    /**
     * Generic notification creation
     */
    @Transactional
    public NotificationDTO createNotification(CreateNotificationRequest request) {
        if (request.getRecipientKeycloakId() == null) {
            throw new RuntimeException("Recipient is required");
        }

        Notification notification = new Notification();
        notification.setRecipientKeycloakId(request.getRecipientKeycloakId());
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setType(request.getType() != null ? request.getType() : NotificationType.INTERNAL);
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setSource(request.getSource() != null ? request.getSource() : "notification-service");
        notification.setMetadata(request.getMetadata());
        notification.setCreatedAt(LocalDateTime.now());

        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }

    /**
     * US18: Notification when player is accepted to an event
     */
    @Transactional
    public NotificationDTO notifyPlayerAccepted(PlayerAcceptedNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientKeycloakId(request.getPlayerKeycloakId());
        notification.setRecipientEmail(request.getPlayerEmail());
        notification.setType(NotificationType.PLAYER_ACCEPTED);
        notification.setTitle(String.format("Invitation accepted for %s", request.getEventTitle()));
        notification.setMessage(request.getMessage() != null ? request.getMessage() :
                String.format("You have been accepted to the event \"%s\".", request.getEventTitle()));
        notification.setSource("event-service");
        notification.setMetadata(toJson(request));
        notification.setCreatedAt(LocalDateTime.now());

        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }

    /**
     * US19: Notification when a field is reserved
     */
    @Transactional
    public NotificationDTO notifyFieldReserved(FieldReservedNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientKeycloakId(request.getOwnerKeycloakId());
        notification.setRecipientEmail(request.getOwnerEmail());
        notification.setType(NotificationType.FIELD_RESERVED);
        notification.setTitle("Your field has been reserved");
        notification.setMessage(request.getMessage() != null ? request.getMessage() :
                String.format("Field \"%s\" has been reserved for %s.", request.getFieldName(),
                        request.getReservationDate()));
        notification.setSource("field-service");
        notification.setMetadata(toJson(request));
        notification.setCreatedAt(LocalDateTime.now());

        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }

    /**
     * In-app notifications for current user
     */
    public List<NotificationDTO> getMyNotifications() {
        String userId = currentUserId();
        return notificationRepository.findByRecipientKeycloakIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Unread count for bell badges
     */
    public Long countUnread() {
        return notificationRepository.countByRecipientKeycloakIdAndReadIsFalse(currentUserId());
    }

    /**
     * Mark specific notification as read
     */
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientKeycloakId().equals(currentUserId())) {
            throw new RuntimeException("Not allowed to update this notification");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }

    /**
     * Mark all notifications for user as read
     */
    @Transactional
    public void markAllAsRead() {
        List<Notification> notifications = notificationRepository
                .findByRecipientKeycloakIdOrderByCreatedAtDesc(currentUserId());

        notifications.forEach(notification -> {
            if (!Boolean.TRUE.equals(notification.getRead())) {
                notification.setRead(true);
                notification.setReadAt(LocalDateTime.now());
            }
        });

        notificationRepository.saveAll(notifications);
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientKeycloakId().equals(currentUserId())) {
            throw new RuntimeException("Not allowed to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    private NotificationDTO toDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getRecipientKeycloakId(),
                notification.getRecipientEmail(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getSource(),
                notification.getRead(),
                notification.getReadAt(),
                notification.getMetadata(),
                notification.getCreatedAt()
        );
    }

    private String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

