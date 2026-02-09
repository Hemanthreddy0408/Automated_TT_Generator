package com.acadschedule.scheduler.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "timetable_entries")
public class TimetableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ MUST MATCH Section.id (UUID String)
    @Column(nullable = false)
    private String sectionId;

    @Column(name = "day")
    private String day;

    @Column(name = "time_slot")
    private String timeSlot;

    @Column(name = "subject_code")
    private String subjectCode;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "faculty_name")
    private String facultyName;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "type")
    private String type; // LECTURE / LAB / BREAK / LUNCH

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
