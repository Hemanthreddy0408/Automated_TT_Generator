package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepo;
    private final AuditLogService auditLogService;

    public LeaveService(LeaveRepository leaveRepo, AuditLogService auditLogService) {
        this.leaveRepo = leaveRepo;
        this.auditLogService = auditLogService;
    }

    public List<LeaveRequest> getAllRequests() {
        return leaveRepo.findAll();
    }

    public List<LeaveRequest> getRequestsByFaculty(Long facultyId) {
        return leaveRepo.findByFacultyId(facultyId);
    }

    /**
     * Create a new leave request and log the action.
     */
    public LeaveRequest createRequest(LeaveRequest request) {
        if (request.getAppliedDate() == null) {
            request.setAppliedDate(LocalDate.now());
        }
        if (request.getStatus() == null) {
            request.setStatus("Pending");
        }
        LeaveRequest saved = leaveRepo.save(request);
        auditLogService.logAction("LEAVE", "CREATE", 
            "Submitted leave request for: " + saved.getFacultyName() + " (" + saved.getLeaveType() + ")", saved.getFacultyName());
        return saved;
    }

    /**
     * Update leave request status and log the action.
     */
    public LeaveRequest updateStatus(Long id, String status) {
        return leaveRepo.findById(id).map(request -> {
            request.setStatus(status);
            LeaveRequest updated = leaveRepo.save(request);
            auditLogService.logAction("LEAVE", "STATUS_CHANGE", 
                "Updated leave status to " + status + " for: " + updated.getFacultyName(), "Admin");
            return updated;
        }).orElseThrow(() -> new RuntimeException("Leave Request not found"));
    }

    /**
     * Delete a leave request and log the action.
     */
    public void deleteRequest(Long id) {
        LeaveRequest request = leaveRepo.findById(id).orElseThrow(() -> new RuntimeException("Leave Request not found"));
        leaveRepo.deleteById(id);
        auditLogService.logAction("LEAVE", "DELETE", 
            "Cancelled/Deleted leave request for: " + request.getFacultyName(), request.getFacultyName());
    }
}
