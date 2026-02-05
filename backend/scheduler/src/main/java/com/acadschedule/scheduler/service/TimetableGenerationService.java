package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class TimetableGenerationService {

    private final TimetableRepository timetableRepo;
    private final FacultyRepository facultyRepo;
    private final SubjectRepository subjectRepo;
    private final RoomRepository roomRepo;

    public TimetableGenerationService(
            TimetableRepository timetableRepo,
            FacultyRepository facultyRepo,
            SubjectRepository subjectRepo,
            RoomRepository roomRepo
    ) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.roomRepo = roomRepo;
    }

    private static final List<String> DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"
    );

    private static final List<String> TIME_SLOTS = List.of(
            "08:00-08:50",
            "09:00-09:50",
            "10:00-10:50",
            "10:30-10:45",
            "11:00-11:50",
            "12:00-12:50",
            "01:15-02:05",
            "02:10-03:00",
            "03:10-04:00",
            "04:10-05:00"
    );

    public void generateForSection(String sectionId) {

        // 🔥 THIS NOW WORKS (inside transaction)
        timetableRepo.deleteBySectionId(sectionId);

        List<Faculty> faculties = facultyRepo.findAll();
        List<Subject> subjects = subjectRepo.findAll();
        List<Room> rooms = roomRepo.findAll();

        if (faculties.isEmpty() || subjects.isEmpty() || rooms.isEmpty()) {
            throw new RuntimeException("Faculty / Subject / Room missing");
        }

        int f = 0, s = 0, r = 0;

        for (String day : DAYS) {
            for (String slot : TIME_SLOTS) {

                if (slot.equals("10:30-10:45")) {
                    saveSpecial(sectionId, day, slot, "BREAK");
                    continue;
                }

                if (slot.equals("01:15-02:05")) {
                    saveSpecial(sectionId, day, slot, "LUNCH");
                    continue;
                }

                Faculty faculty = faculties.get(f % faculties.size());
                Subject subject = subjects.get(s % subjects.size());
                Room room = rooms.get(r % rooms.size());

                TimetableEntry entry = new TimetableEntry();
                entry.setSectionId(sectionId);
                entry.setDay(day);
                entry.setTimeSlot(slot);
                entry.setSubjectCode(subject.getCode());
                entry.setFacultyName(faculty.getName());
                entry.setRoomNumber(room.getName());

                entry.setType(
                        subject.getLabHoursPerWeek() > 0
                                ? "LAB"
                                : "LECTURE"
                );

                timetableRepo.save(entry);

                f++; s++; r++;
            }
        }
    }

    private void saveSpecial(
            String sectionId,
            String day,
            String slot,
            String type
    ) {
        TimetableEntry entry = new TimetableEntry();
        entry.setSectionId(sectionId);
        entry.setDay(day);
        entry.setTimeSlot(slot);
        entry.setType(type);
        timetableRepo.save(entry);
    }
}
