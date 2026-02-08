package com.acadschedule.scheduler.dto;

public class SectionRequest {

    private String sectionName;
    private String department;
    private String academicBatch;
    private int maxCapacity;
    private Long mentorId;

    // getters and setters

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAcademicBatch() {
        return academicBatch;
    }

    public void setAcademicBatch(String academicBatch) {
        this.academicBatch = academicBatch;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }
}
