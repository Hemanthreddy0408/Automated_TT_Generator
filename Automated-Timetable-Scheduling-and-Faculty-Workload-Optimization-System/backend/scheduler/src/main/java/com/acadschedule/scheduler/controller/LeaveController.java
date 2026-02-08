package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // GET all leave requests (for Admin)
    @GetMapping
    public List<LeaveRequest> getAllRequests() {
        return leaveService.getAllRequests();
    }

    // GET requests by faculty ID (for Faculty)
    @GetMapping("/faculty/{facultyId}")
    public List<LeaveRequest> getRequestsByFaculty(@PathVariable Long facultyId) {
        return leaveService.getRequestsByFaculty(facultyId);
    }

    // CREATE new leave request
    @PostMapping
    public LeaveRequest createRequest(@RequestBody LeaveRequest request) {
        return leaveService.createRequest(request);
    }

    // UPDATE status (Approve/Reject)
    @PatchMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(leaveService.updateStatus(id, status));
    }

    // DELETE request
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        leaveService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
