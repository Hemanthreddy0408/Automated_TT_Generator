package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final com.acadschedule.scheduler.repository.FacultyRepository facultyRepo;

    public AuthController(com.acadschedule.scheduler.repository.FacultyRepository facultyRepo) {
        this.facultyRepo = facultyRepo;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        System.out.println("LOGIN API HIT"); // 👈 helps confirm backend reached

        if (request == null) {
            return new LoginResponse(false, "Invalid request", null, null);
        }

        String identifier = request.getIdentifier();
        String password = request.getPassword();
        String role = request.getRole();

        // ADMIN LOGIN
        if ("admin".equalsIgnoreCase(role)
                && "admin@acadschedule.com".equalsIgnoreCase(identifier)
                && "password123".equals(password)) {

            UserData admin = new UserData(
                    1L,
                    "Admin User",
                    "admin@acadschedule.com",
                    "CSE",
                    "ADMIN001"
            );

            return new LoginResponse(true, "Admin login success", "admin", admin);
        }

        // FACULTY LOGIN
        if ("faculty".equalsIgnoreCase(role) && "faculty123".equals(password)) {
            // Try to find the faculty in DB
            java.util.Optional<com.acadschedule.scheduler.entity.Faculty> facultyOpt = 
                facultyRepo.findByEmail(identifier);
            
            if (facultyOpt.isEmpty()) {
                facultyOpt = facultyRepo.findByEmployeeId(identifier);
            }

            if (facultyOpt.isPresent()) {
                com.acadschedule.scheduler.entity.Faculty f = facultyOpt.get();
                UserData ud = new UserData(
                        f.getId(),
                        f.getName(),
                        f.getEmail(),
                        f.getDepartment(),
                        f.getEmployeeId()
                );
                return new LoginResponse(true, "Faculty login success", "faculty", ud);
            } else {
                return new LoginResponse(false, "Faculty record not found", null, null);
            }
        }

        return new LoginResponse(false, "Invalid credentials", null, null);
    }
}
