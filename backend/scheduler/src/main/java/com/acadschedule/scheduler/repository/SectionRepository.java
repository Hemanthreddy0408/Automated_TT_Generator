package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, String> {
}
