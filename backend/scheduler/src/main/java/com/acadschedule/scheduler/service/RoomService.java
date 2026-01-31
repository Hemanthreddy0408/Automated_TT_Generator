package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.repository.RoomRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public Room save(Room room) {
        return roomRepository.save(room);
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public void delete(Long id) {
        roomRepository.deleteById(id);
    }
}
