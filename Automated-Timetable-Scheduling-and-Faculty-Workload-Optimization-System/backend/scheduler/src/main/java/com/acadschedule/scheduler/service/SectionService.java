package com.acadschedule.scheduler.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.repository.AuditLogRepository;

@Service
public class SectionService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    // Your existing timetable generation method
    public void generateTimetable() {

        // ------------------------------
        // EXISTING TIMETABLE LOGIC HERE
        // ------------------------------
        // ------------------------------
        // ADD THIS LOGGING CODE
        // ------------------------------
        AuditLog log = new AuditLog();
        log.setActionType("GENERATED");
        log.setEntityType("TIMETABLE");
        log.setDescription("New timetable generated successfully");
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}
