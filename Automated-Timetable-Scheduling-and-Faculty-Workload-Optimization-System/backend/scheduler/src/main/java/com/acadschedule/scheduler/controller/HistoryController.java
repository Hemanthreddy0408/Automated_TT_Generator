package com.acadschedule.scheduler.controller;

// Import AuditLog entity (represents audit_logs table)
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.repository.AuditLogRepository;

@RestController // Marks this class as REST API controller
@RequestMapping("/api/history") // Base URL path
@CrossOrigin(origins = "*") // Allows frontend to access this API
public class HistoryController {

    // Inject AuditLogRepository to interact with database
    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/{date}")
    public List<AuditLog> getLogsByDate(@PathVariable String date) {

        // Convert String date to LocalDate
        LocalDate localDate = LocalDate.parse(date);

        // Start of the day (00:00:00)
        LocalDateTime start = localDate.atStartOfDay();

        // End of the day (23:59:59)
        LocalDateTime end = localDate.atTime(23, 59, 59);

        // Fetch logs between start and end time
        return auditLogRepository.findByTimestampBetween(start, end);
    }
}
