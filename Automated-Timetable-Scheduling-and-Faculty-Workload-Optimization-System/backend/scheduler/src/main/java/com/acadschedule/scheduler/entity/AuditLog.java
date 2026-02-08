package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "timestamp")
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String entityType, String actionType, String description, String userEmail) {
        this.entityType = entityType;
        this.actionType = actionType;
        this.description = description;
        this.userEmail = userEmail;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public String getActionType() { return actionType; }
    public String getEntityType() { return entityType; }
    public String getDescription() { return description; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public void setDescription(String description) { this.description = description; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
