package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.repository.SectionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionRepository repo;

    public SectionController(SectionRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Section> getAllSections() {
        return repo.findAll();
    }

    @PostMapping
    public Section createSection(@RequestBody Section section) {
        return repo.save(section);
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> updateSection(@PathVariable(name = "id") Long id,
            @RequestBody Section details) {
        java.util.Optional<Section> existing = repo.findById(id);

        if (existing.isEmpty()) {
            return org.springframework.http.ResponseEntity
                    .status(404)
                    .body("Section with id " + id + " not found");
        }

        Section section = existing.get();
        section.setName(details.getName());
        section.setDepartment(details.getDepartment());
        section.setYear(details.getYear());
        section.setCapacity(details.getCapacity());
        section.setStatus(details.getStatus());
        section.setMentorId(details.getMentorId());

        repo.save(section);
        return org.springframework.http.ResponseEntity.ok(section);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteSection(@PathVariable(name = "id") Long id) {
        if (!repo.existsById(id)) {
            return org.springframework.http.ResponseEntity
                    .status(404)
                    .body("Section with id " + id + " not found");
        }
        repo.deleteById(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
