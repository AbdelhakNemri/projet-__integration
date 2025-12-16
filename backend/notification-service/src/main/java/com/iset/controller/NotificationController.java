package com.iset.controller;

import com.iset.dto.*;
import com.iset.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Notification Service is running");
    }

    /**
     * Create general notification (internal use between services)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody CreateNotificationRequest request) {
        try {
            NotificationDTO notification = notificationService.createNotification(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US18: Player accepted notification
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/player-accepted")
    public ResponseEntity<NotificationDTO> notifyPlayerAccepted(
            @RequestBody PlayerAcceptedNotificationRequest request) {
        try {
            NotificationDTO notification = notificationService.notifyPlayerAccepted(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * US19: Field reserved notification
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PostMapping("/field-reserved")
    public ResponseEntity<NotificationDTO> notifyFieldReserved(
            @RequestBody FieldReservedNotificationRequest request) {
        try {
            NotificationDTO notification = notificationService.notifyFieldReserved(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get notifications for current user
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        try {
            return ResponseEntity.ok(notificationService.getMyNotifications());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Unread count for badge
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/unread-count")
    public ResponseEntity<java.util.Map<String, Long>> countUnread() {
        try {
            Long count = notificationService.countUnread();
            return ResponseEntity.ok(java.util.Map.of("count", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Mark notification as read
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(notificationService.markAsRead(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Mark all notifications as read
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a notification
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
