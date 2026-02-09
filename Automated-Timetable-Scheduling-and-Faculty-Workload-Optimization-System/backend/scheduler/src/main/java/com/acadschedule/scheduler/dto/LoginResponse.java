package com.acadschedule.scheduler.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String role;
    private UserData user;

    public LoginResponse() {}

    public LoginResponse(boolean success, String message, String role, UserData user) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.user = user;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public UserData getUser() { return user; }
    public void setUser(UserData user) { this.user = user; }
}
