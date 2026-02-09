package com.acadschedule.scheduler.dto;
import com.acadschedule.scheduler.dto.UserData;

public class LoginRequest {
    private String identifier; // email or employeeId
    private String password;
    private String role; // "admin" or "faculty"

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String identifier, String password, String role) {
        this.identifier = identifier;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
