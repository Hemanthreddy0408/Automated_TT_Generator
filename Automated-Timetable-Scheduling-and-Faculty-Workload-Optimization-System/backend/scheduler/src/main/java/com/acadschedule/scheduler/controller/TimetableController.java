package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.SectionRepository;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableGenerationService service;
    private final TimetableRepository timetableRepo;
    private final SectionRepository sectionRepo;

    public TimetableController(
            TimetableGenerationService service,
            TimetableRepository timetableRepo,
            SectionRepository sectionRepo) {
        this.service = service;
        this.timetableRepo = timetableRepo;
        this.sectionRepo = sectionRepo;
    }

    /**
     * Generate for a section.
     * commit=false -> preview (no DB writes)
     * commit=true -> persist generated entries (replaces existing)
     */
    @PostMapping("/generate/{sectionId}")
    public ResponseEntity<?> generateForSection(
            @PathVariable String sectionId,
            @RequestParam(defaultValue = "true") boolean commit) {
        try {
            List<TimetableEntry> result = service.generateForSection(sectionId, commit);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed: " + ex.getMessage());
        }
    }

    /**
     * Generate for all sections with global workload tracking.
     * commit param same semantics.
     *
     * Returns structured JSON with details so frontend can display success/errors.
     */
    @PostMapping("/generate-all")
    public ResponseEntity<?> generateForAll(@RequestParam(defaultValue = "true") boolean commit) {
        try {
            // Use the global workload tracking method
            List<TimetableEntry> allEntries = service.generateForAllSections(commit);

            Map<String, Object> result = new HashMap<>();
            result.put("generatedCount", allEntries.size());
            result.put("entries", allEntries);
            result.put("errors", new ArrayList<>()); // No errors if we got here
            result.put("sectionsAttempted", sectionRepo.findAll().size());

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            Map<String, Object> result = new HashMap<>();
            result.put("generatedCount", 0);
            result.put("entries", new ArrayList<>());

            List<Map<String, String>> errors = new ArrayList<>();
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage() == null ? ex.toString() : ex.getMessage());
            errors.add(err);

            result.put("errors", errors);
            result.put("sectionsAttempted", sectionRepo.findAll().size());

            // Server-side logging for debugging
            System.err.println("Error while generating all sections: " + ex);
            ex.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<List<TimetableEntry>> get(@PathVariable String sectionId) {
        return ResponseEntity.ok(timetableRepo.findBySectionId(sectionId));
    }

    // Fetch timetable for a specific faculty
    @GetMapping("/faculty/{name}")
    public List<TimetableEntry> getByFaculty(@PathVariable String name) {
        return timetableRepo.findByFacultyName(name);
    }


    // Get all entries for global analytics

    @GetMapping
    public ResponseEntity<List<TimetableEntry>> getAll() {
        return ResponseEntity.ok(timetableRepo.findAll());
    }
}
