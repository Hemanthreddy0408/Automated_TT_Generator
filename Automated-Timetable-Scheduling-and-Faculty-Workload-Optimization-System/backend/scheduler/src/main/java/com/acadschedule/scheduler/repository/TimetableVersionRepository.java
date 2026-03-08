package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.TimetableVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimetableVersionRepository extends JpaRepository<TimetableVersion, Long> {

    Optional<TimetableVersion> findByActiveTrue();
}
