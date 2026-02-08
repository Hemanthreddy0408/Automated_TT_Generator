package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    // ✅ Used to clear old timetable
    @Modifying
    @Transactional
    @Query("DELETE FROM TimetableEntry t WHERE t.sectionId = :sectionId")
    void deleteBySectionId(@Param("sectionId") String sectionId);

    // ✅ Used for rendering timetable
    List<TimetableEntry> findBySectionId(String sectionId);

    // ✅ Hard constraints
    boolean existsByFacultyNameAndDayAndTimeSlot(
            String facultyName, String day, String timeSlot);

    boolean existsByRoomNumberAndDayAndTimeSlot(
            String roomNumber, String day, String timeSlot);

    boolean existsBySectionIdAndDayAndTimeSlot(
            String sectionId, String day, String timeSlot);
}
