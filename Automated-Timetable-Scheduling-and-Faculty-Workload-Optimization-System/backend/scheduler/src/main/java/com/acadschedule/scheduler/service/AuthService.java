package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import com.acadschedule.scheduler.entity.Admin;
import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.AdminRepository;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private AdminRepository adminRepository;

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
     * Validates against Admin credentials in database.
     */
    private LoginResponse authenticateAdmin(String identifier, String password) {
        java.util.Optional<Admin> adminOpt = adminRepository.findByEmail(identifier);

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();

            // Validate password using PasswordEncoder
            if (passwordEncoder.matches(password, admin.getPassword())) {
                UserData userData = new UserData(
                        admin.getId(),
                        "Administrator",
                        admin.getEmail(),
                        "Administration",
                        "ADMIN001");
                return new LoginResponse(true, "Login successful", "admin", userData);
            }
        }

        return new LoginResponse(false, "Invalid admin credentials", null, null);
    }

    /**
     * Faculty authentication
     * Uses email or employeeId to find faculty, then validates password
     * For demo: any faculty email/employeeId with password "faculty123"
     */
    private LoginResponse authenticateFaculty(String identifier, String password) {
        // Find faculty by email or employee ID
        java.util.Optional<Faculty> facultyOpt = facultyRepository.findByEmail(identifier);
        if (facultyOpt.isEmpty()) {
            facultyOpt = facultyRepository.findByEmployeeId(identifier);
        }

        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();

            // Validate password using PasswordEncoder
            if (!passwordEncoder.matches(password, faculty.getPassword())) {
                return new LoginResponse(false, "Invalid faculty credentials", null, null);
            }

            // Check if faculty is active
            if (!faculty.isActive()) {
                return new LoginResponse(false, "Account is inactive. Please contact administrator.", null, null);
            }

            UserData userData = new UserData(
                    faculty.getId(),
                    faculty.getName(),
                    faculty.getEmail(),
                    faculty.getDepartment(),
                    faculty.getEmployeeId());
            return new LoginResponse(true, "Login successful", "faculty", userData);
        }

        return new LoginResponse(false, "Invalid faculty credentials", null, null);
    }
}
