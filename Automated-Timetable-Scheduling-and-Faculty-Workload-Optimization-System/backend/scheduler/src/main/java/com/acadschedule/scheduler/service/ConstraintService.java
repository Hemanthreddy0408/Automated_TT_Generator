package com.acadschedule.scheduler.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.entity.Notification;
import com.acadschedule.scheduler.repository.AuditLogRepository;
import com.acadschedule.scheduler.repository.NotificationRepository;

/*
 * ---------------------------------------------------------
 * ConstraintService
 * ---------------------------------------------------------
 * This service handles timetable optimization logic.
 *
 * After optimization:
 * 1. Save audit log (OPTIMIZED)
 * 2. Save notification for users
 * ---------------------------------------------------------
 */
@Service
public class ConstraintService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    /*
     * ---------------------------------------------------------
     * Optimize Timetable Method
     * ---------------------------------------------------------
     * This method runs timetable optimization.
     * After optimization completes:
     * - It logs the action in AuditLog table
     * - It creates a notification entry
     * ---------------------------------------------------------
     */
    public void optimizeTimetable() {

        // -------------------------------------------------
        // EXISTING OPTIMIZATION LOGIC GOES HERE
        // -------------------------------------------------
        // Example:
        // applyConstraints();
        // adjustFacultyLoad();
        // resolveConflicts();
        // -------------------------------------------------
        // -------------------------------------------------
        // 1️⃣ SAVE AUDIT LOG
        // -------------------------------------------------
        AuditLog log = new AuditLog();
        log.setActionType("OPTIMIZED");
        log.setEntityType("TIMETABLE");
        log.setDescription("Timetable optimized successfully");
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);

        // -------------------------------------------------
        // 2️⃣ SAVE NOTIFICATION
        // -------------------------------------------------
        Notification notification = new Notification();
        notification.setMessage("Timetable has been optimized. Please review the changes.");
        notification.setCreatedAt(LocalDateTime.now());
        notification.setReadStatus(false);

        notificationRepository.save(notification);
    }
}
