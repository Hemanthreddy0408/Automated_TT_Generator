package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.TimetableRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class TimetableGenerationService {

    private final TimetableRepository timetableRepo;

    public TimetableGenerationService(TimetableRepository timetableRepo) {
        this.timetableRepo = timetableRepo;
    }

    private static final List<String> DAYS = Arrays.asList(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"
    );

    private static final List<String> TIME_SLOTS = Arrays.asList(
            "08:00-08:50",
            "09:00-09:50",
            "10:00-10:50",
            "10:30-10:45", // BREAK
            "11:00-11:50",
            "12:00-12:50",
            "01:15-02:05", // LUNCH
            "02:10-03:00",
            "03:10-04:00",
            "04:10-05:00"
    );

    public void generateForSection(Long sectionId) {

        // Clear old timetable
        timetableRepo.deleteBySectionId(sectionId);

        for (String day : DAYS) {
            for (String slot : TIME_SLOTS) {

                if ("10:30-10:45".equals(slot)) {
                    saveSpecial(sectionId, day, slot, "BREAK");
                    continue;
                }

                if ("01:15-02:05".equals(slot)) {
                    saveSpecial(sectionId, day, slot, "LUNCH");
                    continue;
                }

                // Example allocation
                if (!"02:10-03:00".equals(slot)) continue;

                if (canAssign("Dr. Smith", "R-101", day, slot)) {
                    TimetableEntry entry = new TimetableEntry();
                    entry.setSectionId(sectionId);
                    entry.setDay(day);
                    entry.setTimeSlot(slot);
                    entry.setSubjectCode("23CSE311");
                    entry.setFacultyName("Dr. Smith");
                    entry.setRoomNumber("R-101");
                    entry.setType("LECTURE");

                    timetableRepo.save(entry);
                }
            }
        }
    }

    private boolean canAssign(String faculty, String room, String day, String slot) {
        return !timetableRepo.existsByFacultyNameAndDayAndTimeSlot(faculty, day, slot)
                && !timetableRepo.existsByRoomNumberAndDayAndTimeSlot(room, day, slot);
    }

    private void saveSpecial(Long sectionId, String day, String slot, String type) {
        TimetableEntry entry = new TimetableEntry();
        entry.setSectionId(sectionId);
        entry.setDay(day);
        entry.setTimeSlot(slot);
        entry.setType(type);
        timetableRepo.save(entry);
    }
}
