package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for LeaveController.
 * Uses @InjectMocks instead of @WebMvcTest to avoid Spring ApplicationContext
 * loading issues with Mockito inline mocking on Java 25.
 */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = Strictness.LENIENT)
class LeaveControllerTest {

    @Mock
    LeaveService leaveService;
    @Mock
    TimetableGenerationService timetableGenerationService;

    @InjectMocks
    private LeaveController controller;

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
    }

    @Test
    @DisplayName("getAllRequests() returns all leave requests")
    void getAllRequests() {
        when(leaveService.getAllRequests()).thenReturn(List.of(leaveRequest));

        List<LeaveRequest> result = controller.getAllRequests();

        assertEquals(1, result.size());
        assertEquals("Pending", result.get(0).getStatus());
    }

    @Test
    @DisplayName("createRequest() delegates to service and returns saved request")
    void createRequest() {
        when(leaveService.createRequest(any())).thenReturn(leaveRequest);

        LeaveRequest result = controller.createRequest(leaveRequest);

        assertNotNull(result);
        assertEquals("Conference", result.getReason());
        verify(leaveService).createRequest(any());
    }

    @Test
    @DisplayName("updateStatus() Approved returns 200 with updated leave")
    void approveLeave() {
        leaveRequest.setStatus("Approved");
        when(leaveService.updateStatus(1L, "Approved")).thenReturn(leaveRequest);

        ResponseEntity<LeaveRequest> response = controller.updateStatus(1L, "Approved");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Approved", response.getBody().getStatus());
    }

    @Test
    @DisplayName("updateStatus() Rejected returns 200 with updated leave")
    void rejectLeave() {
        leaveRequest.setStatus("Rejected");
        when(leaveService.updateStatus(1L, "Rejected")).thenReturn(leaveRequest);

        ResponseEntity<LeaveRequest> response = controller.updateStatus(1L, "Rejected");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Rejected", response.getBody().getStatus());
    }

    @Test
    @DisplayName("deleteRequest() delegates to service and returns 204")
    void deleteRequest() {
        doNothing().when(leaveService).deleteRequest(1L);

        ResponseEntity<Void> response = controller.deleteRequest(1L);

        assertEquals(204, response.getStatusCodeValue());
        verify(leaveService).deleteRequest(1L);
    }

    @Test
    @DisplayName("getRequestsByFaculty() returns requests for a specific faculty")
    void getRequestsByFaculty() {
        when(leaveService.getRequestsByFaculty(1L)).thenReturn(List.of(leaveRequest));

        List<LeaveRequest> result = controller.getRequestsByFaculty(1L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getFacultyId());
    }
}
