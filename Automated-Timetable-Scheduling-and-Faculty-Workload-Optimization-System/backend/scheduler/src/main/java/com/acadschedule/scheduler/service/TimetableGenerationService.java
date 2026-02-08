package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.FacultyRepository;
import com.acadschedule.scheduler.repository.RoomRepository;
import com.acadschedule.scheduler.repository.SubjectRepository;
import com.acadschedule.scheduler.repository.TimetableRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;

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

    private static final List<String> SLOTS = List.of(
            "08:00-08:50",
            "09:00-09:40",
            "09:40-10:45",
            "10:30-10:45", // BREAK
            "10:45-11:35",
            "11:35-12:25",
            "12:25-01:15", // LUNCH
            "01:15-02:05",
            "02:05-02:55",
            "02:55-03:45",
            "03:45-04:35",
            "04:35-05:25"
);

    // ================= MAIN ENTRY =================
    @Transactional
    public void generateForSection(String sectionId) {

        // 🔥 THIS NOW WORKS (inside transaction)
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
            int total = s.getLectureHoursPerWeek()
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

                // Attempt to assign
                boolean assigned = false;
                
                // Try to find a valid faculty and room
                List<Faculty> sortedFaculties = pickFacultiesByLoad(faculties, weeklyLoad);
                
                for (Faculty faculty : sortedFaculties) {
                    for (Room room : rooms) {
                        if (isFree(sectionId, faculty, room, day, i, duration)) {
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
                            
                            assigned = true;
                            gapToggle = true;
                            // Skip next slot if duration > 1
                            if (duration > 1) {
                                i += duration - 1;
                            }
                            break; 
                        }
                    }
                    if (assigned) break;
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
                .filter(sub -> remaining.get(sub.getId()) > 0)
                .findFirst()
                .orElse(null);
    }

    private List<Faculty> pickFacultiesByLoad(
            List<Faculty> faculties,
            Map<Long, Integer> weeklyLoad
    ) {
        return faculties.stream()
                .sorted(Comparator.comparingInt(
                        fac -> weeklyLoad.getOrDefault(fac.getId(), 0)
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
        TimetableEntry entry = new TimetableEntry();
        entry.setSectionId(sectionId);
        entry.setDay(day);
        entry.setTimeSlot(slot);
        entry.setType(type);
        timetableRepo.save(entry);
    }
}
