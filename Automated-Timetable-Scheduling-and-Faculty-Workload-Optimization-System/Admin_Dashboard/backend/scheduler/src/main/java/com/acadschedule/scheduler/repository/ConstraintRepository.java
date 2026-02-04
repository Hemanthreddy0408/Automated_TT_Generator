package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Constraint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConstraintRepository extends JpaRepository<Constraint, String> {
    List<Constraint> findByType(String type);
}