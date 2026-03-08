package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final AuditLogService auditLogService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public FacultyService(FacultyRepository facultyRepository,
            AuditLogService auditLogService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new faculty member and log the action.
     */
    public Faculty createFaculty(Faculty faculty) {
        // Encode password if provided
        if (faculty.getPassword() != null && !faculty.getPassword().isEmpty()) {
            faculty.setPassword(passwordEncoder.encode(faculty.getPassword()));
        } else {
            // Default password for new faculty
            faculty.setPassword(passwordEncoder.encode("faculty123"));
        }

        Faculty saved = facultyRepository.save(faculty);
        auditLogService.logAction("FACULTY", "CREATE",
                "Created new faculty: " + saved.getName() + " (" + saved.getEmployeeId() + ")", "Admin", saved.getId());
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
                "Updated faculty details for: " + updated.getName(), "Admin", updated.getId());
        return updated;
    }

    /**
     * Update faculty password.
     */
    public boolean updatePassword(Long id, String oldPassword, String newPassword) {
        Faculty faculty = getFacultyById(id);

        // If they have no password set or the old password matches the encoded one
        // Note: For existing demo users, their password might be plaintext
        // "faculty123".
        // We will just do a check on the encoder. Since we are moving to encoded
        // passwords,
        // we'll assume the current DB has encoded passwords or we fallback if it's
        // identical
        // to a known plaintext string.
        boolean isMatch = passwordEncoder.matches(oldPassword, faculty.getPassword());

        // Fallback for demo dummy passwords
        if (!isMatch && oldPassword.equals(faculty.getPassword())) {
            isMatch = true;
        }

        // Match the AuthController demo fallback
        if (!isMatch && "faculty123".equals(oldPassword)) {
            isMatch = true;
        }

        if (!isMatch) {
            return false;
        }

        faculty.setPassword(passwordEncoder.encode(newPassword));
        facultyRepository.save(faculty);

        auditLogService.logAction("FACULTY", "PASSWORD_UPDATE",
                "Password changed for: " + faculty.getName(), faculty.getEmployeeId(), faculty.getId());

        return true;
    }

    /**
     * Delete a faculty member and log the action.
     */
    public void deleteFaculty(Long id) {
        Faculty faculty = getFacultyById(id);
        
        facultyRepository.delete(faculty);
        
        auditLogService.logAction("FACULTY", "DELETE",
                "Deleted faculty: " + faculty.getName() + " (" + faculty.getEmployeeId() + ")", "Admin", id);
    }
}