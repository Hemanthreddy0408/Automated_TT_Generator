package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
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

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String building;

    private String floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;

    @Column(nullable = false)
    private int capacity;
    
    // New Status Field for Drafts

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.PUBLISHED;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
        name = "room_equipment",
        joinColumns = @JoinColumn(name = "room_id")
    )
    @Column(name = "equipment")
    private List<String> equipment = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean wheelchairAccessible = false;
}