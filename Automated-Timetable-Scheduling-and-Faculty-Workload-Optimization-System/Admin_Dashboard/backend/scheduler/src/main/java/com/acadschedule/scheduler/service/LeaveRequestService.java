package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository repository;

    public List<LeaveRequest> getAllLeaveRequests() {
        return repository.findAll();
    }

    public List<LeaveRequest> getLeaveRequestsByFaculty(Long facultyId) {
        return repository.findByFacultyId(facultyId);
    }

    public LeaveRequest applyForLeave(LeaveRequest request) {
        if (request.getStatus() == null) {
            request.setStatus("Pending");
        }
        if (request.getAppliedDate() == null) {
            request.setAppliedDate(java.time.LocalDate.now());
        }
        return repository.save(request);
    }

    public LeaveRequest updateLeaveStatus(Long id, String status) {
        LeaveRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(status);
        return repository.save(request);
    }

    public void deleteLeaveRequest(Long id) {
        repository.deleteById(id);
    }
}
