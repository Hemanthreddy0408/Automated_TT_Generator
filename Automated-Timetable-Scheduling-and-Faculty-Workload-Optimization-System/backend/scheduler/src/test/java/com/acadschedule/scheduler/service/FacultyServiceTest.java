package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FacultyService.
 * FacultyService depends on: FacultyRepository, AuditLogService,
 * PasswordEncoder,
 * SectionRepository, LeaveRepository, SubjectRepository, TimetableRepository,
 * NotificationRepository.
 */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class FacultyServiceTest {

    @Mock
    private FacultyRepository facultyRepo;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private SectionRepository sectionRepo;
    @Mock
    private LeaveRepository leaveRepo;
    @Mock
    private SubjectRepository subjectRepo;
    @Mock
    private TimetableRepository timetableRepo;
    @Mock
    private NotificationRepository notificationRepo;

    @InjectMocks
    private FacultyService facultyService;

    private Faculty faculty;

    @BeforeEach
    void setUp() {
        faculty = new Faculty();
        faculty.setId(1L);
        faculty.setName("Dr. Smith");
        faculty.setEmployeeId("FAC001");
        faculty.setEmail("dr.smith@college.edu");
        faculty.setActive(true);
        faculty.setMaxHoursPerWeek(20);
        faculty.setMaxHoursPerDay(8);

        // Set up password encoder to return a predictable hash
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");
    }

    @Test
    @DisplayName("getAllFaculty delegates to repository")
    void getAllFaculty() {
        when(facultyRepo.findAll()).thenReturn(List.of(faculty));

        List<Faculty> result = facultyService.getAllFaculty();

        assertEquals(1, result.size());
        assertEquals("Dr. Smith", result.get(0).getName());
    }

    @Test
    @DisplayName("getFacultyById returns faculty for valid id")
    void getFacultyById() {
        when(facultyRepo.findById(1L)).thenReturn(Optional.of(faculty));

        Faculty result = facultyService.getFacultyById(1L);

        assertEquals("Dr. Smith", result.getName());
    }

    @Test
    @DisplayName("getFacultyById throws for unknown id")
    void getFacultyByIdNotFound() {
        when(facultyRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> facultyService.getFacultyById(99L));
    }

    @Test
    @DisplayName("createFaculty encodes password and saves")
    void createFaculty() {
        faculty.setPassword("plaintext");
        when(facultyRepo.save(any())).thenReturn(faculty);
        doNothing().when(auditLogService).logAction(any(), any(), any(), any(), any());

        Faculty saved = facultyService.createFaculty(faculty);

        assertNotNull(saved);
        verify(passwordEncoder).encode("plaintext");
        verify(facultyRepo).save(any());
    }

    @Test
    @DisplayName("createFaculty uses default password when none given")
    void createFacultyDefaultPassword() {
        faculty.setPassword(null);
        when(facultyRepo.save(any())).thenReturn(faculty);
        doNothing().when(auditLogService).logAction(any(), any(), any(), any(), any());

        facultyService.createFaculty(faculty);

        verify(passwordEncoder).encode("faculty123");
    }

    @Test
    @DisplayName("deleteFaculty removes faculty after looking up by id")
    void deleteFaculty() {
        when(facultyRepo.findById(1L)).thenReturn(Optional.of(faculty));
        when(sectionRepo.findAll()).thenReturn(Collections.emptyList());
        when(subjectRepo.findAll()).thenReturn(Collections.emptyList());
        doNothing().when(timetableRepo).deleteByFacultyName(any());
        doNothing().when(leaveRepo).deleteByFacultyId(any());
        doNothing().when(auditLogService).logAction(any(), any(), any(), any(), any());

        assertDoesNotThrow(() -> facultyService.deleteFaculty(1L));
        verify(timetableRepo).deleteByFacultyName("Dr. Smith");
    }
}
