package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM TimetableEntry t WHERE t.sectionId = :sectionId")
    void deleteBySectionId(@Param("sectionId") String sectionId);

    boolean existsBySectionIdAndDayAndTimeSlot(
            String sectionId, String day, String timeSlot);

    boolean existsByFacultyNameAndDayAndTimeSlot(
            String facultyName, String day, String timeSlot);

    boolean existsByRoomNumberAndDayAndTimeSlot(
            String roomNumber, String day, String timeSlot);

    List<TimetableEntry> findBySectionId(String sectionId);
}
