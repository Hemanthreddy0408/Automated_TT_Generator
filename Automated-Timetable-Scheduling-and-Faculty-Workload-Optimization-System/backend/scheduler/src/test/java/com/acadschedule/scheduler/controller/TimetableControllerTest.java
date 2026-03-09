package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for TimetableController.
 * Uses @InjectMocks instead of @WebMvcTest to avoid Spring ApplicationContext
 * loading issues with Mockito inline mocking on Java 25.
 */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = Strictness.LENIENT)
class TimetableControllerTest {

        @Mock
        TimetableRepository timetableRepo;
        @Mock
        TimetableGenerationService generationService;
        @Mock
        TimetableConflictService conflictService;

        @InjectMocks
        private TimetableController controller;

        private TimetableEntry sampleEntry;

        @BeforeEach
        void setUp() {
                sampleEntry = new TimetableEntry();
                sampleEntry.setSectionId("1");
                sampleEntry.setDay("MONDAY");
                sampleEntry.setTimeSlot("09:00-09:40");
                sampleEntry.setSubjectCode("CSE301");
                sampleEntry.setSubjectName("Operating Systems");
                sampleEntry.setFacultyName("Dr. Smith");
                sampleEntry.setRoomNumber("AB1-401");
                sampleEntry.setType("LECTURE");
        }

    @Test
    @DisplayName("getAll() returns all timetable entries from repository")
    void getAllEntries() {
        when(timetableRepo.findAll()).thenReturn(List.of(sampleEntry));

        List<TimetableEntry> result = controller.getAll();

        assertEquals(1, result.size());
        assertEquals("MONDAY", result.get(0).getDay());
    }

    @Test
    @DisplayName("getBySection() returns entries for a section id")
    void getBySection() {
        when(timetableRepo.findBySectionId("1")).thenReturn(List.of(sampleEntry));

        List<TimetableEntry> result = controller.getBySection("1");

        assertEquals(1, result.size());
        assertEquals("CSE301", result.get(0).getSubjectCode());
    }

    @Test
    @DisplayName("getByFaculty() returns entries for a faculty")
    void getByFaculty() {
        when(timetableRepo.findByFacultyName("Dr. Smith")).thenReturn(List.of(sampleEntry));

        List<TimetableEntry> result = controller.getByFaculty("Dr. Smith");

        assertEquals(1, result.size());
        assertEquals("Dr. Smith", result.get(0).getFacultyName());
    }

    @Test
    @DisplayName("updateEntry() with force=true saves and returns 200")
    void updateEntryForced() {
        when(timetableRepo.save(any())).thenReturn(sampleEntry);

        var response = controller.updateEntry(sampleEntry, true);

        assertEquals(200, response.getStatusCodeValue());
        verify(timetableRepo).save(any());
    }

    @Test
    @DisplayName("updateEntry() with force=false returns 409 when conflicts detected")
    void updateEntryConflicts() {
        when(conflictService.checkConflicts(any())).thenReturn(List.of("Faculty conflict"));

        var response = controller.updateEntry(sampleEntry, false);

        assertEquals(409, response.getStatusCodeValue());
    }

    @Test
    @DisplayName("generateAll() returns 200 on success")
    void generateAll() throws Exception {
        when(generationService.generateForAllSections(true)).thenReturn(List.of(sampleEntry));

        var response = controller.generateAll();

        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    @DisplayName("generateAll() returns 400 when service throws")
    void generateAllFails() throws Exception {
        when(generationService.generateForAllSections(true))
                .thenThrow(new RuntimeException("Over-constrained"));

        var response = controller.generateAll();

        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    @DisplayName("generateForSection() returns 200 on success")
    void generateForSection() throws Exception {
        when(generationService.generateForSection("1", true)).thenReturn(List.of(sampleEntry));

        var response = controller.generateForSection("1");

        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    @DisplayName("generateForSection() returns 400 when service throws")
    void generateForSectionFails() throws Exception {
        when(generationService.generateForSection("99", true))
                .thenThrow(new RuntimeException("Section not found"));

        var response = controller.generateForSection("99");

        assertEquals(400, response.getStatusCodeValue());
    }
}
