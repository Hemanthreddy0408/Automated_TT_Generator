package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    // Find entries for a section (used by frontend)
    List<TimetableEntry> findBySectionId(String sectionId);

    // Delete entries for a section (used when committing regeneration)
    void deleteBySectionId(String sectionId);

    // Check existence helpers used by scheduler (derives column names from TimetableEntry fields)
    boolean existsBySectionIdAndDayAndTimeSlot(String sectionId, String day, String timeSlot);

    boolean existsByFacultyNameAndDayAndTimeSlot(String facultyName, String day, String timeSlot);

    boolean existsByRoomNumberAndDayAndTimeSlot(String roomNumber, String day, String timeSlot);

    // Find all entries for a subject (used for elective alignment)
    List<TimetableEntry> findBySubjectCode(String subjectCode);


    // Count occurrences of a subject for a section on a specific day (used to limit multiple same-subject per day)
    @Query("SELECT COUNT(t) FROM TimetableEntry t WHERE t.sectionId = :sectionId AND t.day = :day AND t.subjectCode = :subjectCode")
    long countSubjectPerDay(String sectionId, String day, String subjectCode);

    // Find by Faculty Name
    List<TimetableEntry> findByFacultyName(String facultyName);

    // ✅ Robust search: case insensitive + partial match (LIKE)
    @Query("SELECT t FROM TimetableEntry t WHERE LOWER(t.facultyName) LIKE LOWER(CONCAT('%', :facultyName, '%'))")
    List<TimetableEntry> findByFacultyNameIgnoreCase(String facultyName);

}
