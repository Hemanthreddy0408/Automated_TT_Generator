package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableGenerationService generator;
    private final TimetableRepository repo;

    public TimetableController(
            TimetableGenerationService generator,
            TimetableRepository repo
    ) {
        this.generator = generator;
        this.repo = repo;
    }

    // Generate timetable
    @PostMapping("/generate/{sectionId}")
    public void generate(@PathVariable Long sectionId) {
        generator.generateForSection(sectionId);
    }

    // Fetch timetable
    @GetMapping("/{sectionId}")
    public List<TimetableEntry> get(@PathVariable Long sectionId) {
        return repo.findAllBySectionId(sectionId);
    }
}
