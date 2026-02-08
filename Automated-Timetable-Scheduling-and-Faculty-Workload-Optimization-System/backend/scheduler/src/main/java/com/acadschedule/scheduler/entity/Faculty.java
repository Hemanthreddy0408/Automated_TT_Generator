package com.acadschedule.scheduler.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "faculty")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "department")
    private String department;

    @Column(name = "designation")
    private String designation;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "max_hours_per_day")
    private int maxHoursPerDay;

    @Column(name = "max_hours_per_week")
    private int maxHoursPerWeek;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "active")
    private boolean active;

    @ElementCollection
    @CollectionTable(name = "faculty_qualifications", joinColumns = @JoinColumn(name = "faculty_id"))
    @Column(name = "qualifications")
    private List<String> qualifications = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "faculty_eligible_subjects", joinColumns = @JoinColumn(name = "faculty_id"))
    @Column(name = "eligible_subjects")
    private List<String> eligibleSubjects = new ArrayList<>();

    // ===== Getters & Setters =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public int getMaxHoursPerDay() { return maxHoursPerDay; }
    public void setMaxHoursPerDay(int maxHoursPerDay) { this.maxHoursPerDay = maxHoursPerDay; }

    public int getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(int maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<String> getQualifications() { return qualifications; }
    public void setQualifications(List<String> qualifications) { this.qualifications = qualifications; }

    public List<String> getEligibleSubjects() { return eligibleSubjects; }
    public void setEligibleSubjects(List<String> eligibleSubjects) { this.eligibleSubjects = eligibleSubjects; }
}
