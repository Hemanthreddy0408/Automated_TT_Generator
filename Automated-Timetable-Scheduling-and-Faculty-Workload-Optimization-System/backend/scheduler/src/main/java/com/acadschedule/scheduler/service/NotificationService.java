package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.dto.NotificationDTO;
import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.entity.Notification;
import com.acadschedule.scheduler.repository.FacultyRepository;
import com.acadschedule.scheduler.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FacultyRepository facultyRepository;

    public NotificationService(NotificationRepository notificationRepository, FacultyRepository facultyRepository) {
        this.notificationRepository = notificationRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getAdminNotifications(Pageable pageable) {
        return notificationRepository.findAdminNotifications(pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getFacultyNotifications(Long facultyId, Pageable pageable) {
        return notificationRepository.findFacultyNotifications(facultyId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public void createAdminNotification(String title, String message, String type) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipientRole("ADMIN");
        notificationRepository.save(notification);
    }

    @Transactional
    public void createFacultyNotification(Long facultyId, String title, String message, String type) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipientRole("FACULTY");
        notification.setFaculty(faculty);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAdminAsRead() {
        notificationRepository.markAllAdminNotificationsAsRead();
    }

    @Transactional
    public void markAllFacultyAsRead(Long facultyId) {
        notificationRepository.markAllFacultyNotificationsAsRead(facultyId);
    }

    @Transactional(readOnly = true)
    public long getUnreadAdminCount() {
        return notificationRepository.countByRecipientRoleAndIsReadFalse("ADMIN");
    }

    @Transactional(readOnly = true)
    public long getUnreadFacultyCount(Long facultyId) {
        return notificationRepository.countUnreadFacultyNotifications(facultyId);
    }

    private NotificationDTO mapToDTO(Notification entity) {
        return new NotificationDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.isRead(),
                entity.getCreatedAt(),
                entity.getRecipientRole());
    }
}
