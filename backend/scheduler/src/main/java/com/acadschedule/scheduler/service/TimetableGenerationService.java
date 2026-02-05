package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TimetableGenerationService {

    private final TimetableRepository timetableRepo;
    private final FacultyRepository facultyRepo;
    private final RoomRepository roomRepo;
    private final SubjectRepository subjectRepo;

    public TimetableGenerationService(
            TimetableRepository timetableRepo,
            FacultyRepository facultyRepo,
            RoomRepository roomRepo,
            SubjectRepository subjectRepo
    ) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.roomRepo = roomRepo;
        this.subjectRepo = subjectRepo;
    }

    private static final List<String> DAYS =
            List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

    private static final List<String> SLOTS = List.of(
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

    // ================= MAIN ENTRY =================

    @Transactional
    public void generateForSection(String sectionId) {

        timetableRepo.deleteBySectionId(sectionId);

        List<Faculty> faculties = facultyRepo.findAll().stream()
                .filter(Faculty::isActive).toList();

        List<Room> rooms = roomRepo.findAll().stream()
                .filter(Room::isActive).toList();

        List<Subject> subjects = subjectRepo.findAll();

        if (faculties.isEmpty() || rooms.isEmpty() || subjects.isEmpty()) {
            throw new RuntimeException("Missing Faculty / Room / Subject data");
        }

        // workload tracking
        Map<Long, Integer> weeklyLoad = new HashMap<>();
        Map<String, Map<Long, Integer>> dailyLoad = new HashMap<>();
        DAYS.forEach(d -> dailyLoad.put(d, new HashMap<>()));

        // remaining hours per subject
        Map<Long, Integer> remaining = new HashMap<>();
        for (Subject s : subjects) {
            int total =
                    s.getLectureHoursPerWeek()
                    + s.getTutorialHoursPerWeek()
                    + s.getLabHoursPerWeek();
            remaining.put(s.getId(), total);
        }

        // DAY → SLOT driven scheduling
        for (String day : DAYS) {

            boolean gapToggle = false;

            for (int i = 0; i < SLOTS.size(); i++) {

                String slot = SLOTS.get(i);

                // fixed break
                if (slot.equals("10:30-10:45")) {
                    saveSpecial(sectionId, day, slot, "BREAK");
                    continue;
                }

                // fixed lunch
                if (slot.equals("01:15-02:05")) {
                    saveSpecial(sectionId, day, slot, "LUNCH");
                    continue;
                }

                // gap enforcement
                if (gapToggle) {
                    gapToggle = false;
                    continue;
                }

                Subject subject = pickNextSubject(subjects, remaining);
                if (subject == null) continue;

                boolean isLab = subject.getLabHoursPerWeek() >= 2;
                int duration = isLab ? 2 : 1;

                for (Faculty faculty : pickFacultiesByLoad(faculties, weeklyLoad)) {
                    for (Room room : rooms) {

                        if (!isFree(sectionId, faculty, room, day, i, duration))
                            continue;

                        placeSession(
                                sectionId,
                                subject,
                                faculty,
                                room,
                                day,
                                i,
                                duration,
                                weeklyLoad,
                                dailyLoad
                        );

                        remaining.put(
                                subject.getId(),
                                remaining.get(subject.getId()) - duration
                        );

                        gapToggle = true;
                        i += duration - 1;
                        break;
                    }
                    break;
                }
            }
        }
    }

    // ================= HELPERS =================

    private Subject pickNextSubject(
            List<Subject> subjects,
            Map<Long, Integer> remaining
    ) {
        return subjects.stream()
                .filter(s -> remaining.get(s.getId()) > 0)
                .findFirst()
                .orElse(null);
    }

    private List<Faculty> pickFacultiesByLoad(
            List<Faculty> faculties,
            Map<Long, Integer> weeklyLoad
    ) {
        return faculties.stream()
                .sorted(Comparator.comparingInt(
                        f -> weeklyLoad.getOrDefault(f.getId(), 0)
                ))
                .toList();
    }

    private boolean isFree(
            String sectionId,
            Faculty faculty,
            Room room,
            String day,
            int slotIndex,
            int duration
    ) {
        for (int i = 0; i < duration; i++) {

            if (slotIndex + i >= SLOTS.size()) return false;

            String slot = SLOTS.get(slotIndex + i);

            if (timetableRepo.existsBySectionIdAndDayAndTimeSlot(sectionId, day, slot))
                return false;

            if (timetableRepo.existsByFacultyNameAndDayAndTimeSlot(
                    faculty.getName(), day, slot))
                return false;

            if (timetableRepo.existsByRoomNumberAndDayAndTimeSlot(
                    room.getName(), day, slot))
                return false;
        }
        return true;
    }

    private void placeSession(
            String sectionId,
            Subject subject,
            Faculty faculty,
            Room room,
            String day,
            int slotIndex,
            int duration,
            Map<Long, Integer> weeklyLoad,
            Map<String, Map<Long, Integer>> dailyLoad
    ) {
        for (int d = 0; d < duration; d++) {
            saveEntry(
                    sectionId,
                    subject,
                    faculty,
                    room,
                    day,
                    SLOTS.get(slotIndex + d),
                    duration > 1 ? "LAB" : "LECTURE"
            );
        }

        weeklyLoad.put(
                faculty.getId(),
                weeklyLoad.getOrDefault(faculty.getId(), 0) + duration
        );

        dailyLoad.get(day).put(
                faculty.getId(),
                dailyLoad.get(day).getOrDefault(faculty.getId(), 0) + duration
        );
    }

    private void saveEntry(
            String sectionId,
            Subject subject,
            Faculty faculty,
            Room room,
            String day,
            String slot,
            String type
    ) {
        TimetableEntry e = new TimetableEntry();
        e.setSectionId(sectionId);
        e.setDay(day);
        e.setTimeSlot(slot);
        e.setSubjectCode(subject.getCode());
        e.setFacultyName(faculty.getName());
        e.setRoomNumber(room.getName());
        e.setType(type);
        timetableRepo.save(e);
    }

    private void saveSpecial(
            String sectionId,
            String day,
            String slot,
            String type
    ) {
        TimetableEntry e = new TimetableEntry();
        e.setSectionId(sectionId);
        e.setDay(day);
        e.setTimeSlot(slot);
        e.setType(type);
        timetableRepo.save(e);
    }
}
