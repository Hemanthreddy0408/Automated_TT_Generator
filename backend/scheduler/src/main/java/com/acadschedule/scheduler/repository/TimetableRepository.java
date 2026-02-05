package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    @Modifying
    @Transactional
    void deleteBySectionId(String sectionId);

    List<TimetableEntry> findBySectionId(String sectionId);

    boolean existsByFacultyNameAndDayAndTimeSlot(
        String facultyName, String day, String timeSlot
    );

    boolean existsByRoomNumberAndDayAndTimeSlot(
        String roomNumber, String day, String timeSlot
    );

    boolean existsBySectionIdAndDayAndTimeSlot(
        String sectionId, String day, String timeSlot
    );
}

