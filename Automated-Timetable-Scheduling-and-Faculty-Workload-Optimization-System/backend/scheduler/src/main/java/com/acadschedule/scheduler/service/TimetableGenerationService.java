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
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public TimetableGenerationService(
            TimetableRepository timetableRepo,
            FacultyRepository facultyRepo,
            SubjectRepository subjectRepo,
            RoomRepository roomRepo,
            SectionRepository sectionRepo,
            AuditLogService auditLogService,
            NotificationService notificationService) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.roomRepo = roomRepo;
        this.sectionRepo = sectionRepo;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    /* ================== CONFIG ================== */

    private static final Map<String, Set<String>> SYNONYMS = Map.ofEntries(
            Map.entry("PROGRAMMING", Set.of("CODING", "SOFTWARE", "SE")),
            Map.entry("NETWORKS", Set.of("CN", "NETWORK", "COMMUNICATION")),
            Map.entry("DATABASE", Set.of("DBMS", "DATA", "SQL")),
            Map.entry("AI", Set.of("ML", "INTELLIGENCE")),
            Map.entry("ML", Set.of("AI", "LEARNING")),
            Map.entry("MATHEMATICS", Set.of("MATH", "CALCULUS", "PROBABILITY", "DISCRETE")),
            Map.entry("HARDWARE", Set.of("DIGITAL", "ELECTRICAL", "ELECTRONICS")),
            Map.entry("SYSTEMS", Set.of("OS", "OPERATING")));

    private static final List<String> DAYS = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

    private static final List<String> TIME_SLOTS = List.of(
            "09:00-09:40",
            "09:40-10:30",
            "10:30-10:45", // BREAK
            "10:45-11:35",
            "11:35-12:25",
            "12:25-01:15",
            "LUNCH_BREAK",
            "02:05-02:55",
            "02:55-03:45",
            "03:45-04:35");

    /*
     * Slot indices:
     * 0: NO_CLASS (skip this slot)
     * 1-4: Morning TIME_SLOTS (09:00 to 12:50) - classes start here
     * 5: LUNCH_BREAK (no classes scheduled)
     * 6-8: Afternoon TIME_SLOTS (02:10 to 05:00)
     * 
     * Labs (2 consecutive hours) can be at:
     * - Morning: ONE lab starting at index 2 (TIME_SLOTS 2-3: 10:00-11:50)
     * - Afternoon: Labs starting at 6 or 7 (TIME_SLOTS 6-7 or 7-8)
     */

    private static final Set<Integer> AFTERNOON = Set.of(6, 7, 8);
    private static final Set<Integer> MORNING_LAB_TIME_SLOTS = Set.of(2); // Only slot 2 for morning labs
    private static final int DEFAULT_DAILY = 8;
    private static final int DEFAULT_WEEKLY = 45;

    /* ================== PUBLIC ================== */

    /**
     * Entry point for generating a single section's timetable.
     * Implements a retry logic to overcome random deadlocks in the allocation
     * engine.
     */
    public List<TimetableEntry> generateForSection(String sectionId, boolean commit) {

        int MAX_ATTEMPTS = 50;
        RuntimeException lastError = null;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                System.out.println("Attempt " + attempt + " for section " + sectionId);
                List<TimetableEntry> result = generateForSection(sectionId, commit, null, null, new HashMap<>());

                if (commit) {
                    auditLogService.logAction("TIMETABLE", "GENERATE",
                            "Generated timetable for Section ID: " + sectionId, "System/Admin");

                    notificationService.createAdminNotification(
                            "Timetable Generated",
                            "Timetable for Section ID " + sectionId + " was successfully generated.",
                            "TIMETABLE_SECTION_GENERATED");
                }

                return result;
            } catch (RuntimeException e) {
                lastError = e;
            }
        }

        throw new RuntimeException(
                "Failed after multiple attempts. Timetable likely over-constrained.",
                lastError);
    }

    /**
     * Generate timetable for a section with optional existing faculty load
     * tracking.
     * This overload is used by generateForAllSections() to track workload globally.
     * UPDATED: Added subject-to-faculty mapping for consistency
     */
    public List<TimetableEntry> generateForSection(
            String sectionId,
            boolean commit,
            Map<Long, Integer> existingFacultyLoad,
            Occupancy globalOcc,
            Map<String, Long> subjectToFacultyMap) {

        Section section = sectionRepo.findById(Long.parseLong(sectionId))
                .orElseThrow();

        if (commit)
            timetableRepo.deleteBySectionId(sectionId);

        List<Subject> subjects = subjectRepo.findByDepartmentAndYear(section.getDepartment(), section.getYear());

        List<Faculty> faculties = facultyRepo.findAll().stream().filter(Faculty::isActive).toList();

        List<Room> rooms = roomRepo.findAll().stream().filter(Room::isActive).toList();

        // Initialize with existing load if provided (for global tracking across
        // sections)
        Map<Long, Integer> weeklyLoad = new HashMap<>(
                existingFacultyLoad != null ? existingFacultyLoad : new HashMap<>());

        /* ========= STEP 2: EXPAND ALL REQUIRED SESSIONS ========= */

        List<Session> sessions = new ArrayList<>();

        for (Subject s : subjects) {
            int lectureHours = lectureHours(s);
            int labSessions = labSessions(s);

            // Create lecture sessions
            for (int i = 0; i < lectureHours; i++) {
                Session lec = new Session();
                lec.subject = s;
                lec.length = 1;
                sessions.add(lec);
            }

            // Create lab sessions (2 consecutive TIME_SLOTS)
            for (int i = 0; i < labSessions; i++) {
                Session lab = new Session();
                lab.subject = s;
                lab.length = 2;
                sessions.add(lab);
            }
        }

        Collections.shuffle(sessions, new Random(section.getId()));

        /* ========= STEP 3: MULTI-PASS PLACEMENT ========= */

        Occupancy occ = globalOcc != null ? globalOcc : new Occupancy();
        List<TimetableEntry> result = new ArrayList<>();
        List<Session> failedSessions = new ArrayList<>();

        // Track state across days for this section
        Map<String, Map<Long, Integer>> dailyWorkloads = new HashMap<>();
        Map<String, Integer> morningLabCounts = new HashMap<>();
        Map<String, Integer> sectionDailyLoad = new HashMap<>();
        for (String d : DAYS) {
            dailyWorkloads.put(d, new HashMap<>());
            morningLabCounts.put(d, 0);
            sectionDailyLoad.put(d, 0);
        }

        // PASS 1: Place all LAB sessions (most constrained)
        for (Session s : sessions) {
            if (s.length != 2)
                continue;

            boolean placed = false;
            List<String> shuffledDays = new ArrayList<>(DAYS);
            Collections.shuffle(shuffledDays);

            for (String day : shuffledDays) {
                if (tryPlaceSession(s, sectionId, day, occ, dailyWorkloads.get(day), weeklyLoad,
                        rooms, faculties, section, result, commit, morningLabCounts, sectionDailyLoad,
                        subjectToFacultyMap)) {
                    placed = true;
                    break;
                }
            }
            if (!placed)
                failedSessions.add(s);
        }

        // PASS 2: Place all LECTURE sessions
        for (Session s : sessions) {
            if (s.length != 1)
                continue;

            boolean placed = false;
            List<String> shuffledDays = new ArrayList<>(DAYS);
            Collections.shuffle(shuffledDays);

            for (String day : shuffledDays) {
                if (tryPlaceSession(s, sectionId, day, occ, dailyWorkloads.get(day), weeklyLoad,
                        rooms, faculties, section, result, commit, morningLabCounts, sectionDailyLoad,
                        subjectToFacultyMap)) {
                    placed = true;
                    break;
                }
            }
            if (!placed)
                failedSessions.add(s);
        }

        if (!failedSessions.isEmpty()) {
            throw new RuntimeException(
                    "Unable to generate conflict-free timetable. " +
                            "Please add more faculty/rooms or reduce load.");
        }

        return result;
    }

    /**
     * Try to place a session in a specific day
     * Returns true if successfully placed, false otherwise
     * UPDATED: Now enforces faculty-subject consistency using subjectToFacultyMap
     */
    private boolean tryPlaceSession(Session s, String sectionId, String day,
            Occupancy occ, Map<Long, Integer> dailyLoad,
            Map<Long, Integer> weeklyLoad, List<Room> rooms,
            List<Faculty> faculties, Section section, List<TimetableEntry> result,
            boolean commit, Map<String, Integer> morningLabCount,
            Map<String, Integer> sectionDailyLoad,
            Map<String, Long> subjectToFacultyMap) {

        // ✅ NEW: Check if subject already has an assigned faculty
        String subjectCode = s.subject.getCode();
        Long preferredFacultyId = subjectToFacultyMap.get(subjectCode);
        final Faculty preferredFaculty;

        if (preferredFacultyId != null) {
            // Try to use the same faculty that's already teaching this subject
            preferredFaculty = faculties.stream()
                    .filter(f -> f.getId().equals(preferredFacultyId))
                    .findFirst()
                    .orElse(null);
        } else {
            preferredFaculty = null;
        }

        // ✅ REMOVED: Subject-consistency preference (was causing workload
        // concentration)
        // ✅ NEW STRATEGY: Distribute workload EVENLY across ALL qualified faculty
        // Subject-consistency will happen NATURALLY when same faculty is least loaded

        // Get ALL possible faculty who still have capacity
        List<Faculty> sortedCandidates = faculties.stream()
                .filter(x -> {
                    int dLoadX = dailyLoad.getOrDefault(x.getId(), 0);
                    int wLoadX = weeklyLoad.getOrDefault(x.getId(), 0);

                    int dLimitX = x.getMaxHoursPerDay() > 0 ? x.getMaxHoursPerDay() : DEFAULT_DAILY;
                    int wLimitX = x.getMaxHoursPerWeek() > 0 ? x.getMaxHoursPerWeek() : DEFAULT_WEEKLY;

                    return (dLoadX + s.length <= dLimitX) &&
                            (wLoadX + s.length <= wLimitX);
                })
                .sorted(Comparator
                        // ✅ PRIMARY: Prefer faculty with LOWEST weekly workload (balance load)
                        .comparingInt((Faculty x) -> weeklyLoad.getOrDefault(x.getId(), 0))
                        // ✅ SECONDARY: Among equal workload, prefer higher specialization match
                        .thenComparingInt(x -> -specializationScore(x, s.subject))
                        .thenComparing(Faculty::getName))
                .toList();

        if (sortedCandidates.isEmpty())
            return false;

        // ⭐ STRATEGY: Shuffle top candidates with similar workload to avoid clustering
        List<Faculty> candidateFaculty = new ArrayList<>(sortedCandidates);

        // TRY EACH FACULTY until placement succeeds
        for (Faculty f : candidateFaculty) {
            s.faculty = f;

            int dLoad = dailyLoad.getOrDefault(f.getId(), 0);
            int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);

            // Try each time slot (RANDOM ORDER to avoid deadlock)
            List<Integer> slotOrder = new ArrayList<>();
            for (int i = 0; i < TIME_SLOTS.size(); i++)
                slotOrder.add(i);
            Collections.shuffle(slotOrder);

            for (int si : slotOrder) {

                // LIMIT: max 7 teaching TIME_SLOTS per day per section
                int currentLoad = sectionDailyLoad.getOrDefault(day, 0);
                if (currentLoad + s.length > 7)
                    continue;

                // Skip NO_CLASS and LUNCH_BREAK TIME_SLOTS
                if (TIME_SLOTS.get(si).equals("NO_CLASS") || TIME_SLOTS.get(si).equals("LUNCH_BREAK"))
                    continue;

                // Check we have enough consecutive TIME_SLOTS
                if (si + s.length > TIME_SLOTS.size())
                    continue;

                // Check if consecutive TIME_SLOTS skip over lunch break
                boolean spansLunch = false;
                for (int k = 0; k < s.length; k++) {
                    if (TIME_SLOTS.get(si + k).equals("LUNCH_BREAK")) {
                        spansLunch = true;
                        break;
                    }
                }
                if (spansLunch)
                    continue;

                // Check if all required TIME_SLOTS are free
                boolean allFree = true;
                for (int k = 0; k < s.length; k++) {
                    if (occ.blocked(sectionId, f.getName(), day, TIME_SLOTS.get(si + k))) {
                        allFree = false;
                        break;
                    }
                }
                if (!allFree)
                    continue;

                // Find suitable room
                Room room = null;
                // First pass: try to find a specialized room (e.g. LAB for lab sessions)
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

                    // Check if room is free for all required TIME_SLOTS
                    boolean roomFree = true;
                    for (int k = 0; k < s.length; k++) {
                        if (occ.roomBlocked(r.getName(), day, TIME_SLOTS.get(si + k))) {
                            roomFree = false;
                            break;
                        }
                    }

                    if (roomFree) {
                        room = r;
                        break;
                    }
                }

                // Fallback second pass: if no specialized room found, try any room with
                // capacity
                if (room == null) {
                    for (Room r : rooms) {
                        if (r.getCapacity() < section.getCapacity())
                            continue;

                        boolean roomFree = true;
                        for (int k = 0; k < s.length; k++) {
                            if (occ.roomBlocked(r.getName(), day, TIME_SLOTS.get(si + k))) {
                                roomFree = false;
                                break;
                            }
                        }
                        if (roomFree) {
                            room = r;
                            break;
                        }
                    }
                }

                if (room == null)
                    continue; // No suitable room found even in fallback

                // SUCCESS! Place the session
                for (int k = 0; k < s.length; k++) {
                    TimetableEntry e = new TimetableEntry();
                    e.setSectionId(sectionId);
                    e.setDay(day);
                    e.setTimeSlot(TIME_SLOTS.get(si + k));
                    e.setSubjectCode(s.subject.getCode());
                    e.setSubjectName(s.subject.getName());
                    e.setFacultyName(f.getName());
                    e.setRoomNumber(room.getName());
                    e.setType(s.length == 2 ? "LAB" : "LECTURE");

                    result.add(e);
                    if (commit)
                        timetableRepo.save(e);
                    occ.mark(sectionId, f.getName(), room.getName(), day, TIME_SLOTS.get(si + k));
                }

                // Update workload counters
                dailyLoad.put(f.getId(), dLoad + s.length);
                weeklyLoad.put(f.getId(), wLoad + s.length);

                // ✅ NEW: Record this faculty-subject assignment globally
                if (!subjectToFacultyMap.containsKey(subjectCode)) {
                    subjectToFacultyMap.put(subjectCode, f.getId());
                    System.out.println("📚 Assigned " + f.getName() + " to teach " + subjectCode
                            + " (will be consistent across sections)");
                }

                // Track morning lab if placed in morning
                if (s.length == 2 && MORNING_LAB_TIME_SLOTS.contains(si)) {
                    morningLabCount.put(day, morningLabCount.getOrDefault(day, 0) + 1);
                }

                sectionDailyLoad.put(day, sectionDailyLoad.getOrDefault(day, 0) + s.length);

                return true;
            }

        } // end faculty loop

        return false; // no faculty could place this session
    }

    /**
     * Helper to divide text into uppercase keywords
     */
    private Set<String> tokenize(String text) {
        if (text == null)
            return Set.of();
        text = text.toUpperCase()
                .replaceAll("[^A-Z0-9 ]", " ") // remove symbols
                .replaceAll("\\s+", " ") // remove extra spaces
                .trim();
        return new HashSet<>(Arrays.asList(text.split(" ")));
    }

    /**
     * Scoring system to rank faculty suitability for a subject
     */
    private int specializationScore(Faculty f, Subject s) {
        Set<String> subjectWords = tokenize(s.getName());
        Set<String> facultyWords = tokenize(f.getSpecialization());

        int score = 0;

        for (String sw : subjectWords) {
            // Direct word match
            if (facultyWords.contains(sw)) {
                score += 50;
            }

            // Synonym match
            if (SYNONYMS.containsKey(sw)) {
                for (String syn : SYNONYMS.get(sw)) {
                    if (facultyWords.contains(syn)) {
                        score += 40;
                    }
                }
            }

            // Reverse synonym match
            for (Map.Entry<String, Set<String>> entry : SYNONYMS.entrySet()) {
                if (facultyWords.contains(entry.getKey())) {
                    for (String syn : entry.getValue()) {
                        if (subjectWords.contains(syn)) {
                            score += 40;
                        }
                    }
                }
            }
        }

        // ⭐ Better LAB faculty matching
        if (isLabSubject(s) && f.getSpecialization() != null) {
            String spec = f.getSpecialization().toUpperCase();

            if (spec.contains("LAB") ||
                    spec.contains("PROGRAMMING") ||
                    spec.contains("HARDWARE") ||
                    spec.contains("NETWORK")) {
                score += 20;
            }
        }

        // Fallback: Check manual eligibility if specified
        if (f.getEligibleSubjects() != null &&
                (f.getEligibleSubjects().contains(s.getCode()) ||
                        f.getEligibleSubjects().contains(s.getName()))) {
            score += 30;
        }

        return score;
    }

    /**
     * Generates timetables for all sections while sharing global workload and room
     * occupancy.
     * This ensures no faculty is overbooked across different sections.
     * UPDATED: Now includes faculty-subject consistency tracking
     */
    public List<TimetableEntry> generateForAllSections(boolean commit) {

        int MAX_ATTEMPTS = 50;
        RuntimeException lastError = null;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                System.out.println("GLOBAL GENERATION ATTEMPT " + attempt);

                List<TimetableEntry> all = new ArrayList<>();
                Map<Long, Integer> globalFacultyLoad = new HashMap<>();
                Occupancy globalOcc = new Occupancy();

                // ✅ NEW: Track which faculty teaches which subject globally
                Map<String, Long> subjectToFacultyMap = new HashMap<>();
                // Key: subjectCode (e.g., "CSE314"), Value: facultyId

                for (Section s : sectionRepo.findAll()) {
                    List<TimetableEntry> sectionTT = generateForSection(
                            String.valueOf(s.getId()), commit, globalFacultyLoad, globalOcc, subjectToFacultyMap);
                    all.addAll(sectionTT);
                }

                if (commit) {
                    auditLogService.logAction("TIMETABLE", "GENERATE_ALL",
                            "Successfully generated master timetable for all sections (" + all.size() + " entries)",
                            "System/Admin");

                    notificationService.createAdminNotification(
                            "Master Timetable Generated",
                            "The master timetable for all sections was successfully generated or optimized.",
                            "TIMETABLE_MASTER_GENERATED");

                    // Notify all faculty about the new timetable
                    List<Faculty> activeFaculties = facultyRepo.findAll().stream().filter(Faculty::isActive).toList();
                    for (Faculty f : activeFaculties) {
                        notificationService.createFacultyNotification(
                                f.getId(),
                                "Timetable Updated",
                                "A new timetable has been generated. Please check your schedule.",
                                "TIMETABLE_UPDATED");
                    }
                }

                return all; // SUCCESS 🎉
            } catch (RuntimeException e) {
                lastError = e;
                timetableRepo.deleteAll(); // clear partial timetable and retry fresh
            }
        }

        throw new RuntimeException("Global timetable generation failed after retries", lastError);
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
    /* ================= SUBJECT TYPE HELPERS ================= */

    /* ================= SUBJECT TYPE HELPERS ================= */

    private boolean isLabSubject(Subject s) {
        // LAB if explicitly marked OR lab hours exist (future proof)
        return "LAB".equalsIgnoreCase(s.getType()) || s.getLabHoursPerWeek() > 0;
    }

    private int lectureHours(Subject s) {
        return s.getLectureHoursPerWeek();
    }

    private int labSessions(Subject s) {
        if (!isLabSubject(s))
            return 0;

        // If lab hours exist → convert hours → sessions
        if (s.getLabHoursPerWeek() > 0)
            return Math.max(1, s.getLabHoursPerWeek() / 2);

        // If marked LAB but hours missing → still give 1 lab
        return 1;
    }

    /* ================== SESSION CLASS ================== */

    static class Session {
        Subject subject;
        Faculty faculty;
        int length;
    }
}
