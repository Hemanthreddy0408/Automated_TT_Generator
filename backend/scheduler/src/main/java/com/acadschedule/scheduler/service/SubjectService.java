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
}
