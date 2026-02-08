package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Constraint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConstraintRepository extends JpaRepository<Constraint, String> {
}
