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
@CrossOrigin(origins = "http://localhost:8080")
public class TimetableController {

    private final TimetableGenerationService service;
    private final TimetableRepository timetableRepo;
    private final SectionRepository sectionRepo;

    public TimetableController(
            TimetableGenerationService service,
            TimetableRepository timetableRepo,
            SectionRepository sectionRepo
    ) {
        this.service = service;
        this.timetableRepo = timetableRepo;
        this.sectionRepo = sectionRepo;
    }

    /**
     * Generate for a section.
     * commit=false -> preview (no DB writes)
     * commit=true  -> persist generated entries (replaces existing)
     */
    @PostMapping("/generate/{sectionId}")
    public ResponseEntity<?> generateForSection(
            @PathVariable String sectionId,
            @RequestParam(defaultValue = "true") boolean commit
    ) {
        try {
            List<TimetableEntry> result = service.generateForSection(sectionId, commit);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed: " + ex.getMessage());
        }
    }

    /**
     * Generate for all sections (loops per section).
     * commit param same semantics.
     *
     * Returns structured JSON with details so frontend can display success/errors.
     */
    @PostMapping("/generate-all")
    public ResponseEntity<?> generateForAll(@RequestParam(defaultValue = "true") boolean commit) {
        List<Section> sections = sectionRepo.findAll();
        Map<String,Object> result = new HashMap<>();
        List<TimetableEntry> allEntries = new ArrayList<>();
        List<Map<String,String>> errors = new ArrayList<>();

        for (Section s : sections) {
            try {
                List<TimetableEntry> part = service.generateForSection(String.valueOf(s.getId()), commit);
                if (part != null) allEntries.addAll(part);
            } catch (Exception ex) {
                Map<String,String> err = new HashMap<>();
                err.put("sectionId", String.valueOf(s.getId()));
                err.put("message", ex.getMessage() == null ? ex.toString() : ex.getMessage());
                errors.add(err);

                // Server-side logging for debugging
                System.err.println("Error while generating section " + s.getId() + ": " + ex);
                ex.printStackTrace();
            }
        }

        result.put("generatedCount", allEntries.size());
        result.put("entries", allEntries);
        result.put("errors", errors);
        result.put("sectionsAttempted", sections.size());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<List<TimetableEntry>> get(@PathVariable String sectionId) {
        return ResponseEntity.ok(timetableRepo.findBySectionId(sectionId));
    }

    @GetMapping
    public ResponseEntity<List<TimetableEntry>> getAll() {
        return ResponseEntity.ok(timetableRepo.findAll());
    }
}
