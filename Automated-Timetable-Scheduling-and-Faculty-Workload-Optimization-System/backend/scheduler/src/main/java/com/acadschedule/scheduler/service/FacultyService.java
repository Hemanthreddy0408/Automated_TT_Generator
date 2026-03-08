package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final SectionRepository sectionRepository;
    private final LeaveRepository leaveRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableRepository timetableRepository;
    private final NotificationRepository notificationRepository;

    public FacultyService(FacultyRepository facultyRepository,
            AuditLogService auditLogService,
            PasswordEncoder passwordEncoder,
            SectionRepository sectionRepository,
            LeaveRepository leaveRepository,
            SubjectRepository subjectRepository,
            TimetableRepository timetableRepository,
            NotificationRepository notificationRepository) {
        this.facultyRepository = facultyRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
        this.sectionRepository = sectionRepository;
        this.leaveRepository = leaveRepository;
        this.subjectRepository = subjectRepository;
        this.timetableRepository = timetableRepository;
        this.notificationRepository = notificationRepository;
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
    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = getFacultyById(id);
        
        // 1. CLEAR SECTION MENTORSHIP
        sectionRepository.findAll().stream()
                .filter(s -> id.equals(s.getMentorId()))
                .forEach(s -> {
                    s.setMentorId(null);
                    sectionRepository.save(s);
                });

        // 2. DELETE RELATED DATA VIA REPOS
        timetableRepository.deleteByFacultyName(faculty.getName());
        leaveRepository.deleteByFacultyId(id);

        // 3. REMOVE FROM SUBJECT ELIGIBILITY
        subjectRepository.findAll().forEach(subject -> {
            boolean modified = subject.getEligibleFaculty().removeIf(fId -> 
                fId.equals(String.valueOf(id)) || fId.equals(faculty.getEmployeeId())
            );
            if (modified) {
                subjectRepository.save(subject);
            }
        });

        // 4. DELETE NOTIFICATIONS
        notificationRepository.findAll().stream()
                .filter(n -> n.getFaculty() != null && id.equals(n.getFaculty().getId()))
                .forEach(notificationRepository::delete);

        // 5. FINALLY DELETE THE FACULTY
        facultyRepository.delete(faculty);
        
        auditLogService.logAction("FACULTY", "DELETE",
                "Deleted faculty: " + faculty.getName() + " (" + faculty.getEmployeeId() + ")", "Admin", id);
    }
}