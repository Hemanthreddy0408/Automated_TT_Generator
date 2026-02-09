package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Value("${spring.security.user.password:password123}")
    private String adminPassword;

    /**
     * Authenticate user based on role
     */
    public LoginResponse authenticate(LoginRequest request) {
        if (request == null) {
            return new LoginResponse(false, "Invalid request", null, null);
        }

        String role = request.getRole();
        String identifier = request.getIdentifier();
        String password = request.getPassword();

        if ("admin".equalsIgnoreCase(role)) {
            return authenticateAdmin(identifier, password);
        } else if ("faculty".equalsIgnoreCase(role)) {
            return authenticateFaculty(identifier, password);
        } else {
            return new LoginResponse(false, "Invalid role specified", null, null);
        }
    }

    /**
     * Admin authentication
     * For demo: admin@acadschedule.com / password123
     */
    private LoginResponse authenticateAdmin(String identifier, String password) {
        // Simple admin check - in production, use proper user table with hashed passwords
        if ("admin@acadschedule.com".equalsIgnoreCase(identifier) && adminPassword.equals(password)) {
            UserData userData = new UserData(
                0L,
                "Administrator",
                "admin@acadschedule.com",
                "Administration",
                "ADMIN001"
            );
            return new LoginResponse(true, "Login successful", "admin", userData);
        }
        return new LoginResponse(false, "Invalid admin credentials", null, null);
    }

    /**
     * Faculty authentication
     * Uses email or employeeId to find faculty, then validates password
     * For demo: any faculty email/employeeId with password "faculty123"
     */
    private LoginResponse authenticateFaculty(String identifier, String password) {
        // Try to find faculty by email or employeeId
        Optional<Faculty> facultyOpt = facultyRepository.findByEmail(identifier);
        
        if (facultyOpt.isEmpty()) {
            facultyOpt = facultyRepository.findByEmployeeId(identifier);
        }

        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            
            // Check if faculty is active
            if (!faculty.isActive()) {
                return new LoginResponse(false, "Account is inactive. Please contact administrator.", null, null);
            }

            // For demo purposes, accept "faculty123" as password
            // In production, store hashed passwords in Faculty entity
            if ("faculty123".equals(password)) {
                UserData userData = new UserData(
                    faculty.getId(),
                    faculty.getName(),
                    faculty.getEmail(),
                    faculty.getDepartment(),
                    faculty.getEmployeeId()
                );
                return new LoginResponse(true, "Login successful", "faculty", userData);
            }
        }

        return new LoginResponse(false, "Invalid faculty credentials", null, null);
    }
}
