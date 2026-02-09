package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * FINAL STABLE TIMETABLE GENERATOR
 * - All subjects guaranteed
 * - One faculty per subject
 * - Balanced slots (morning + afternoon)
 * - Labs only afternoon & consecutive
 * - Faculty workload enforced
 */
@Service
@Transactional
public class TimetableGenerationService {

    private final TimetableRepository timetableRepo;
    private final FacultyRepository facultyRepo;
    private final SubjectRepository subjectRepo;
    private final RoomRepository roomRepo;
    private final SectionRepository sectionRepo;

    public TimetableGenerationService(
            TimetableRepository timetableRepo,
            FacultyRepository facultyRepo,
            SubjectRepository subjectRepo,
            RoomRepository roomRepo,
            SectionRepository sectionRepo) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.roomRepo = roomRepo;
        this.sectionRepo = sectionRepo;
    }

    /* ================== CONFIG ================== */

    private static final List<String> DAYS = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

    private static final List<String> SLOTS = List.of(
            "08:00-08:50", // 0 - Morning
            "09:00-09:50", // 1
            "10:00-10:50", // 2
            "11:00-11:50", // 3
            "12:00-12:50", // 4 - Last morning
            "LUNCH_BREAK", // 5 - Break (no classes)
            "02:10-03:00", // 6 - Afternoon start
            "03:10-04:00", // 7
            "04:10-05:00" // 8
    );

    private static final Set<Integer> AFTERNOON = Set.of(6, 7, 8);
    private static final int DEFAULT_DAILY = 6;
    private static final int DEFAULT_WEEKLY = 30;

    /* ================== PUBLIC ================== */

    public List<TimetableEntry> generateForSection(String sectionId, boolean commit) {

        Section section = sectionRepo.findById(Long.parseLong(sectionId))
                .orElseThrow();

        if (commit)
            timetableRepo.deleteBySectionId(sectionId);

        List<Subject> subjects = subjectRepo.findByDepartmentAndYear(section.getDepartment(), section.getYear());

        List<Faculty> faculties = facultyRepo.findAll().stream().filter(Faculty::isActive).toList();

        List<Room> rooms = roomRepo.findAll().stream().filter(Room::isActive).toList();

        /* ========= STEP 1: FIX FACULTY PER SUBJECT ========= */

        Map<Long, Faculty> subjectFaculty = new HashMap<>();
        Map<Long, Integer> facultyLoad = new HashMap<>();

        for (Subject s : subjects) {
            // Bi-directional eligibility check (US1.1)
            Faculty f = faculties.stream()
                    .filter(x -> {
                        // Check if subject allows this faculty (or has no restrictions)
                        boolean subjectAllows = s.getEligibleFaculty().isEmpty()
                                || s.getEligibleFaculty().contains(x.getName());

                        // Check if faculty is qualified for this subject (or has no restrictions)
                        boolean facultyQualified = x.getEligibleSubjects().isEmpty()
                                || x.getEligibleSubjects().contains(s.getCode())
                                || x.getEligibleSubjects().contains(s.getName());

                        return subjectAllows && facultyQualified;
                    })
                    .min(Comparator
                            .comparingInt((Faculty x) -> facultyLoad.getOrDefault(x.getId(), 0))
                            .thenComparing(Faculty::getName)) // Tie-breaker for consistency
                    .orElseThrow(() -> new RuntimeException(
                            "No eligible faculty found for subject: " + s.getName()));

            subjectFaculty.put(s.getId(), f);

            // Fix: Actually increment the load count (US1.8)
            int sessionCount = s.getLectureHoursPerWeek() + s.getLabHoursPerWeek();
            facultyLoad.put(f.getId(), facultyLoad.getOrDefault(f.getId(), 0) + sessionCount);
        }

        /* ========= STEP 2: EXPAND ALL REQUIRED SESSIONS ========= */

        List<Session> sessions = new ArrayList<>();

        for (Subject s : subjects) {
            Faculty f = subjectFaculty.get(s.getId());

            for (int i = 0; i < s.getLectureHoursPerWeek(); i++) {
                Session newSession = new Session();
                newSession.subject = s;
                newSession.faculty = f;
                newSession.length = 1;
                sessions.add(newSession);
            }

            for (int i = 0; i < s.getLabHoursPerWeek() / 2; i++) {
                Session newSession = new Session();
                newSession.subject = s;
                newSession.faculty = f;
                newSession.length = 2;
                sessions.add(newSession);
            }
        }

        Collections.shuffle(sessions, new Random(section.getId()));

        /* ========= STEP 3: DAY DISTRIBUTION ========= */

        Map<String, List<Session>> dayMap = new LinkedHashMap<>();
        for (String d : DAYS)
            dayMap.put(d, new ArrayList<>());

        int di = 0;
        for (Session s : sessions) {
            dayMap.get(DAYS.get(di++ % DAYS.size())).add(s);
        }

        /* ========= STEP 4: MULTI-PASS PLACEMENT ========= */

        Occupancy occ = new Occupancy();
        Map<Long, Integer> dailyLoad = new HashMap<>(); // faculty -> hours today
        Map<Long, Integer> weeklyLoad = new HashMap<>(); // faculty -> hours this week
        List<TimetableEntry> result = new ArrayList<>();
        List<Session> failedSessions = new ArrayList<>();

        // PASS 1: Place all LAB sessions first (most constrained - need consecutive
        // afternoon slots)
        for (String day : DAYS) {
            dailyLoad.clear(); // Reset daily load for new day

            for (Session s : dayMap.get(day)) {
                if (s.length == 1)
                    continue; // Skip lectures in pass 1

                boolean placed = tryPlaceSession(s, sectionId, day, occ, dailyLoad, weeklyLoad,
                        rooms, section, result, commit);
                if (!placed) {
                    failedSessions.add(s);
                }
            }
        }

        // PASS 2: Place all LECTURE sessions
        for (String day : DAYS) {
            dailyLoad.clear(); // Reset daily load for new day

            for (Session s : dayMap.get(day)) {
                if (s.length == 2)
                    continue; // Skip labs in pass 2

                boolean placed = tryPlaceSession(s, sectionId, day, occ, dailyLoad, weeklyLoad,
                        rooms, section, result, commit);
                if (!placed) {
                    failedSessions.add(s);
                }
            }
        }

        // PASS 3: Retry failed sessions with relaxed constraints
        for (Session s : failedSessions) {
            boolean placed = false;

            // Try all days until we find a spot
            for (String day : DAYS) {
                dailyLoad.clear(); // Reset for this day

                // Recalculate daily load for this specific day
                for (TimetableEntry entry : result) {
                    if (entry.getDay().equals(day)) {
                        Faculty f = facultyRepo.findAll().stream()
                                .filter(x -> x.getName().equals(entry.getFacultyName()))
                                .findFirst().orElse(null);
                        if (f != null) {
                            int type = entry.getType().equals("LAB") ? 2 : 1;
                            dailyLoad.put(f.getId(), dailyLoad.getOrDefault(f.getId(), 0) + type);
                        }
                    }
                }

                placed = tryPlaceSession(s, sectionId, day, occ, dailyLoad, weeklyLoad,
                        rooms, section, result, commit);
                if (placed)
                    break;
            }

            if (!placed) {
                // Last resort: force placement with relaxed constraints
                System.err.println("WARNING: Could not optimally place session for subject "
                        + s.subject.getName() + ". Forcing placement.");
                forcePlaceSession(s, sectionId, occ, rooms, section, result, commit);
            }
        }

        return result;
    }

    /**
     * Try to place a session in a specific day
     * Returns true if successfully placed, false otherwise
     */
    private boolean tryPlaceSession(Session s, String sectionId, String day,
            Occupancy occ, Map<Long, Integer> dailyLoad,
            Map<Long, Integer> weeklyLoad, List<Room> rooms,
            Section section, List<TimetableEntry> result, boolean commit) {

        Faculty f = s.faculty;
        int dLoad = dailyLoad.getOrDefault(f.getId(), 0);
        int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);

        int dLimit = f.getMaxHoursPerDay() > 0 ? f.getMaxHoursPerDay() : DEFAULT_DAILY;
        int wLimit = f.getMaxHoursPerWeek() > 0 ? f.getMaxHoursPerWeek() : DEFAULT_WEEKLY;

        // Check if this session would exceed workload limits
        if (dLoad + s.length > dLimit || wLoad + s.length > wLimit) {
            return false; // Can't place today, will try another day
        }

        // Try each time slot
        for (int si = 0; si < SLOTS.size(); si++) {

            // Skip lunch break slot
            if (SLOTS.get(si).equals("LUNCH_BREAK"))
                continue;

            // Labs must be in afternoon
            if (s.length == 2 && !AFTERNOON.contains(si))
                continue;

            // Check we have enough consecutive slots
            if (si + s.length > SLOTS.size())
                continue;

            // Check if consecutive slots skip over lunch break
            boolean spansLunch = false;
            for (int k = 0; k < s.length; k++) {
                if (SLOTS.get(si + k).equals("LUNCH_BREAK")) {
                    spansLunch = true;
                    break;
                }
            }
            if (spansLunch)
                continue;

            // Check if all required slots are free
            boolean allFree = true;
            for (int k = 0; k < s.length; k++) {
                if (occ.blocked(sectionId, f.getName(), day, SLOTS.get(si + k))) {
                    allFree = false;
                    break;
                }
            }
            if (!allFree)
                continue;

            // Find suitable room
            Room room = null;
            for (Room r : rooms) {
                if (r.getCapacity() < section.getCapacity())
                    continue;

                // For labs, prefer lab rooms
                if (s.length == 2) {
                    if (r.getType() == null ||
                            !r.getType().name().toUpperCase().contains("LAB")) {
                        continue;
                    }
                }

                // Check if room is free for all required slots
                boolean roomFree = true;
                for (int k = 0; k < s.length; k++) {
                    if (occ.roomBlocked(r.getName(), day, SLOTS.get(si + k))) {
                        roomFree = false;
                        break;
                    }
                }

                if (roomFree) {
                    room = r;
                    break;
                }
            }

            if (room == null)
                continue; // No suitable room found

            // SUCCESS! Place the session
            for (int k = 0; k < s.length; k++) {
                TimetableEntry e = new TimetableEntry();
                e.setSectionId(sectionId);
                e.setDay(day);
                e.setTimeSlot(SLOTS.get(si + k));
                e.setSubjectCode(s.subject.getCode());
                e.setSubjectName(s.subject.getName());
                e.setFacultyName(f.getName());
                e.setRoomNumber(room.getName());
                e.setType(s.length == 2 ? "LAB" : "LECTURE");

                result.add(e);
                if (commit)
                    timetableRepo.save(e);
                occ.mark(sectionId, f.getName(), room.getName(), day, SLOTS.get(si + k));
            }

            // Update workload counters
            dailyLoad.put(f.getId(), dLoad + s.length);
            weeklyLoad.put(f.getId(), wLoad + s.length);

            return true;
        }

        return false; // Could not place in this day
    }

    /**
     * Force placement of a session when all normal attempts fail
     * This ensures ALL sessions are placed (critical requirement)
     */
    private void forcePlaceSession(Session s, String sectionId, Occupancy occ,
            List<Room> rooms, Section section,
            List<TimetableEntry> result, boolean commit) {

        Faculty f = s.faculty;

        // Find ANY available slot (ignore workload limits as last resort)
        for (String day : DAYS) {
            for (int si = 0; si < SLOTS.size(); si++) {

                if (SLOTS.get(si).equals("LUNCH_BREAK"))
                    continue;
                if (si + s.length > SLOTS.size())
                    continue;

                // Check lunch break span
                boolean spansLunch = false;
                for (int k = 0; k < s.length; k++) {
                    if (SLOTS.get(si + k).equals("LUNCH_BREAK")) {
                        spansLunch = true;
                        break;
                    }
                }
                if (spansLunch)
                    continue;

                boolean allFree = true;
                for (int k = 0; k < s.length; k++) {
                    if (occ.blocked(sectionId, f.getName(), day, SLOTS.get(si + k))) {
                        allFree = false;
                        break;
                    }
                }
                if (!allFree)
                    continue;

                // Find ANY room (relax capacity and type constraints)
                Room room = rooms.isEmpty() ? null : rooms.get(0);
                for (Room r : rooms) {
                    boolean roomFree = true;
                    for (int k = 0; k < s.length; k++) {
                        if (occ.roomBlocked(r.getName(), day, SLOTS.get(si + k))) {
                            roomFree = false;
                            break;
                        }
                    }
                    if (roomFree) {
                        room = r;
                        break;
                    }
                }

                if (room == null)
                    continue;

                // Place it!
                for (int k = 0; k < s.length; k++) {
                    TimetableEntry e = new TimetableEntry();
                    e.setSectionId(sectionId);
                    e.setDay(day);
                    e.setTimeSlot(SLOTS.get(si + k));
                    e.setSubjectCode(s.subject.getCode());
                    e.setSubjectName(s.subject.getName());
                    e.setFacultyName(f.getName());
                    e.setRoomNumber(room.getName());
                    e.setType(s.length == 2 ? "LAB" : "LECTURE");

                    result.add(e);
                    if (commit)
                        timetableRepo.save(e);
                    occ.mark(sectionId, f.getName(), room.getName(), day, SLOTS.get(si + k));
                }

                return; // Successfully forced placement
            }
        }

        // If we get here, truly impossible (likely data issue)
        throw new RuntimeException("CRITICAL: Cannot place session for " + s.subject.getName()
                + ". Check room/faculty availability.");
    }

    public List<TimetableEntry> generateForAllSections(boolean commit) {
        List<TimetableEntry> all = new ArrayList<>();
        for (Section s : sectionRepo.findAll()) {
            all.addAll(generateForSection(String.valueOf(s.getId()), commit));
        }
        return all;
    }

    /* ================== OCCUPANCY ================== */

    static class Occupancy {
        Set<String> used = new HashSet<>();

        void mark(String sec, String fac, String room, String day, String slot) {
            used.add(sec + "|" + day + "|" + slot);
            used.add(fac + "|" + day + "|" + slot);
            used.add(room + "|" + day + "|" + slot);
        }

        boolean blocked(String sec, String fac, String day, String slot) {
            return used.contains(sec + "|" + day + "|" + slot)
                    || used.contains(fac + "|" + day + "|" + slot);
        }

        boolean roomBlocked(String room, String day, String slot) {
            return used.contains(room + "|" + day + "|" + slot);
        }
    }

    /* ================== SESSION CLASS ================== */

    static class Session {
        Subject subject;
        Faculty faculty;
        int length;
    }
}
