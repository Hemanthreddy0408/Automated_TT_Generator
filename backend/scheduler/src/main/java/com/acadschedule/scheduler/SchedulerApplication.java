package com.acadschedule.scheduler;

import com.acadschedule.scheduler.entity.Announcement;
import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.repository.AnnouncementRepository;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class SchedulerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchedulerApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(FacultyRepository facultyRepo, AnnouncementRepository announcementRepo) {
        return args -> {
            // 1. Initialize Faculty if not exists
            if (facultyRepo.count() == 0) {
                Faculty f = new Faculty();
                f.setName("Dr. Sarah Mitchell");
                f.setEmail("sarah.m@university.edu");
                f.setDepartment("Computer Science");
                f.setDesignation("Associate Professor");
                f.setEmployeeId("FAC001");
                f.setMaxHoursPerDay(6);
                f.setMaxHoursPerWeek(18);
                f.setEligibleSubjects(Arrays.asList("Data Structures", "Algorithms", "Operating Systems"));
                f.setQualifications(Arrays.asList("Ph.D. in Computer Science", "M.Tech in Software Engineering"));
                f.setActive(true);
                facultyRepo.save(f);
                System.out.println(">>> Initial Faculty data created.");
            }

            // 2. Initialize Announcements if not exists
            if (announcementRepo.count() == 0) {
                announcementRepo.save(new Announcement(
                    "Emergency Server Maintenance & Portal Downtime",
                    "Please be advised that the academic portal will be inaccessible this Sunday for critical security patches.",
                    "Urgent",
                    "bg-red-100 text-red-800"
                ));
                announcementRepo.save(new Announcement(
                    "Upcoming Mid-Semester Break Schedule",
                    "The institution will remain closed from November 1st to November 5th for the mid-semester break.",
                    "Holiday",
                    "bg-green-100 text-green-700"
                ));
                System.out.println(">>> Initial Announcement data created.");
            }
        };
    }
}
