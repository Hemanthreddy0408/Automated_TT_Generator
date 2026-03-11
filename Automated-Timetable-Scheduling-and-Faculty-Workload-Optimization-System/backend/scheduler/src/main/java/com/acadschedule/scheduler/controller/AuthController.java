package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final com.acadschedule.scheduler.repository.FacultyRepository facultyRepo;
    private final com.acadschedule.scheduler.repository.AdminRepository adminRepo;
    private final com.acadschedule.scheduler.service.OtpService otpService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthController(com.acadschedule.scheduler.repository.FacultyRepository facultyRepo,
            com.acadschedule.scheduler.repository.AdminRepository adminRepo,
            com.acadschedule.scheduler.service.OtpService otpService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.facultyRepo = facultyRepo;
        this.adminRepo = adminRepo;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        System.out.println("LOGIN API HIT");

        if (request == null) {
            return new LoginResponse(false, "Invalid request", null, null);
        }

        String identifier = request.getIdentifier();
        String password = request.getPassword();
        String role = request.getRole();

        // ADMIN LOGIN (Database-backed)
        if ("admin".equalsIgnoreCase(role)) {
            java.util.Optional<com.acadschedule.scheduler.entity.Admin> adminOpt = adminRepo.findByEmail(identifier);
            if (adminOpt.isPresent()) {
                com.acadschedule.scheduler.entity.Admin admin = adminOpt.get();
                if (passwordEncoder.matches(password, admin.getPassword())) {
                    String preAuthToken = otpService.generateAndSendOtp(admin.getEmail());
                    return new LoginResponse(true, "OTP sent to email", preAuthToken);
                }
            }
        }

        // FACULTY LOGIN
        if ("faculty".equalsIgnoreCase(role)) {
            java.util.Optional<com.acadschedule.scheduler.entity.Faculty> facultyOpt = facultyRepo
                    .findByEmail(identifier);

            if (facultyOpt.isEmpty()) {
                facultyOpt = facultyRepo.findByEmployeeId(identifier);
            }

            if (facultyOpt.isPresent()) {
                com.acadschedule.scheduler.entity.Faculty f = facultyOpt.get();

                // Secure password check using PasswordEncoder
                if (f.getPassword() != null && passwordEncoder.matches(password, f.getPassword())) {
                    // Generate OTP
                    String email = f.getEmail();
                    if (email == null || email.isEmpty()) {
                        return new LoginResponse(false, "Faculty email not configured", null, null);
                    }
                    String preAuthToken = otpService.generateAndSendOtp(email);
                    return new LoginResponse(true, "OTP sent to email", preAuthToken);
                }
            } else {
                return new LoginResponse(false, "Faculty record not found", null, null);
            }
        }

        return new LoginResponse(false, "Invalid credentials", null, null);
    }

    @PostMapping("/admin/change-password")
    public org.springframework.http.ResponseEntity<?> changeAdminPassword(
            @RequestBody com.acadschedule.scheduler.dto.AdminPasswordChangeRequest request) {

        java.util.List<com.acadschedule.scheduler.entity.Admin> admins = adminRepo.findAll();
        if (admins.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Admin not found"));
        }

        com.acadschedule.scheduler.entity.Admin admin = admins.get(0);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            return org.springframework.http.ResponseEntity.status(400)
                    .body(java.util.Map.of("message", "Current password is incorrect"));
        }

        // Verify new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return org.springframework.http.ResponseEntity.status(400)
                    .body(java.util.Map.of("message", "Passwords do not match"));
        }

        // Update password
        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepo.save(admin);

        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
    }

    @PostMapping("/verify-otp")
    public LoginResponse verifyOtp(@RequestBody com.acadschedule.scheduler.dto.OtpVerifyRequest request) {
        if (!otpService.verifyOtp(request.getPreAuthToken(), request.getOtp())) {
            return new LoginResponse(false, "Invalid or expired OTP", null, null);
        }

        String role = request.getRole();
        String identifier = request.getIdentifier();

        if ("admin".equalsIgnoreCase(role)) {
            java.util.Optional<com.acadschedule.scheduler.entity.Admin> adminOpt = adminRepo.findByEmail(identifier);
            if (adminOpt.isPresent()) {
                com.acadschedule.scheduler.entity.Admin a = adminOpt.get();
                UserData adminData = new UserData(
                        a.getId(),
                        "Admin User",
                        a.getEmail(),
                        "CSE",
                        "ADMIN001");
                return new LoginResponse(true, "Admin login success", "admin", adminData);
            }
        }

        if ("faculty".equalsIgnoreCase(role)) {
            java.util.Optional<com.acadschedule.scheduler.entity.Faculty> facultyOpt = facultyRepo
                    .findByEmail(identifier);

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
                        f.getEmployeeId());
                return new LoginResponse(true, "Faculty login success", "faculty", ud);
            }
        }

        return new LoginResponse(false, "User not found after OTP verification", null, null);
    }
}
