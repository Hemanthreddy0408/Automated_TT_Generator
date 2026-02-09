package com.acadschedule.scheduler.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/ping")
    public String ping() {
        return "{\"status\":\"ok\",\"message\":\"Backend is running\"}";
    }
}
