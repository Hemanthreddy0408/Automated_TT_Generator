package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService service;

    @GetMapping
    public List<LeaveRequest> getAll() {
        return service.getAllLeaveRequests();
    }

    @GetMapping("/faculty/{facultyId}")
    public List<LeaveRequest> getByFaculty(@PathVariable Long facultyId) {
        return service.getLeaveRequestsByFaculty(facultyId);
    }

    @PostMapping
    public LeaveRequest apply(@RequestBody LeaveRequest request) {
        return service.applyForLeave(request);
    }

    @PatchMapping("/{id}/status")
    public LeaveRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateLeaveStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteLeaveRequest(id);
    }
}
