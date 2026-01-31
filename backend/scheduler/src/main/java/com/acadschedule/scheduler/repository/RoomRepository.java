package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
