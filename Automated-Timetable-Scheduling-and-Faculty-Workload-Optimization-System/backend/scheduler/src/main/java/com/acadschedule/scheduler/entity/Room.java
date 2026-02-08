package com.acadschedule.scheduler.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
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

    @Column(name = "capacity")
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoomStatus status = RoomStatus.PUBLISHED;

    @ElementCollection
    @CollectionTable(name = "room_equipment", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "equipment")
    private List<String> equipment = new ArrayList<>();

    @Column(name = "active")
    private boolean active = true;

    @Column(name = "wheelchair_accessible")
    private boolean wheelchairAccessible = false;

    public String getName() { return name; }
    public String getCode() { return code; }
    public String getBuilding() { return building; }
    public String getFloor() { return floor; }
    public RoomType getType() { return type; }
    public int getCapacity() { return capacity; }
    public List<String> getEquipment() { return equipment; }
    public RoomStatus getStatus() { return status; }
    public boolean isActive() { return active; }
    public boolean isWheelchairAccessible() { return wheelchairAccessible; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setBuilding(String building) { this.building = building; }
    public void setFloor(String floor) { this.floor = floor; }

    public void setType(RoomType type) { this.type = type; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public void setStatus(RoomStatus status) { this.status = status; }
    public void setEquipment(List<String> equipment) { this.equipment = equipment; }
    public void setActive(boolean active) { this.active = active; }
    public void setWheelchairAccessible(boolean wheelchairAccessible) { this.wheelchairAccessible = wheelchairAccessible; }
}
