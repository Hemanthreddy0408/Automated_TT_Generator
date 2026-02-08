package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;

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
}
