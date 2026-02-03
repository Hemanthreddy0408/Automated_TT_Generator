package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "constraints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Constraint {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Generates unique String IDs
    private String id;
    
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // institutional, faculty, room, section

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private String priority; // mandatory, preferred, optional

    @Column(columnDefinition = "TEXT")
    private String parameters; // Stored as JSON string

    
}