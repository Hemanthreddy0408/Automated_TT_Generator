package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "\"constraints\"")
public class Constraint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @Column(name = "description")
    private String description;

    @Column(name = "active")
    private boolean active = true;

    @Column(name = "priority")
    private String priority;

    @Column(name = "parameters")
    private String parameters;

    public boolean isActive() {
        return active;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public void setActive(boolean active) { this.active = active; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }
}
