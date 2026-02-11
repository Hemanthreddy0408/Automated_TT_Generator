package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.repository.SectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {

    private final SectionRepository sectionRepo;
    private final AuditLogService auditLogService;

    public SectionService(SectionRepository sectionRepo, AuditLogService auditLogService) {
        this.sectionRepo = sectionRepo;
        this.auditLogService = auditLogService;
    }

    public List<Section> getAllSections() {
        return sectionRepo.findAll();
    }

    public java.util.Optional<Section> getSectionById(Long id) {
        return sectionRepo.findById(id);
    }

    /**
     * Create a new section and log the action.
     */
    public Section createSection(Section section) {
        Section saved = sectionRepo.save(section);
        auditLogService.logAction("SECTION", "CREATE", 
            "Created new section: " + saved.getName() + " (" + saved.getDepartment() + ")", "Admin");
        return saved;
    }

    /**
     * Update an existing section and log the action.
     */
    public Section updateSection(Long id, Section details) {
        return sectionRepo.findById(id).map(section -> {
            section.setName(details.getName());
            section.setDepartment(details.getDepartment());
            section.setYear(details.getYear());
            section.setCapacity(details.getCapacity());
            section.setStatus(details.getStatus());
            section.setMentorId(details.getMentorId());
            Section updated = sectionRepo.save(section);
            auditLogService.logAction("SECTION", "UPDATE", 
                "Updated section: " + updated.getName(), "Admin");
            return updated;
        }).orElseThrow(() -> new RuntimeException("Section not found"));
    }

    /**
     * Delete a section by ID and log the action.
     */
    public void deleteSection(Long id) {
        Section section = sectionRepo.findById(id).orElseThrow(() -> new RuntimeException("Section not found"));
        sectionRepo.deleteById(id);
        auditLogService.logAction("SECTION", "DELETE", 
            "Deleted section: " + section.getName(), "Admin");
    }
}
