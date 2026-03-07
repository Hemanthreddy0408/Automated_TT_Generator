package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.UserOtp;
import com.acadschedule.scheduler.repository.UserOtpRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class OtpService {

    private final UserOtpRepository userOtpRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public OtpService(UserOtpRepository userOtpRepository, JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.userOtpRepository = userOtpRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String generateAndSendOtp(String email) {
        // Clean up old OTPs for this email to prevent spam/clutter
        userOtpRepository.deleteByEmail(email);

        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        System.out.println("=======================================================================");
        System.out.println("OTP GENERATED FOR " + email + " : " + otp);
        System.out.println("=======================================================================");

        // Hash it
        String hashedOtp = passwordEncoder.encode(otp);

        // Generate preAuthToken to map the session
        String preAuthToken = UUID.randomUUID().toString();

        UserOtp userOtp = new UserOtp(
                email,
                hashedOtp,
                LocalDateTime.now().plusMinutes(5),
                preAuthToken);
        userOtpRepository.save(userOtp);

        sendOtpEmail(email, otp);

        return preAuthToken;
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Login OTP - Automated Timetable System");
            message.setText("Your OTP for login is: " + otp + "\n\nThis OTP is valid for 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
            // In a real system, we might handle this differently, but we catch it
            // to allow testing even if the dummy email config fails.
        }
    }

    @Transactional
    public boolean verifyOtp(String preAuthToken, String otp) {
        Optional<UserOtp> otpOpt = userOtpRepository.findByPreAuthToken(preAuthToken);
        if (otpOpt.isEmpty()) {
            return false;
        }

        UserOtp userOtp = otpOpt.get();

        if (userOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            userOtpRepository.delete(userOtp);
            return false;
        }

        if (passwordEncoder.matches(otp, userOtp.getOtpHash())) {
            userOtpRepository.delete(userOtp); // OTP consumed
            return true;
        }

        return false;
    }
}
