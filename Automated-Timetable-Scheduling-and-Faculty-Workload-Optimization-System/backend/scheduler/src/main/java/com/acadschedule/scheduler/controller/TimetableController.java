package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableRepository repo;
    private final TimetableGenerationService timetableGenerationService;

    public TimetableController(TimetableRepository repo, TimetableGenerationService timetableGenerationService) {
        this.repo = repo;
        this.timetableGenerationService = timetableGenerationService;
    }

    @GetMapping
    public List<TimetableEntry> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{sectionId}")
    public List<TimetableEntry> getBySection(@PathVariable String sectionId) {
        return repo.findBySectionId(sectionId);
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
    public ResponseEntity<?> generateForSection(@PathVariable String sectionId) {
        try {
            // Example generation for a single section if supported, else general fallback or method
            // In absence of generateForSection(sectionId), you could just throw unsupported or implement if it exists.
            List<TimetableEntry> generatedTimetable = timetableGenerationService.generateForSection(sectionId, true);
            return ResponseEntity.ok(generatedTimetable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate timetable for section " + sectionId + ": " + e.getMessage());
        }
    }
}
