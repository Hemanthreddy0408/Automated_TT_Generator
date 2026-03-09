package com.acadschedule.scheduler.dto;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class FacultyAnalyticsDTO {
    private String facultyName;
    private Set<String> subjectsAssigned;
    private Set<String> sectionsTeaching;
    private int weeklyWorkload;
    private Map<String, List<DayScheduleDTO>> dailySchedule; // e.g {"MONDAY": [{time: "09:00", subject: "CSE312",
                                                             // section: "CSE A"}, ...]}

    // Constructors, Getters, and Setters
    public FacultyAnalyticsDTO() {
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public Set<String> getSubjectsAssigned() {
        return subjectsAssigned;
    }

    public void setSubjectsAssigned(Set<String> subjectsAssigned) {
        this.subjectsAssigned = subjectsAssigned;
    }

    public Set<String> getSectionsTeaching() {
        return sectionsTeaching;
    }

    public void setSectionsTeaching(Set<String> sectionsTeaching) {
        this.sectionsTeaching = sectionsTeaching;
    }

    public int getWeeklyWorkload() {
        return weeklyWorkload;
    }

    public void setWeeklyWorkload(int weeklyWorkload) {
        this.weeklyWorkload = weeklyWorkload;
    }

    public Map<String, List<DayScheduleDTO>> getDailySchedule() {
        return dailySchedule;
    }

    public void setDailySchedule(Map<String, List<DayScheduleDTO>> dailySchedule) {
        this.dailySchedule = dailySchedule;
    }

    public static class DayScheduleDTO {
        private String timeSlot;
        private String subjectCode;
        private String sectionName;
        private String roomNumber;

        public DayScheduleDTO() {
        }

        public DayScheduleDTO(String timeSlot, String subjectCode, String sectionName, String roomNumber) {
            this.timeSlot = timeSlot;
            this.subjectCode = subjectCode;
            this.sectionName = sectionName;
            this.roomNumber = roomNumber;
        }

        public String getTimeSlot() {
            return timeSlot;
        }

        public void setTimeSlot(String timeSlot) {
            this.timeSlot = timeSlot;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getSectionName() {
            return sectionName;
        }

        public void setSectionName(String sectionName) {
            this.sectionName = sectionName;
        }

        public String getRoomNumber() {
            return roomNumber;
        }

        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }
    }
}
