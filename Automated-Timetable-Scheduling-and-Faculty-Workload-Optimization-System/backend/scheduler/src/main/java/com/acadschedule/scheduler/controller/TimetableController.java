package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "http://localhost:8080")
public class TimetableController {

    private final TimetableGenerationService service;
    private final TimetableRepository repo;

    public TimetableController(TimetableGenerationService service, TimetableRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    // Generate timetable for a specific section
    @PostMapping("/generate/{sectionId}")
    public void generate(@PathVariable String sectionId) {
        service.generateForSection(sectionId);
    }

    // Generate timetable for all sections
    @PostMapping("/generate-all")
    public void generateAll() {
        service.generateForAllSections();
    }

    // Fetch timetable
    @GetMapping("/{sectionId}")
    public List<TimetableEntry> get(@PathVariable String sectionId) {
        List<TimetableEntry> entries = repo.findBySectionId(sectionId);
        if (!entries.isEmpty()) {
            System.out.println("DEBUG: Entry 0 SubjectName: " + entries.get(0).getSubjectName());
        }
        return entries;
    }
}
