package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_otp")
public class UserOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otpHash; // Hashed OTP

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private String preAuthToken; // Temporary token mapped to this OTP request

    public UserOtp() {
    }

    public UserOtp(String email, String otpHash, LocalDateTime expiryTime, String preAuthToken) {
        this.email = email;
        this.otpHash = otpHash;
        this.expiryTime = expiryTime;
        this.preAuthToken = preAuthToken;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public String getPreAuthToken() {
        return preAuthToken;
    }

    public void setPreAuthToken(String preAuthToken) {
        this.preAuthToken = preAuthToken;
    }
}
