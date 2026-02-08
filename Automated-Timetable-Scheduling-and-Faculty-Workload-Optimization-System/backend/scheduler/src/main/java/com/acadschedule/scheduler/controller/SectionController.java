package com.acadschedule.scheduler.controller;


import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.service.SectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    // GET all sections
    @GetMapping
    public List<Section> getAllSections() {
        return sectionService.getAllSections();
    }

    // GET single section by ID
    @GetMapping("/{id}")
    public ResponseEntity<Section> getSectionById(@PathVariable Long id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // NEW POST using DTO (FRONTEND → BACKEND mapping)
    @PostMapping
    public Section createSection(@RequestBody Section section) {
        if (section.getStatus() == null) {
            section.setStatus("ACTIVE");
        }
        return sectionService.createSection(section);
    }

    // UPDATE section
    @PutMapping("/{id}")
    public ResponseEntity<Section> updateSection(@PathVariable Long id, @RequestBody Section details) {
        return ResponseEntity.ok(sectionService.updateSection(id, details));
    }

    // DELETE section
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
