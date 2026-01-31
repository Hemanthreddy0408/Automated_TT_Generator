package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;
    private String building;
    private String floor;

    @Enumerated(EnumType.STRING)
    private RoomType type;

    private int capacity;

    @ElementCollection
    private List<String> equipment;

    private boolean active;
    private boolean wheelchairAccessible;
}
