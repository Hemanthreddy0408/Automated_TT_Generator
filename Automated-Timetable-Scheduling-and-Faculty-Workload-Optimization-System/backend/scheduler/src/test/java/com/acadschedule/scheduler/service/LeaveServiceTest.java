package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LeaveService.
 * LeaveService depends on: LeaveRepository, AuditLogService,
 * NotificationService.
 *
 * Key flow differences vs what the test originally assumed:
 * - deleteRequest() calls findById() first, then deleteById()
 * - createRequest() calls auditLogService + notificationService after saving
 * - updateStatus() calls notificationService.createFacultyNotification if
 * facultyId is set
 */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = Strictness.LENIENT)
class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepo;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LeaveService leaveService;

    private LeaveRequest leaveRequest;

    @BeforeEach
    void setUp() {
        leaveRequest = new LeaveRequest();
        leaveRequest.setId(1L);
        leaveRequest.setFacultyId(1L);
        leaveRequest.setFacultyName("Dr. Smith");
        leaveRequest.setLeaveType("CASUAL");
        leaveRequest.setStartDate(LocalDate.now().plusDays(1));
        leaveRequest.setEndDate(LocalDate.now().plusDays(2));
        leaveRequest.setStatus("Pending");
        leaveRequest.setReason("Conference");

        // Default stub for audit + notification (lenient — only used by some tests)
        doNothing().when(auditLogService).logAction(any(), any(), any(), any(), any());
        doNothing().when(notificationService).createAdminNotification(any(), any(), any());
        doNothing().when(notificationService).createFacultyNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("getAllRequests returns all leave requests")
    void getAllRequests() {
        when(leaveRepo.findAll()).thenReturn(List.of(leaveRequest));

        List<LeaveRequest> result = leaveService.getAllRequests();

        assertEquals(1, result.size());
        assertEquals("Pending", result.get(0).getStatus());
    }

    @Test
    @DisplayName("createRequest persists the leave request")
    void createRequest() {
        when(leaveRepo.save(any())).thenReturn(leaveRequest);

        LeaveRequest saved = leaveService.createRequest(leaveRequest);

        assertNotNull(saved);
        verify(leaveRepo).save(any());
    }

    @Test
    @DisplayName("updateStatus to Approved changes status field")
    void updateStatusApproved() {
        when(leaveRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LeaveRequest updated = leaveService.updateStatus(1L, "Approved");

        assertEquals("Approved", updated.getStatus());
    }

    @Test
    @DisplayName("updateStatus to Rejected changes status field")
    void updateStatusRejected() {
        when(leaveRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LeaveRequest updated = leaveService.updateStatus(1L, "Rejected");

        assertEquals("Rejected", updated.getStatus());
    }

    @Test
    @DisplayName("updateStatus throws when leave not found")
    void updateStatusNotFound() {
        when(leaveRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> leaveService.updateStatus(99L, "Approved"));
    }

    @Test
    @DisplayName("deleteRequest calls repository deleteById after successful findById")
    void deleteRequest() {
        when(leaveRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));
        doNothing().when(leaveRepo).deleteById(1L);

        leaveService.deleteRequest(1L);

        verify(leaveRepo).deleteById(1L);
    }
}
