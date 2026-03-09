package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.FacultyRepository;
import com.acadschedule.scheduler.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for FacultyController.
 * Uses @InjectMocks instead of @WebMvcTest to avoid Spring ApplicationContext
 * loading issues with Mockito inline mocking on Java 25.
 */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = Strictness.LENIENT)
class FacultyControllerTest {

    @Mock
    FacultyRepository facultyRepository;
    @Mock
    FacultyService facultyService;

    @InjectMocks
    private FacultyController controller;

    private Faculty faculty;

    @BeforeEach
    void setUp() {
        faculty = new Faculty();
        faculty.setId(1L);
        faculty.setName("Dr. Smith");
        faculty.setSpecialization("Software Engineering");
        faculty.setMaxHoursPerWeek(20);
        faculty.setActive(true);
    }

    @Test
    @DisplayName("getAllFaculty() returns faculty list")
    void getAllFaculty() {
        when(facultyService.getAllFaculty()).thenReturn(List.of(faculty));

        List<Faculty> result = controller.getAllFaculty();

        assertEquals(1, result.size());
        assertEquals("Dr. Smith", result.get(0).getName());
    }

    @Test
    @DisplayName("getFacultyById() returns 200 for existing faculty")
    void getFacultyById() {
        when(facultyService.getFacultyById(1L)).thenReturn(faculty);

        ResponseEntity<Faculty> response = controller.getFacultyById(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("Dr. Smith", response.getBody().getName());
    }

    @Test
    @DisplayName("createFaculty() delegates to service and returns saved faculty")
    void createFaculty() {
        when(facultyService.createFaculty(any())).thenReturn(faculty);

        Faculty result = controller.createFaculty(faculty);

        assertEquals(1L, result.getId());
        verify(facultyService).createFaculty(any());
    }

    @Test
    @DisplayName("deleteFaculty() delegates to service and returns 204")
    void deleteFaculty() {
        doNothing().when(facultyService).deleteFaculty(1L);

        ResponseEntity<Void> response = controller.deleteFaculty(1L);

        assertEquals(204, response.getStatusCodeValue());
        verify(facultyService).deleteFaculty(1L);
    }

    @Test
    @DisplayName("getWorkloadSummary() returns list from service")
    void getWorkloadSummary() {
        Map<String, Object> entry = new HashMap<>();
        entry.put("name", "Dr. Smith");
        entry.put("weeklyHours", 10);

        when(facultyService.getWorkloadSummary()).thenReturn(List.of(entry));

        @SuppressWarnings("unchecked")
        ResponseEntity<?> response = controller.getWorkloadSummary();

        assertEquals(200, response.getStatusCodeValue());
    }
}
