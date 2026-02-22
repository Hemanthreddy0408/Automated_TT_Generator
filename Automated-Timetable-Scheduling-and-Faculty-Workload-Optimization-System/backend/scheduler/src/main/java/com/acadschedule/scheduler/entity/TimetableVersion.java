package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/*
 * ---------------------------------------------------------
 * TimetableVersion Entity
 * ---------------------------------------------------------
 * This table stores snapshots of timetable versions.
 * It helps us rollback to previous timetable.
 * ---------------------------------------------------------
 */

@Entity
@Table(name = "timetable_versions")
public class TimetableVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Version number (1,2,3...)
    private Integer versionNumber;

    // Store timetable data as JSON text
    @Lob
    @Column(columnDefinition = "TEXT")
    private String timetableData;

    // Only one version should be active
    private Boolean active;

    private LocalDateTime createdAt;

    // Getters & Setters

    public Long getId() { return id; }

    public Integer getVersionNumber() { return versionNumber; }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getTimetableData() { return timetableData; }

    public void setTimetableData(String timetableData) {
        this.timetableData = timetableData;
    }

    public Boolean getActive() { return active; }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}