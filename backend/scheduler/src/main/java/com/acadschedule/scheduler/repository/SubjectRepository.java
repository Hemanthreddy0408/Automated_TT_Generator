package com.acadschedule.scheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.acadschedule.scheduler.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
