package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.repository.SectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {

    private final SectionRepository sectionRepo;

    public SectionService(SectionRepository sectionRepo) {
        this.sectionRepo = sectionRepo;
    }

    public List<Section> getAllSections() {
        return sectionRepo.findAll();
    }

    public java.util.Optional<Section> getSectionById(Long id) {
        return sectionRepo.findById(id);
    }

    public Section createSection(Section section) {
        return sectionRepo.save(section);
    }

    public Section updateSection(Long id, Section details) {
        return sectionRepo.findById(id).map(section -> {
            section.setName(details.getName());
            section.setDepartment(details.getDepartment());
            section.setYear(details.getYear());
            section.setCapacity(details.getCapacity());
            section.setStatus(details.getStatus());
            section.setMentorId(details.getMentorId());
            return sectionRepo.save(section);
        }).orElseThrow(() -> new RuntimeException("Section not found"));
    }

    public void deleteSection(Long id) {
        sectionRepo.deleteById(id);
    }
}
