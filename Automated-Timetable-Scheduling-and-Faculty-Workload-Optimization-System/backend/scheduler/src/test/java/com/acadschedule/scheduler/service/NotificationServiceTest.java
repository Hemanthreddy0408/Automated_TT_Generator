package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for NotificationService.
 *
 * Actual service API:
 * createAdminNotification(title, message, type) → void
 * createFacultyNotification(facultyId, title, message, type) → void
 * getAdminNotifications(Pageable) → Page<NotificationDTO>
 * getFacultyNotifications(Long, Pageable) → Page<NotificationDTO>
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepo;
    @Mock
    private FacultyRepository facultyRepo;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("createAdminNotification saves a notification with ADMIN recipient role")
    void createAdminNotification() {
        when(notificationRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.createAdminNotification(
                "Timetable Generated",
                "Master timetable has been generated.",
                "TIMETABLE_MASTER_GENERATED");

        verify(notificationRepo).save(argThat(n ->
                "Timetable Generated".equals(n.getTitle())
                && "ADMIN".equals(n.getRecipientRole())));
    }

    @Test
    @DisplayName("createFacultyNotification saves a notification with FACULTY recipient role")
    void createFacultyNotification() {
        Faculty faculty = new Faculty();
        faculty.setId(1L);
        faculty.setName("Dr. Smith");

        when(facultyRepo.findById(1L)).thenReturn(java.util.Optional.of(faculty));
        when(notificationRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.createFacultyNotification(
                1L,
                "Timetable Updated",
                "Your timetable has been updated.",
                "TIMETABLE_UPDATED");

        verify(notificationRepo).save(argThat(n -> "FACULTY".equals(n.getRecipientRole())
                && faculty.equals(n.getFaculty())));
    }

    @Test
    @DisplayName("createAdminNotification does not associate any faculty")
    void adminNotificationHasNoFaculty() {
        when(notificationRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.createAdminNotification(
                "Test Alert",
                "System alert message.",
                "SYSTEM_ALERT");

        verify(notificationRepo).save(argThat(n -> n.getFaculty() == null));
    }
}
