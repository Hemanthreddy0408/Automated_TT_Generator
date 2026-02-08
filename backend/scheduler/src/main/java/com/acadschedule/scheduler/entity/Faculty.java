package com.acadschedule.scheduler.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String department;
    private String designation;
    private String employeeId;

    private String avatarUrl;

    private int maxHoursPerDay;
    private int maxHoursPerWeek;

    @ElementCollection
    private List<String> qualifications;

    private String specialization;

    @ElementCollection
    private List<String> eligibleSubjects;
    @JsonProperty("isActive")
    private boolean isActive;
}
