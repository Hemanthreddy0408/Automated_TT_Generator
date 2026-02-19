package com.acadschedule.scheduler.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.repository.AuditLogRepository;

@Service
public class ConstraintService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void optimizeTimetable() {

        // ------------------------------
        // EXISTING OPTIMIZATION LOGIC
        // ------------------------------
        // ------------------------------
        // ADD THIS LOGGING CODE
        // ------------------------------
        AuditLog log = new AuditLog();
        log.setActionType("OPTIMIZED");
        log.setEntityType("TIMETABLE");
        log.setDescription("Timetable optimized successfully");
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}
