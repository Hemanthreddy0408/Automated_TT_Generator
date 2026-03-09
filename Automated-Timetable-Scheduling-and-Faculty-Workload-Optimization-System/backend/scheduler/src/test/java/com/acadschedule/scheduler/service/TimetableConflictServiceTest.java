package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TimetableConflictService.
 *
 * Note: TimetableEntry has no setId() — id is auto-generated via JPA.
 * Tests use entries without explicit IDs except for findById stubs.
 */
@ExtendWith(MockitoExtension.class)
class TimetableConflictServiceTest {

    @Mock
    private TimetableRepository timetableRepo;

    @InjectMocks
    private TimetableConflictService conflictService;

    private TimetableEntry existingEntry;
    private TimetableEntry incomingEntry;

    /**
     * Build a TimetableEntry without an id (mirrors how service creates entries).
     */
    private TimetableEntry makeEntry(String sectionId, String day, String slot,
            String faculty, String room, String type) {
        TimetableEntry e = new TimetableEntry();
        e.setSectionId(sectionId);
        e.setDay(day);
        e.setTimeSlot(slot);
        e.setFacultyName(faculty);
        e.setRoomNumber(room);
        e.setSubjectCode("CSE301");
        e.setType(type);
        return e;
    }

    @BeforeEach
    void setUp() {
        existingEntry = makeEntry("1", "MONDAY", "09:00-09:40", "Dr. Smith", "AB1-401", "LECTURE");
        incomingEntry = makeEntry("2", "MONDAY", "09:00-09:40", "Dr. Smith", "AB1-402", "LECTURE");
    }

    @Test
    @DisplayName("Detects faculty conflict when same faculty teaches two sections simultaneously")
    void detectsFacultyConflict() {
        when(timetableRepo.findAll()).thenReturn(List.of(existingEntry));

        List<String> conflicts = conflictService.checkConflicts(incomingEntry);

        assertFalse(conflicts.isEmpty(), "Should report a faculty conflict");
        assertTrue(conflicts.stream().anyMatch(s -> s.contains("Dr. Smith")),
                "Conflict message should mention the faculty name");
    }

    @Test
    @DisplayName("Detects room conflict when same room is booked twice at same time")
    void detectsRoomConflict() {
        TimetableEntry incoming = makeEntry("2", "MONDAY", "09:00-09:40", "Prof. Other", "AB1-401", "LECTURE");
        when(timetableRepo.findAll()).thenReturn(List.of(existingEntry));

        List<String> conflicts = conflictService.checkConflicts(incoming);

        assertFalse(conflicts.isEmpty(), "Should report a room conflict");
        assertTrue(conflicts.stream().anyMatch(s -> s.contains("AB1-401")),
                "Conflict message should mention the room");
    }

    @Test
    @DisplayName("No conflict when same faculty teaches on a different day")
    void noConflictOnDifferentDay() {
        TimetableEntry incoming = makeEntry("2", "TUESDAY", "09:00-09:40", "Dr. Smith", "AB1-402", "LECTURE");
        when(timetableRepo.findAll()).thenReturn(List.of(existingEntry));

        List<String> conflicts = conflictService.checkConflicts(incoming);

        assertTrue(conflicts.isEmpty(), "Should be no conflict when days differ");
    }

    @Test
    @DisplayName("No conflict when same faculty is in a different time slot")
    void noConflictOnDifferentSlot() {
        TimetableEntry incoming = makeEntry("2", "MONDAY", "10:45-11:35", "Dr. Smith", "AB1-402", "LECTURE");
        when(timetableRepo.findAll()).thenReturn(List.of(existingEntry));

        List<String> conflicts = conflictService.checkConflicts(incoming);

        assertTrue(conflicts.isEmpty(), "Should be no conflict when time slots differ");
    }

    @Test
    @DisplayName("autoResolveConflict finds a free slot and saves the entry")
    void autoResolveConflictFindsNewSlot() {
        // Create a saved existingEntry reference with known state
        TimetableEntry savedEntry = makeEntry("1", "MONDAY", "09:00-09:40", "Dr. Smith", "AB1-401", "LECTURE");

        when(timetableRepo.findById(any())).thenReturn(Optional.of(savedEntry));
        when(timetableRepo.findAll()).thenReturn(new ArrayList<>(List.of(savedEntry)));
        when(timetableRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TimetableEntry resolved = conflictService.autoResolveConflict(1L);

        assertNotNull(resolved, "Should return the resolved entry");
        verify(timetableRepo).save(any(TimetableEntry.class));
    }

    @Test
    @DisplayName("autoResolveConflict throws when entry not found")
    void autoResolveConflictNotFound() {
        when(timetableRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> conflictService.autoResolveConflict(99L));
    }
}
