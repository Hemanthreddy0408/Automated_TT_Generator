package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "tag")
    private String tag; // Urgent, Holiday, General

    @Column(name = "tag_class")
    private String tagClass; // for frontend styling

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Announcement() {}

    public Announcement(String title, String description, String tag, String tagClass) {
        this.title = title;
        this.description = description;
        this.tag = tag;
        this.tagClass = tagClass;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getTagClass() { return tagClass; }
    public void setTagClass(String tagClass) { this.tagClass = tagClass; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
