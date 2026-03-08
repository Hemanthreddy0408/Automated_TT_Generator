package com.acadschedule.scheduler.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.repository.SubjectRepository;
@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AuditLogService auditLogService;

    public SubjectService(SubjectRepository subjectRepository, AuditLogService auditLogService) {
        this.subjectRepository = subjectRepository;
        this.auditLogService = auditLogService;
    }

    /**
     * Create a new subject and log the action.
     */
    public Subject createSubject(Subject subject) {
        Subject saved = subjectRepository.save(subject);
        auditLogService.logAction("SUBJECT", "CREATE", 
            "Created new subject: " + saved.getName() + " (" + saved.getCode() + ")", "Admin", saved.getId());
        return saved;
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    /**
     * Update an existing subject and log the action.
     */
    @org.springframework.transaction.annotation.Transactional
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));

        subject.setCode(subjectDetails.getCode());
        subject.setName(subjectDetails.getName());
        subject.setDepartment(subjectDetails.getDepartment());
        subject.setCredits(subjectDetails.getCredits());
        subject.setLectureHoursPerWeek(subjectDetails.getLectureHoursPerWeek());
        subject.setTutorialHoursPerWeek(subjectDetails.getTutorialHoursPerWeek());
        subject.setLabHoursPerWeek(subjectDetails.getLabHoursPerWeek());
        subject.setElective(subjectDetails.isElective());
        subject.setCommonCourse(subjectDetails.isCommonCourse());
        subject.setFacultyCount(subjectDetails.getFacultyCount());
        
        if (subjectDetails.getEligibleFaculty() != null) {
            subject.setEligibleFaculty(subjectDetails.getEligibleFaculty());
        }

        Subject updated = subjectRepository.save(subject);
        auditLogService.logAction("SUBJECT", "UPDATE", 
            "Updated subject details for: " + updated.getCode(), "Admin", updated.getId());
        return updated;
    }

    /**
     * Delete a subject and log the action.
     */
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subjectRepository.delete(subject);
        auditLogService.logAction("SUBJECT", "DELETE", 
            "Deleted subject: " + subject.getName() + " (" + subject.getCode() + ")", "Admin", id);
    }
}