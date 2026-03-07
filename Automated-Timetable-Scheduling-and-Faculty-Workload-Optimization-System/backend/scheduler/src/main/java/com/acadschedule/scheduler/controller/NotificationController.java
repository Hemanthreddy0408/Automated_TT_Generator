package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.dto.NotificationDTO;
import com.acadschedule.scheduler.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // For Admin
    @GetMapping("/admin")
    public ResponseEntity<Page<NotificationDTO>> getAdminNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getAdminNotifications(PageRequest.of(page, size)));
    }

    @GetMapping("/admin/unread-count")
    public ResponseEntity<Map<String, Long>> getAdminUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadAdminCount()));
    }

    @PutMapping("/admin/read-all")
    public ResponseEntity<Void> markAllAdminAsRead() {
        notificationService.markAllAdminAsRead();
        return ResponseEntity.ok().build();
    }

    // For Faculty
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<Page<NotificationDTO>> getFacultyNotifications(
            @PathVariable Long facultyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getFacultyNotifications(facultyId, PageRequest.of(page, size)));
    }

    @GetMapping("/faculty/{facultyId}/unread-count")
    public ResponseEntity<Map<String, Long>> getFacultyUnreadCount(@PathVariable Long facultyId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadFacultyCount(facultyId)));
    }

    @PutMapping("/faculty/{facultyId}/read-all")
    public ResponseEntity<Void> markAllFacultyAsRead(@PathVariable Long facultyId) {
        notificationService.markAllFacultyAsRead(facultyId);
        return ResponseEntity.ok().build();
    }

    // Generic
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
