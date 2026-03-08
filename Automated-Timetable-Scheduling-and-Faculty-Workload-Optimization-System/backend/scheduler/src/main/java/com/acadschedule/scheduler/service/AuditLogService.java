package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AuditLogService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void logAction(String entity, String action, String description, String user) {
        AuditLog log = new AuditLog(entity, action, description, user);
        repo.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return repo.findAllByOrderByIdDesc();
    }

    /**
     * Update an audit log entry with conflict detection.
     * Conflict occurs if the database version timestamp differs from the client's version.
     * 
     * @param id The audit log ID to update
     * @param description The new description
     * @param lastModifiedTimestamp The timestamp from when the client loaded the record (for conflict detection)
     * @return A map containing:
     *         - success: boolean indicating if update was successful
     *         - hasConflict: boolean indicating if conflict was detected
     *         - message: descriptive message
     *         - data: the updated AuditLog (if successful and no conflict)
     */
    public Map<String, Object> updateAuditLogWithConflictDetection(Long id, String description, String lastModifiedTimestamp) {
        Map<String, Object> response = new HashMap<>();

        Optional<AuditLog> optionalLog = repo.findById(id);
        if (optionalLog.isEmpty()) {
            response.put("success", false);
            response.put("hasConflict", false);
            response.put("message", "Audit log not found");
            return response;
        }

        AuditLog log = optionalLog.get();

        // Conflict detection: check if the database timestamp matches the client's version
        String dbTimestamp = log.getTimestamp().format(formatter);
        
        // If timestamps don't match, a conflict has occurred (another update happened after the client loaded)
        if (lastModifiedTimestamp != null && !lastModifiedTimestamp.equals(dbTimestamp)) {
            response.put("success", false);
            response.put("hasConflict", true);
            response.put("message", "Conflict detected! This entry was modified elsewhere. Current version: " + dbTimestamp);
            response.put("currentData", log);
            return response;
        }

        // No conflict - proceed with update
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        AuditLog updated = repo.save(log);

        response.put("success", true);
        response.put("hasConflict", false);
        response.put("message", "Audit log updated successfully");
        response.put("data", updated);
        return response;
    }
}
