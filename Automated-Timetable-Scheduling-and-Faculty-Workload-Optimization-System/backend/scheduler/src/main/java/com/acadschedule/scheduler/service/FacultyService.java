package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final AuditLogService auditLogService;

    public FacultyService(FacultyRepository facultyRepository, AuditLogService auditLogService) {
        this.facultyRepository = facultyRepository;
        this.auditLogService = auditLogService;
    }

    /**
     * Create a new faculty member and log the action.
     */
    public Faculty createFaculty(Faculty faculty) {
        Faculty saved = facultyRepository.save(faculty);
        auditLogService.logAction("FACULTY", "CREATE", 
            "Created new faculty: " + saved.getName() + " (" + saved.getEmployeeId() + ")", "Admin");
        return saved;
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

    /**
     * Update an existing faculty member and log the action.
     */
    public Faculty updateFaculty(Long id, Faculty facultyDetails) {
        Faculty faculty = getFacultyById(id); 

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

        Faculty updated = facultyRepository.save(faculty);
        auditLogService.logAction("FACULTY", "UPDATE", 
            "Updated faculty details for: " + updated.getName(), "Admin");
        return updated;
    }

    /**
     * Delete a faculty member and log the action.
     */
    public void deleteFaculty(Long id) {
        Faculty faculty = getFacultyById(id);
        facultyRepository.deleteById(id);
        auditLogService.logAction("FACULTY", "DELETE", 
            "Deleted faculty: " + faculty.getName() + " (" + faculty.getEmployeeId() + ")", "Admin");
    }
}