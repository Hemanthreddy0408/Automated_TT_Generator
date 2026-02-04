package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;

    public FacultyService(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    // CREATE
    public Faculty createFaculty(Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    // READ ALL
    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    // ✅ NEW: READ ONE (Get by ID)
    public Faculty getFacultyById(Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + id));
    }

    // ✅ NEW: UPDATE
    public Faculty updateFaculty(Long id, Faculty facultyDetails) {
        Faculty faculty = getFacultyById(id); // Re-use the method above to find the user first

        // Update all fields with new data
        faculty.setName(facultyDetails.getName());
        faculty.setEmail(facultyDetails.getEmail());
        faculty.setDepartment(facultyDetails.getDepartment());
        faculty.setDesignation(facultyDetails.getDesignation());
        faculty.setEmployeeId(facultyDetails.getEmployeeId());
        faculty.setActive(facultyDetails.isActive());
        faculty.setMaxHoursPerDay(facultyDetails.getMaxHoursPerDay());
        faculty.setMaxHoursPerWeek(facultyDetails.getMaxHoursPerWeek());
        faculty.setQualifications(facultyDetails.getQualifications());
        faculty.setSpecialization(facultyDetails.getSpecialization());
        faculty.setEligibleSubjects(facultyDetails.getEligibleSubjects());

        return facultyRepository.save(faculty);
    }

    // ✅ NEW: DELETE
    public void deleteFaculty(Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new RuntimeException("Faculty not found with id: " + id);
        }
        facultyRepository.deleteById(id);
    }
}