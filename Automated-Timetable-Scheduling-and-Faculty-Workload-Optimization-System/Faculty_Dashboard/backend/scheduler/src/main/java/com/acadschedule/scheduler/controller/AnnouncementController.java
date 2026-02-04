package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Announcement;
import com.acadschedule.scheduler.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository repository;

    @GetMapping
    public List<Announcement> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement announcement) {
        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now());
        }
        return repository.save(announcement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
