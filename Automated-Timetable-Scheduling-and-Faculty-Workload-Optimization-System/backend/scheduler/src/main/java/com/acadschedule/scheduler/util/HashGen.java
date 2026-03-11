package com.acadschedule.scheduler.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("ADMIN_HASH=" + encoder.encode("password123"));
        System.out.println("FACULTY_HASH=" + encoder.encode("faculty123"));
    }
}
