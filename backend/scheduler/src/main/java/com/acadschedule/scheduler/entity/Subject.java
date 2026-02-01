package com.acadschedule.scheduler.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private String department;
    private int credits;

    private int lectureHoursPerWeek;
    private int tutorialHoursPerWeek;
    private int labHoursPerWeek;

    private boolean isElective;
    @ElementCollection
    private List<String> eligibleFaculty = new ArrayList<>(); 
}
