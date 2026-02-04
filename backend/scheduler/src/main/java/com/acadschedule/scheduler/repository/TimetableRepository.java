package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    // ✅ Used to clear old timetable
    void deleteBySectionId(Long sectionId);

    // ✅ Used for rendering timetable
    List<TimetableEntry> findAllBySectionId(Long sectionId);

    // ✅ Hard constraints
    boolean existsByFacultyNameAndDayAndTimeSlot(
            String facultyName,
            String day,
            String timeSlot
    );

    boolean existsByRoomNumberAndDayAndTimeSlot(
            String roomNumber,
            String day,
            String timeSlot
    );
}
