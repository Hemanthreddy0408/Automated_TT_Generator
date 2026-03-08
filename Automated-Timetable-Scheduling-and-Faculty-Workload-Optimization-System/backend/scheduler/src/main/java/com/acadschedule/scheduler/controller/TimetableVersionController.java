package com.acadschedule.scheduler.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acadschedule.scheduler.entity.AuditLog;
import com.acadschedule.scheduler.entity.TimetableVersion;
import com.acadschedule.scheduler.repository.AuditLogRepository;
import com.acadschedule.scheduler.repository.TimetableVersionRepository;

/*
 * ---------------------------------------------------------
 * Rollback Controller
 * ---------------------------------------------------------
 * Allows admin to rollback to previous timetable version.
 * ---------------------------------------------------------
 */
@RestController
@RequestMapping("/api/version")
@CrossOrigin(origins = "*")
public class TimetableVersionController {

    @Autowired
    private TimetableVersionRepository versionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @PostMapping("/rollback/{id}")
    public String rollback(@PathVariable Long id) {

        // Deactivate current active version
        versionRepository.findByActiveTrue().ifPresent(v -> {
            v.setActive(false);
            versionRepository.save(v);
        });

        // Activate selected version
        TimetableVersion selected = versionRepository.findById(id).orElseThrow();
        selected.setActive(true);
        versionRepository.save(selected);

        // Save rollback in audit log
        AuditLog log = new AuditLog();
        log.setActionType("ROLLBACK");
        log.setEntityType("TIMETABLE");
        log.setDescription("Rolled back to version " + selected.getVersionNumber());
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);

        return "Rollback Successful";
    }
}
