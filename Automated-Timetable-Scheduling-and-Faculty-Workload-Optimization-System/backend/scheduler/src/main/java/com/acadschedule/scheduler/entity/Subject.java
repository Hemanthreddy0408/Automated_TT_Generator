package com.acadschedule.scheduler.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private String department;
    private int credits;

    private int lectureHoursPerWeek;
    private int tutorialHoursPerWeek;
    private int labHoursPerWeek;

    private boolean elective;
    private int facultyCount;

    @ElementCollection
    private List<String> eligibleFaculty = new ArrayList<>();

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public int getCredits() { return credits; }
    public int getLectureHoursPerWeek() { return lectureHoursPerWeek; }
    public int getTutorialHoursPerWeek() { return tutorialHoursPerWeek; }
    public int getLabHoursPerWeek() { return labHoursPerWeek; }
    public boolean isElective() { return elective; }
    public int getFacultyCount() { return facultyCount; }

    public void setLectureHoursPerWeek(int v) { this.lectureHoursPerWeek = v; }
    public void setTutorialHoursPerWeek(int v) { this.tutorialHoursPerWeek = v; }
    public void setLabHoursPerWeek(int v) { this.labHoursPerWeek = v; }
    public void setElective(boolean v) { this.elective = v; }
    public void setFacultyCount(int v) { this.facultyCount = v; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setDepartment(String department) { this.department = department; }
    public void setCredits(int credits) { this.credits = credits; }

    public List<String> getEligibleFaculty() { return eligibleFaculty; }
    public void setEligibleFaculty(List<String> eligibleFaculty) { this.eligibleFaculty = eligibleFaculty; }
}
