package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.LeaveRequest;
import com.acadschedule.scheduler.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepo;

    public LeaveService(LeaveRepository leaveRepo) {
        this.leaveRepo = leaveRepo;
    }

    public List<LeaveRequest> getAllRequests() {
        return leaveRepo.findAll();
    }

    public List<LeaveRequest> getRequestsByFaculty(Long facultyId) {
        return leaveRepo.findByFacultyId(facultyId);
    }

    public LeaveRequest createRequest(LeaveRequest request) {
        if (request.getAppliedDate() == null) {
            request.setAppliedDate(LocalDate.now());
        }
        if (request.getStatus() == null) {
            request.setStatus("Pending");
        }
        return leaveRepo.save(request);
    }

    public LeaveRequest updateStatus(Long id, String status) {
        return leaveRepo.findById(id).map(request -> {
            request.setStatus(status);
            return leaveRepo.save(request);
        }).orElseThrow(() -> new RuntimeException("Leave Request not found"));
    }

    public void deleteRequest(Long id) {
        leaveRepo.deleteById(id);
    }
}
