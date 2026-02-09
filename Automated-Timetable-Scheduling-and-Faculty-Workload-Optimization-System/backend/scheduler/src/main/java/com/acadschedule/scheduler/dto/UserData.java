package com.acadschedule.scheduler.dto;

public class UserData {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String employeeId;

    public UserData() {}

    public UserData(Long id, String name, String email, String department, String employeeId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.employeeId = employeeId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
}
