package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // allow React frontend
public class AuthController {

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        if (request == null) {
            return new LoginResponse(false, "Invalid request", null, null);
        }

        String identifier = request.getIdentifier();
        String password = request.getPassword();
        String role = request.getRole();

        // Null checks
        if (identifier == null || password == null || role == null) {
            return new LoginResponse(false, "Missing required fields", null, null);
        }

        // ---------------- DEMO LOGIN ----------------

        // ADMIN LOGIN
        if (role.equals("admin")
                && identifier.equals("admin@acadschedule.com")
                && password.equals("password123")) {

            UserData admin = new UserData(
                    1L,
                    "System Administrator",
                    "admin@acadschedule.com",
                    "Administration",
                    "ADM001"
            );

            return new LoginResponse(true, "Admin login successful", "admin", admin);
        }

        // FACULTY LOGIN (demo: any email + faculty123)
        if (role.equals("faculty") && password.equals("faculty123")) {

            UserData faculty = new UserData(
                    2L,
                    "Dr. Faculty Member",
                    identifier,
                    "Computer Science",
                    "FAC001"
            );

            return new LoginResponse(true, "Faculty login successful", "faculty", faculty);
        }

        // FAILED LOGIN
        return new LoginResponse(false, "Invalid credentials", null, null);
    }
}
