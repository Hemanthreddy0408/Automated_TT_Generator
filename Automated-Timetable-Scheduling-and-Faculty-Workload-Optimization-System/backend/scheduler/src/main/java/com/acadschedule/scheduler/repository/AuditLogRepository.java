package com.acadschedule.scheduler.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acadschedule.scheduler.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
    Page<AuditLog> findByStatusNotOrderByTimestampDesc(String status, Pageable pageable);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
