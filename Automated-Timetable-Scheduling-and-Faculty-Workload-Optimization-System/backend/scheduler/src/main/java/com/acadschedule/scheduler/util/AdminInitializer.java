package com.acadschedule.scheduler.util;

import com.acadschedule.scheduler.entity.Admin;
import com.acadschedule.scheduler.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.findByEmail("admin@acadschedule.com").isEmpty()) {
            Admin admin = new Admin();
            admin.setEmail("admin@acadschedule.com");
            // Seed with hashed initial password
            admin.setPassword(passwordEncoder.encode("password123"));
            adminRepository.save(admin);
            System.out.println("Default Admin seeded successfully!");
        }
    }
}
