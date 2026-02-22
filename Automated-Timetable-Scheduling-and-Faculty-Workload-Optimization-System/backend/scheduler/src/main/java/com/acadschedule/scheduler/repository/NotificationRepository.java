package com.acadschedule.scheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acadschedule.scheduler.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
