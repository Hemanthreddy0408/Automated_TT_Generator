package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.dto.LoginRequest;
import com.acadschedule.scheduler.dto.LoginResponse;
import com.acadschedule.scheduler.dto.UserData;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final com.acadschedule.scheduler.repository.FacultyRepository facultyRepo;
    private final com.acadschedule.scheduler.service.OtpService otpService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthController(com.acadschedule.scheduler.repository.FacultyRepository facultyRepo,
            com.acadschedule.scheduler.service.OtpService otpService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.facultyRepo = facultyRepo;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
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

            String preAuthToken = otpService.generateAndSendOtp("admin@acadschedule.com");
            return new LoginResponse(true, "OTP sent to email", preAuthToken);
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
                    String email = f.getEmail() != null ? f.getEmail() : "faculty@acadschedule.com";
                    String preAuthToken = otpService.generateAndSendOtp(email);
                    return new LoginResponse(true, "OTP sent to email", preAuthToken);
                }
            } else {
                return new LoginResponse(false, "Faculty record not found", null, null);
            }
        }

        return new LoginResponse(false, "Invalid credentials", null, null);
    }

    @PostMapping("/verify-otp")
    public LoginResponse verifyOtp(@RequestBody com.acadschedule.scheduler.dto.OtpVerifyRequest request) {
        if (!otpService.verifyOtp(request.getPreAuthToken(), request.getOtp())) {
            return new LoginResponse(false, "Invalid or expired OTP", null, null);
        }

        String role = request.getRole();
        String identifier = request.getIdentifier();

        if ("admin".equalsIgnoreCase(role)) {
            UserData admin = new UserData(
                    1L,
                    "Admin User",
                    "admin@acadschedule.com",
                    "CSE",
                    "ADMIN001");
            return new LoginResponse(true, "Admin login success", "admin", admin);
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
