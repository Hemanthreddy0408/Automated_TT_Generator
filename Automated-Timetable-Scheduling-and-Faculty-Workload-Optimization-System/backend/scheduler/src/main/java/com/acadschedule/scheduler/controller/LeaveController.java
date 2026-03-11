package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.service.LeaveService;
import com.acadschedule.scheduler.service.TimetableGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;
    private final TimetableGenerationService timetableGenerationService;

    public LeaveController(LeaveService leaveService, TimetableGenerationService timetableGenerationService) {
        this.leaveService = leaveService;
        this.timetableGenerationService = timetableGenerationService;
    }

    // GET all leave requests (for Admin)
    @GetMapping
    public List<LeaveRequest> getAllRequests() {
        return leaveService.getAllRequests();
    }

    // GET requests by faculty ID (for Faculty)
    @GetMapping("/faculty/{facultyId}")
    public List<LeaveRequest> getRequestsByFaculty(@PathVariable(name = "facultyId") Long facultyId) {
        return leaveService.getRequestsByFaculty(facultyId);
    }

    // CREATE new leave request
    @PostMapping
    public LeaveRequest createRequest(@RequestBody LeaveRequest request) {
        return leaveService.createRequest(request);
    }

    // UPDATE status (Approve/Reject)
    @PatchMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateStatus(@PathVariable(name = "id") Long id,
            @RequestParam(name = "status") String status) {
        return ResponseEntity.ok(leaveService.updateStatus(id, status));
    }

    // DELETE request
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable(name = "id") Long id) {
        leaveService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/leaves/{id}/optimize
     * Triggers timetable optimization for an approved leave request.
     * Finds all sessions the faculty has during leave dates and reassigns them.
     */
    @PostMapping("/{id}/optimize")
    public ResponseEntity<?> optimizeForLeave(@PathVariable(name = "id") Long id) {
        try {
            // Get the leave request
            List<LeaveRequest> allLeaves = leaveService.getAllRequests();
            LeaveRequest leave = allLeaves.stream()
                    .filter(l -> l.getId().equals(id))
                    .findFirst()
                    .orElse(null);

            if (leave == null) {
                return ResponseEntity.status(404).body(
                        Map.of("error", "Leave request not found: " + id));
            }

            if (!"Approved".equalsIgnoreCase(leave.getStatus())) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Leave request must be Approved before optimizing timetable."));
            }

            // Compute which DAYS fall in the leave range
            Set<String> leaveDays = new HashSet<>();
            LocalDate current = leave.getStartDate();
            LocalDate end = leave.getEndDate();
            while (!current.isAfter(end)) {
                DayOfWeek dow = current.getDayOfWeek();
                if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                    leaveDays.add(dow.name().toUpperCase());
                    // Map DayOfWeek enum names to our scheduler day names
                    // DayOfWeek.MONDAY.name() = "MONDAY" which matches our format
                }
                current = current.plusDays(1);
            }

            if (leaveDays.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "No weekday sessions found in leave period.",
                        "reassigned", List.of()));
            }

            List<Map<String, Object>> reassigned = timetableGenerationService.optimizeForLeave(
                    leave.getFacultyName(), leaveDays);

            return ResponseEntity.ok(Map.of(
                    "message", "Optimization complete. " + reassigned.size() + " session(s) reassigned.",
                    "facultyOnLeave", leave.getFacultyName(),
                    "leaveDays", leaveDays,
                    "reassigned", reassigned));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Optimization failed: " + e.getMessage()));
        }
    }
}
