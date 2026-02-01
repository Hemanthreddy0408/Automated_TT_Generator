package com.acadschedule.scheduler.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // ✅ NEW: Update Subject
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
        
        // ✅ NEW: Update the count
        subject.setFacultyCount(subjectDetails.getFacultyCount()); 

        return subjectRepository.save(subject);
    }

    // ✅ NEW: Delete Subject
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subjectRepository.delete(subject);
    }
}