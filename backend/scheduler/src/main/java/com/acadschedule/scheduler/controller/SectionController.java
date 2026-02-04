package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.repository.SectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionRepository sectionRepository;

    public SectionController(SectionRepository sectionRepository) {
        this.sectionRepository = sectionRepository;
    }

    @GetMapping
    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    @PostMapping
    public Section createSection(@RequestBody Section section) {
        return sectionRepository.save(section);
    }

    @DeleteMapping("/{id}")
    public void deleteSection(@PathVariable String id) {
        sectionRepository.deleteById(id);
    }
}
