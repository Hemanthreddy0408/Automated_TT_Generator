package com.acadschedule.scheduler.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.repository.SubjectRepository;
@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

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
        
        // Update eligible faculty list
        if (subjectDetails.getEligibleFaculty() != null) {
            subject.setEligibleFaculty(subjectDetails.getEligibleFaculty());
        }

        return subjectRepository.save(subject);
    }

    // ✅ NEW: Delete Subject
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subjectRepository.delete(subject);
    }
}