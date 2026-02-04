package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.entity.RoomStatus; // Add this import
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Add this import

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(RoomStatus status);
}