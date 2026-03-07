package com.acadschedule.scheduler.dto;

public class OtpVerifyRequest {
    private String preAuthToken;
    private String otp;

    // For admin vs faculty since the verify step needs to know what to return if
    // there is no session cache
    private String identifier;
    private String role;

    public String getPreAuthToken() {
        return preAuthToken;
    }

    public void setPreAuthToken(String preAuthToken) {
        this.preAuthToken = preAuthToken;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
