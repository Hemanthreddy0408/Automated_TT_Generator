package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<AuditLog> getLogs() {
        try {
            return service.getAllLogs();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Update an audit log entry with conflict detection.
     * Conflicts occur if the database version differs from the client version (lastModifiedTimestamp).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAuditLog(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        try {
            // Extract the lastModifiedTimestamp from the request for conflict detection
            String lastModifiedTimestamp = (String) updates.get("lastModifiedTimestamp");
            String description = (String) updates.get("description");

            // Call service to update with conflict detection
            Map<String, Object> result = service.updateAuditLogWithConflictDetection(id, description, lastModifiedTimestamp);

            // If conflict detected, return 409 Conflict
            if ((Boolean) result.get("hasConflict")) {
                return ResponseEntity.status(409).body(result);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
