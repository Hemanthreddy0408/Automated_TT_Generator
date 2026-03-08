package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final com.acadschedule.scheduler.repository.FacultyRepository facultyRepository;
    private final FacultyService facultyService;

    public FacultyController(com.acadschedule.scheduler.repository.FacultyRepository facultyRepository,
            FacultyService facultyService) {
        this.facultyRepository = facultyRepository;
        this.facultyService = facultyService;
    }

    @GetMapping
    public List<Faculty> getAllFaculty() {
        return facultyService.getAllFaculty();
    }

    @PostMapping
    public Faculty createFaculty(@RequestBody Faculty faculty) {
        return facultyService.createFaculty(faculty);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Faculty> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFaculty(@PathVariable Long id, @RequestBody Faculty faculty) {

        Optional<Faculty> existing = facultyRepository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity
                    .status(404)
                    .body("Faculty with id " + id + " not found");
        }

        Faculty f = existing.get();

        f.setName(faculty.getName());
        f.setEmail(faculty.getEmail());
        f.setDepartment(faculty.getDepartment());
        f.setDesignation(faculty.getDesignation());
        f.setEmployeeId(faculty.getEmployeeId());
        f.setActive(faculty.isActive());
        f.setMaxHoursPerDay(faculty.getMaxHoursPerDay());
        f.setMaxHoursPerWeek(faculty.getMaxHoursPerWeek());
        f.setQualifications(faculty.getQualifications());
        f.setSpecialization(faculty.getSpecialization());
        f.setEligibleSubjects(faculty.getEligibleSubjects());

        facultyRepository.save(f);

        return ResponseEntity.ok(f);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id,
            @RequestBody com.acadschedule.scheduler.dto.PasswordChangeRequest request) {
        boolean success = facultyService.updatePassword(id, request.getOldPassword(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid old password");
        }
    }

    /**
     * GET /api/faculty/workload-summary
     * Returns live faculty workload data computed from the current timetable.
     */
    @GetMapping("/workload-summary")
    public ResponseEntity<?> getWorkloadSummary() {
        return ResponseEntity.ok(facultyService.getWorkloadSummary());
    }
}
