package com.acadschedule.scheduler.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) // 🔴 CRITICAL FIX
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String department;
    private String designation;
    private String employeeId;

    private int maxHoursPerDay;
    private int maxHoursPerWeek;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> qualifications;

    private String specialization;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> eligibleSubjects;

    private boolean active;

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
    public void setMaxHoursPerDay(int maxHoursPerDay) {
        this.maxHoursPerDay = maxHoursPerDay;
    }

    public int getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(int maxHoursPerWeek) {
        this.maxHoursPerWeek = maxHoursPerWeek;
    }

    public List<String> getQualifications() { return qualifications; }
    public void setQualifications(List<String> qualifications) {
        this.qualifications = qualifications;
    }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public List<String> getEligibleSubjects() { return eligibleSubjects; }
    public void setEligibleSubjects(List<String> eligibleSubjects) {
        this.eligibleSubjects = eligibleSubjects;
    }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
