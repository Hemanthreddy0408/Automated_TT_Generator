package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.service.RoomService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.findAll();
    }

    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomService.save(room);
    }

    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        Room room = roomService.findById(id);
        room.setName(roomDetails.getName());
        room.setCode(roomDetails.getCode());
        room.setBuilding(roomDetails.getBuilding());
        room.setFloor(roomDetails.getFloor());
        room.setType(roomDetails.getType());
        room.setCapacity(roomDetails.getCapacity());
        room.setEquipment(roomDetails.getEquipment());
        room.setStatus(roomDetails.getStatus());
        room.setActive(roomDetails.isActive());
        room.setWheelchairAccessible(roomDetails.isWheelchairAccessible());
        return roomService.save(room);
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable Long id) {
        roomService.deleteById(id);
    }
}