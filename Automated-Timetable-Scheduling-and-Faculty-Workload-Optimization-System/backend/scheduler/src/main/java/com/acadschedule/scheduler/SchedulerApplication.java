package com.acadschedule.scheduler;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import com.acadschedule.scheduler.entity.Announcement;
import com.acadschedule.scheduler.repository.AnnouncementRepository;
import com.acadschedule.scheduler.repository.FacultyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SchedulerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchedulerApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(FacultyRepository facultyRepo, AnnouncementRepository announcementRepo) {
        return args -> {
            // Seeding Announcements only if empty - keeping institutional info generic
            if (announcementRepo.count() == 0) {
                announcementRepo.save(new Announcement(
                    "Academic Portal Maintenance",
                    "The portal will be undergoing maintenance this weekend for performance improvements.",
                    "System",
                    "bg-blue-100 text-blue-800"
                ));
                announcementRepo.save(new Announcement(
                    "Semester Timetable Published",
                    "The updated timetable for the current semester is now live and synced.",
                    "General",
                    "bg-green-100 text-green-700"
                ));
                System.out.println(">>> Initial Announcement data created.");
            }
            
            System.out.println(">>> Backend started. Total faculty in database: " + facultyRepo.count());
        };
    }
}
