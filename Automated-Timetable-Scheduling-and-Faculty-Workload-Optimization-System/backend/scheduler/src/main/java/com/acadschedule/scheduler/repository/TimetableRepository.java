package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {
    @Transactional
    void deleteBySectionId(String sectionId);

    List<TimetableEntry> findBySectionId(String sectionId);

    List<TimetableEntry> findByFacultyName(String facultyName);

    @Transactional
    void deleteByFacultyName(String facultyName);
}
