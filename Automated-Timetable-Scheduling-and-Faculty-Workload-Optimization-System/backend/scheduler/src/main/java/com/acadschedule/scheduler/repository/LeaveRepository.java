package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByFacultyId(Long facultyId);
    
    @Transactional
    void deleteByFacultyId(Long facultyId);
}
