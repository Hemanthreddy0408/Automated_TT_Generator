package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class TimetableConflictService {

    private final TimetableRepository timetableRepo;

    public TimetableConflictService(TimetableRepository timetableRepo) {
        this.timetableRepo = timetableRepo;
    }

    /**
     * Checks for conflicts for a given entry.
     * Returns a list of conflict messages.
     */
    public List<String> checkConflicts(TimetableEntry entry) {
        List<String> conflicts = new ArrayList<>();
        List<TimetableEntry> allEntries = timetableRepo.findAll();

        for (TimetableEntry existing : allEntries) {
            // Skip the entry itself if it's an update
            if (entry.getId() != null && Objects.equals(existing.getId(), entry.getId())) {
                continue;
            }

            // Check if it's the same day and time slot
            if (Objects.equals(existing.getDay(), entry.getDay()) &&
                Objects.equals(existing.getTimeSlot(), entry.getTimeSlot())) {

                // 1. Faculty Conflict
                if (entry.getFacultyName() != null && !entry.getFacultyName().equals("TBA") &&
                    Objects.equals(existing.getFacultyName(), entry.getFacultyName())) {
                    conflicts.add("Faculty " + entry.getFacultyName() + " is already teaching Section " + existing.getSectionId() + " at this time.");
                }

                // 2. Room Conflict
                if (entry.getRoomNumber() != null && !entry.getRoomNumber().equals("TBA") &&
                    Objects.equals(existing.getRoomNumber(), entry.getRoomNumber())) {
                    conflicts.add("Room " + entry.getRoomNumber() + " is already occupied by Section " + existing.getSectionId() + " at this time.");
                }

                // 3. Section Conflict (shouldn't happen in a well-managed UI, but safety first)
                if (Objects.equals(existing.getSectionId(), entry.getSectionId())) {
                    conflicts.add("Section " + entry.getSectionId() + " already has a " + existing.getType() + " at this time.");
                }
            }
        }

        return conflicts;
    }
}
