package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.repository.SubjectRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.acadschedule.scheduler.service.AuditLogService;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository repo;
    private final AuditLogService auditLogService;

    public SubjectController(SubjectRepository repo, AuditLogService auditLogService) {
        this.repo = repo;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return repo.findAll();
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        Subject saved = repo.save(subject);
        auditLogService.logAction("SUBJECT", "CREATE", 
            "Created subject: " + saved.getName(), "admin@system", saved.getId());
        return saved;
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody Subject details) {
        java.util.Optional<Subject> existing = repo.findById(id);

        if (existing.isEmpty()) {
            return org.springframework.http.ResponseEntity
                    .status(404)
                    .body("Subject with id " + id + " not found");
        }

        Subject subject = existing.get();
        subject.setCode(details.getCode());
        subject.setName(details.getName());
        subject.setDepartment(details.getDepartment());
        subject.setCredits(details.getCredits());
        subject.setType(details.getType());
        subject.setLectureHoursPerWeek(details.getLectureHoursPerWeek());
        subject.setTutorialHoursPerWeek(details.getTutorialHoursPerWeek());
        subject.setLabHoursPerWeek(details.getLabHoursPerWeek());
        subject.setYear(details.getYear());
        subject.setElective(details.isElective());
        subject.setCommonCourse(details.isCommonCourse());
        subject.setFacultyCount(details.getFacultyCount());
        subject.setEligibleFaculty(details.getEligibleFaculty());

        repo.save(subject);
        auditLogService.logAction("SUBJECT", "UPDATE", 
            "Updated subject details for: " + subject.getCode(), "admin@system", subject.getId());
        return org.springframework.http.ResponseEntity.ok(subject);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        java.util.Optional<Subject> existing = repo.findById(id);
        if (existing.isEmpty()) {
            return org.springframework.http.ResponseEntity
                    .status(404)
                    .body("Subject with id " + id + " not found");
        }
        Subject subject = existing.get();
        repo.deleteById(id);
        auditLogService.logAction("SUBJECT", "DELETE", 
            "Deleted subject: " + subject.getName() + " (" + subject.getCode() + ")", "admin@system", id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
