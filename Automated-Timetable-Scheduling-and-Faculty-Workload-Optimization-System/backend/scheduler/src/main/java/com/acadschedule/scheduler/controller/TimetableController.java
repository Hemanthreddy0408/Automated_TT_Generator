package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.TimetableConflictService;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableRepository repo;
    private final TimetableGenerationService timetableGenerationService;
    private final TimetableConflictService conflictService;

    public TimetableController(TimetableRepository repo, TimetableGenerationService timetableGenerationService,
            TimetableConflictService conflictService) {
        this.repo = repo;
        this.timetableGenerationService = timetableGenerationService;
        this.conflictService = conflictService;
    }

    @GetMapping
    public List<TimetableEntry> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<?> getBySection(@PathVariable("sectionId") String sectionId) {
        try {
            List<TimetableEntry> list = repo.findBySectionId(sectionId);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            // Register JavaTimeModule if Date/Time fields exist, but let's just test basic
            // mapping
            mapper.findAndRegisterModules();
            String json = mapper.writeValueAsString(list);
            return ResponseEntity.ok().header("Content-Type", "application/json").body(json);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Serialization Error: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/faculty/{facultyName}")
    public List<TimetableEntry> getByFaculty(@PathVariable("facultyName") String facultyName) {
        return repo.findByFacultyName(facultyName);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateEntry(@RequestBody TimetableEntry entry,
            @RequestParam(value = "force", defaultValue = "false") boolean force) {
        if (!force) {
            List<String> conflicts = conflictService.checkConflicts(entry);
            if (!conflicts.isEmpty()) {
                return ResponseEntity.status(409).body(conflicts);
            }
        }
        TimetableEntry saved = repo.save(entry);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/generate-all")
    public ResponseEntity<?> generateAll() {
        try {
            // We pass 'true' to commit the generated timetable to the database
            List<TimetableEntry> generatedTimetable = timetableGenerationService.generateForAllSections(true);
            return ResponseEntity.ok(generatedTimetable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate timetable: " + e.getMessage());
        }
    }

    @PostMapping("/generate/{sectionId}")
    public ResponseEntity<?> generateForSection(@PathVariable("sectionId") String sectionId) {
        try {
            List<TimetableEntry> generatedTimetable = timetableGenerationService.generateForSection(sectionId, true);
            return ResponseEntity.ok(generatedTimetable);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Failed to generate timetable for section " + sectionId + ": " + e.getMessage());
        }
    }

    /**
     * Returns all timetable entries where type = ELECTIVE,
     * grouped by day+timeSlot for the UI elective panel.
     */
    @GetMapping("/electives")
    public ResponseEntity<?> getElectives() {
        List<TimetableEntry> electives = repo.findAll().stream()
                .filter(e -> "ELECTIVE".equalsIgnoreCase(e.getType()))
                .collect(Collectors.toList());

        // Group by "DAY|TIMESLOT" for easier frontend consumption
        Map<String, List<TimetableEntry>> grouped = electives.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDay() + "|" + e.getTimeSlot()));

        return ResponseEntity.ok(grouped);
    }

    @PostMapping("/resolve-conflict/{entryId}")
    public ResponseEntity<?> autoResolveConflict(@PathVariable("entryId") Long entryId) {
        try {
            TimetableEntry resolved = conflictService.autoResolveConflict(entryId);
            return ResponseEntity.ok(resolved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to auto-resolve conflict: " + e.getMessage());
        }
    }
}
