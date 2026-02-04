package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    private int semester;
    private int year;
    private int strength;

    @ElementCollection
    @CollectionTable(
        name = "section_subjects",
        joinColumns = @JoinColumn(name = "section_id")
    )
    @Column(name = "subject")
    private List<String> subjects;

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getStrength() { return strength; }
    public void setStrength(int strength) { this.strength = strength; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }
}
