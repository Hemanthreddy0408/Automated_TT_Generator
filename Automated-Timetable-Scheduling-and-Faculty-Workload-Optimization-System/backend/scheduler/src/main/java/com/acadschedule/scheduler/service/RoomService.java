package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.repository.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final AuditLogService auditLogService;

    public RoomService(RoomRepository roomRepository, AuditLogService auditLogService) {
        this.roomRepository = roomRepository;
        this.auditLogService = auditLogService;
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
    }

    /**
     * Save/Create a room and log the action.
     */
    public Room save(Room room) {
        Room saved = roomRepository.save(room);
        auditLogService.logAction("ROOM", "SAVE", 
            "Saved/Updated room: " + saved.getName() + " (Capacity: " + saved.getCapacity() + ")", "Admin", saved.getId());
        return saved;
    }

    /**
     * Delete a room by ID and log the action.
     */
    public void deleteById(Long id) {
        Room room = findById(id);
        roomRepository.deleteById(id);
        auditLogService.logAction("ROOM", "DELETE", 
            "Deleted room: " + room.getName(), "Admin", id);
    }
}