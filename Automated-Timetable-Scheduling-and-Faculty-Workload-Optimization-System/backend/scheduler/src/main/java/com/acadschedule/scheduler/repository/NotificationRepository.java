package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipientRole = 'ADMIN' ORDER BY n.createdAt DESC")
    Page<Notification> findAdminNotifications(Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.recipientRole = 'FACULTY' AND n.faculty.id = :facultyId ORDER BY n.createdAt DESC")
    Page<Notification> findFacultyNotifications(@Param("facultyId") Long facultyId, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientRole = 'ADMIN' AND n.isRead = false")
    int markAllAdminNotificationsAsRead();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientRole = 'FACULTY' AND n.faculty.id = :facultyId AND n.isRead = false")
    int markAllFacultyNotificationsAsRead(@Param("facultyId") Long facultyId);

    long countByRecipientRoleAndIsReadFalse(String recipientRole);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientRole = 'FACULTY' AND n.faculty.id = :facultyId AND n.isRead = false")
    long countUnreadFacultyNotifications(@Param("facultyId") Long facultyId);
}
