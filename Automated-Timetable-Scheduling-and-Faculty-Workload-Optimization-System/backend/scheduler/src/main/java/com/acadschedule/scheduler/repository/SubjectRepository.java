package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentAndYear(String department, int year);
}
