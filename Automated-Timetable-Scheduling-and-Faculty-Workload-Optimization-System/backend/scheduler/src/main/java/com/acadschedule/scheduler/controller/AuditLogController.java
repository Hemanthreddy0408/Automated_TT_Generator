package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.service.AuditLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
