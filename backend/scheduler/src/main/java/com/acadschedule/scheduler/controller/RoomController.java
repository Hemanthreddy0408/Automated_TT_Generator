package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.service.RoomService;

import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")

public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // GET all rooms
    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.findAll();   // ✅ FIXED
    }

    // CREATE room
    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomService.save(room);  // ✅ FIXED
    }

    @PostConstruct
    public void init() {
        System.out.println("RoomController LOADED");
    }
}
