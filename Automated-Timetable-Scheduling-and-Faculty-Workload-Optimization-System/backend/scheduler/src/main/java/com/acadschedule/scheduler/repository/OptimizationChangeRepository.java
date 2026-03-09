package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.OptimizationChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationChangeRepository extends JpaRepository<OptimizationChange, Long> {
    List<OptimizationChange> findAllByOrderByTimestampDesc();
}
