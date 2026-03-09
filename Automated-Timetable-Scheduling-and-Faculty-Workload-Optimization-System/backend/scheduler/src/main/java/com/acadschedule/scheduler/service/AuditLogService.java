package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.AuditLogRepository;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final TimetableRepository timetableRepo;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AuditLogService(AuditLogRepository repo,
            com.acadschedule.scheduler.repository.RoomRepository roomRepo,
            com.acadschedule.scheduler.repository.SubjectRepository subjectRepo,
            com.acadschedule.scheduler.repository.FacultyRepository facultyRepo,
            TimetableRepository timetableRepo,
            ObjectMapper objectMapper) {
        this.repo = repo;
        this.roomRepo = roomRepo;
        this.subjectRepo = subjectRepo;
        this.facultyRepo = facultyRepo;
        this.timetableRepo = timetableRepo;
        this.objectMapper = objectMapper;
    }

    public void logAction(String entity, String action, String description, String user) {
        logAction(entity, action, description, user, null, null);
    }

    public void logAction(String entity, String action, String description, String user, Long entityId) {
        logAction(entity, action, description, user, entityId, null);
    }

    public void logAction(String entity, String action, String description, String user, Long entityId,
            String snapshotData) {
        AuditLog log = new AuditLog(entity, action, description, user);
        if (entityId != null) {
            log.setEntityId(entityId);
        }
        if (snapshotData != null) {
            log.setSnapshotData(snapshotData);
        }
        repo.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return repo.findAllByOrderByTimestampDesc()
                .stream()
                .filter(log -> !"ROLLED_BACK".equals(log.getStatus()))
                .toList();
    }

    /**
     * Update an audit log entry with conflict detection.
     * Conflict occurs if the database version timestamp differs from the client's
     * version.
     * 
     * @param id                    The audit log ID to update
     * @param description           The new description
     * @param lastModifiedTimestamp The timestamp from when the client loaded the
     *                              record (for conflict detection)
     * @return A map containing:
     *         - success: boolean indicating if update was successful
     *         - hasConflict: boolean indicating if conflict was detected
     *         - message: descriptive message
     *         - data: the updated AuditLog (if successful and no conflict)
     */
    public Map<String, Object> updateAuditLogWithConflictDetection(Long id, String description,
            String lastModifiedTimestamp) {
        Map<String, Object> response = new HashMap<>();

        Optional<AuditLog> optionalLog = repo.findById(id);
        if (optionalLog.isEmpty()) {
            response.put("success", false);
            response.put("hasConflict", false);
            response.put("message", "Audit log not found");
            return response;
        }

        AuditLog log = optionalLog.get();

        // Conflict detection: check if the database timestamp matches the client's
        // version
        String dbTimestamp = log.getTimestamp().format(formatter);

        // If timestamps don't match, a conflict has occurred (another update happened
        // after the client loaded)
        if (lastModifiedTimestamp != null && !lastModifiedTimestamp.equals(dbTimestamp)) {
            response.put("success", false);
            response.put("hasConflict", true);
            response.put("message",
                    "Conflict detected! This entry was modified elsewhere. Current version: " + dbTimestamp);
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

    @Transactional
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
        String snapshotData = log.getSnapshotData();

        if ("TIMETABLE".equals(entityType) && snapshotData != null) {
            try {
                if ("GENERATE_ALL".equals(actionType) || "LEAVE_OPTIMIZE".equals(actionType)) {
                    timetableRepo.deleteAll();
                } else if ("GENERATE".equals(actionType)) {
                    // Try to extract section ID from description
                    // Format: Generated timetable for Section ID: {id}
                    String desc = log.getDescription();
                    String secIdStr = desc.replace("Generated timetable for Section ID: ", "").trim();
                    timetableRepo.deleteBySectionId(secIdStr);
                }

                // Restore snapshot
                List<TimetableEntry> oldEntries = objectMapper.readValue(
                        snapshotData, new TypeReference<List<TimetableEntry>>() {
                        });

                // Clear IDs so they are inserted as fresh records and avoid detached entity
                // errors
                oldEntries.forEach(e -> e.setId(null));

                timetableRepo.saveAll(oldEntries);
            } catch (Exception e) {
                throw new RuntimeException("Failed to restore timetable snapshot: " + e.getMessage(), e);
            }
        } else if (entityId != null) {
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
                "admin@system");

        repo.save(rollbackLog);
    }

    @Transactional
    public void undoRollback(Long rollbackLogId) {
        AuditLog rollbackLog = repo.findById(rollbackLogId)
                .orElseThrow(() -> new RuntimeException("Rollback log not found"));

        if (!"ROLLBACK".equals(rollbackLog.getActionType())) {
            throw new RuntimeException("Selected log is not a ROLLBACK action. Cannot undo.");
        }

        // Check if this specific rollback log was already undone
        if ("UNDONE".equals(rollbackLog.getStatus())) {
            // Already undone, just return
            return;
        }

        // Extract original log ID from description: "Rollback performed for log ID:
        // {id}"
        String desc = rollbackLog.getDescription();
        String idStr = desc.replace("Rollback performed for log ID:", "").trim();
        Long originalLogId = Long.parseLong(idStr);

        AuditLog originalLog = repo.findById(originalLogId)
                .orElseThrow(() -> new RuntimeException("Original log not found"));

        if (!"ROLLED_BACK".equals(originalLog.getStatus()) && !"ACTIVE".equals(originalLog.getStatus())) {
            throw new RuntimeException(
                    "Expected the original log to be rolled back, but it is in state: " + originalLog.getStatus());
        }

        // Return original log to ACTIVE if it's currently ROLLED_BACK
        if ("ROLLED_BACK".equals(originalLog.getStatus())) {
            originalLog.setStatus("ACTIVE");
            repo.save(originalLog);
        }

        AuditLog restoreLog = new AuditLog(
                originalLog.getEntityType(),
                "UNDO_ROLLBACK",
                "Rollback undone for log ID: " + originalLogId,
                "admin@system");

        repo.save(restoreLog);

        // Mark the rollback log itself as undone so we don't undo it twice
        rollbackLog.setStatus("UNDONE");
        repo.save(rollbackLog);
    }
}
