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
    private final com.acadschedule.scheduler.repository.RoomRepository roomRepo;
    private final com.acadschedule.scheduler.repository.SubjectRepository subjectRepo;
    private final com.acadschedule.scheduler.repository.FacultyRepository facultyRepo;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AuditLogService(AuditLogRepository repo,
                           com.acadschedule.scheduler.repository.RoomRepository roomRepo,
                           com.acadschedule.scheduler.repository.SubjectRepository subjectRepo,
                           com.acadschedule.scheduler.repository.FacultyRepository facultyRepo) {
        this.repo = repo;
        this.roomRepo = roomRepo;
        this.subjectRepo = subjectRepo;
        this.facultyRepo = facultyRepo;
    }

    public void logAction(String entity, String action, String description, String user) {
        logAction(entity, action, description, user, null);
    }

    public void logAction(String entity, String action, String description, String user, Long entityId) {
        AuditLog log = new AuditLog(entity, action, description, user);
        if (entityId != null) {
            log.setEntityId(entityId);
        }
        repo.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return repo.findAllByOrderByIdDesc()
                .stream()
                .filter(log -> !"ROLLED_BACK".equals(log.getStatus()))
                .toList();
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

    public void rollbackAction(Long id) {
        AuditLog log = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if ("ROLLED_BACK".equals(log.getStatus())) {
            throw new RuntimeException("Log is already rolled back");
        }

        // Physical Rollback
        String entityType = log.getEntityType();
        String actionType = log.getActionType();
        Long entityId = log.getEntityId();

        if (entityId != null) {
            try {
                if ("ROOM".equals(entityType) && (actionType.contains("CREATE") || actionType.contains("SAVE"))) {
                    roomRepo.deleteById(entityId);
                } else if ("SUBJECT".equals(entityType) && actionType.contains("CREATE")) {
                    subjectRepo.deleteById(entityId);
                } else if ("FACULTY".equals(entityType) && actionType.contains("CREATE")) {
                    facultyRepo.deleteById(entityId);
                }
            } catch (Exception e) {
                System.out.println("Could not physically revert database record: " + e.getMessage());
            }
        }

        // Update original log status to ROLLED_BACK
        log.setStatus("ROLLED_BACK");
        repo.save(log);

        AuditLog rollbackLog = new AuditLog(
                log.getEntityType(),
                "ROLLBACK",
                "Rollback performed for log ID: " + id,
                "admin@system"
        );

        repo.save(rollbackLog);
    }

    public void undoRollback(Long id) {
        AuditLog log = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        // Only allow undoing if it is currently ROLLED_BACK
        if (!"ROLLED_BACK".equals(log.getStatus())) {
            throw new RuntimeException("Log is not rolled back, cannot undo.");
        }

        log.setStatus("ACTIVE");
        repo.save(log);

        AuditLog restoreLog = new AuditLog(
                log.getEntityType(),
                "UNDO_ROLLBACK",
                "Rollback undone for log ID: " + id,
                "admin@system"
        );

        repo.save(restoreLog);
    }
}
