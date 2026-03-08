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
    private static final int DEFAULT_DAILY = 5;
    private static final int DEFAULT_WEEKLY = 20;

    /* ================== PUBLIC ================== */

    /**
     * Entry point for generating a single section's timetable.
     * Implements a retry logic to overcome random deadlocks in the allocation
     * engine.
     */
    public List<TimetableEntry> generateForSection(String sectionId, boolean commit) {

        int MAX_ATTEMPTS = 50;
        RuntimeException lastError = null;

        // ✅ PRIME GLOBAL STATE: Gather all existing entries from OTHER sections
        // to prevent collisions when generating just one section.
        Map<Long, Integer> globalFacultyLoad = new HashMap<>();
        Occupancy globalOcc = new Occupancy();

        Map<String, TimetableEntry> globalElectives = new HashMap<>();

        Map<String, Faculty> facultyMap = new HashMap<>();
        facultyRepo.findAll().forEach(f -> facultyMap.put(f.getName(), f));

        timetableRepo.findAll().stream()
                .filter(e -> !sectionId.equals(e.getSectionId()))
                .forEach(e -> {
                    globalOcc.mark(e.getSectionId(), e.getFacultyName(), e.getRoomNumber(), e.getDay(),
                            e.getTimeSlot());

                    if ("ELECTIVE".equalsIgnoreCase(e.getType())) {
                        globalElectives.putIfAbsent(e.getSubjectCode(), e);
                    }

                    Faculty f = facultyMap.get(e.getFacultyName());
                    if (f != null) {
                        globalFacultyLoad.put(f.getId(), globalFacultyLoad.getOrDefault(f.getId(), 0) + 1);
                    }
                });

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                System.out.println("Attempt " + attempt + " for section " + sectionId);
                // Pass the pre-filled global state
                List<TimetableEntry> result = generateForSection(sectionId, commit, globalFacultyLoad, globalOcc,
                        new HashMap<>(), globalElectives, null, new HashMap<>());

                if (commit) {
                    auditLogService.logAction("TIMETABLE", "GENERATE",
                            "Generated timetable for Section ID: " + sectionId, "System/Admin", null);

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
     * KEY CHANGE: subjectToFacultyMap is now keyed by "sectionId|subjectCode"
     * so each section keeps its own consistent faculty-per-subject assignment.
     */
    public List<TimetableEntry> generateForSection(
            String sectionId,
            boolean commit,
            Map<Long, Integer> existingFacultyLoad,
            Occupancy globalOcc,
            Map<String, Long> subjectToFacultyMap,
            Map<String, TimetableEntry> globalElectives,
            List<String> globalElectiveSlots,
            Map<String, Map<Long, Integer>> globalDailyWorkloads) {

        Section section = sectionRepo.findById(Long.parseLong(sectionId))
                .orElseThrow();

        if (commit)
            timetableRepo.deleteBySectionId(sectionId);

        List<Subject> subjects = subjectRepo.findByDepartmentAndYear(section.getDepartment(), section.getYear());
        List<Faculty> faculties = facultyRepo.findByActiveTrue();
        List<Room> rooms = roomRepo.findAll().stream().filter(Room::isActive).toList();

        // ✅ Pre-populate faculty-subject map from EXISTING timetable entries
        // This ensures consistency when regenerating a single section
        Map<String, Faculty> facultyByName = new HashMap<>();
        faculties.forEach(f -> facultyByName.put(f.getName(), f));

        timetableRepo.findBySectionId(sectionId).forEach(existing -> {
            String key = sectionId + "|" + existing.getSubjectCode();
            if (!subjectToFacultyMap.containsKey(key)) {
                Faculty f = facultyByName.get(existing.getFacultyName());
                if (f != null)
                    subjectToFacultyMap.put(key, f.getId());
            }
        });

        // Use reference to modify and persist global faculty load continuously across
        // section iterations
        Map<Long, Integer> weeklyLoad = existingFacultyLoad != null ? existingFacultyLoad : new HashMap<>();

        /* ========= STEP 2: EXPAND ALL REQUIRED SESSIONS ========= */
        List<Session> sessions = new ArrayList<>();
        List<Session> electiveSessions = new ArrayList<>();

        for (Subject s : subjects) {
            int lectureHours = lectureHours(s);
            int labSessions = labSessions(s);

            if (s.isElective()) {
                // Elective: create a session for each lecture hour (requires multiple
                // synchronized slots)
                for (int i = 0; i < lectureHours; i++) {
                    Session elec = new Session();
                    elec.subject = s;
                    elec.length = 1;
                    electiveSessions.add(elec);
                }
            } else {
                for (int i = 0; i < lectureHours; i++) {
                    Session lec = new Session();
                    lec.subject = s;
                    lec.length = 1;
                    sessions.add(lec);
                }
                for (int i = 0; i < labSessions; i++) {
                    Session lab = new Session();
                    lab.subject = s;
                    lab.length = 2;
                    sessions.add(lab);
                }
            }
        }

        Collections.shuffle(sessions, new Random(section.getId()));

        /* ========= STEP 3: MULTI-PASS PLACEMENT ========= */

        Occupancy occ = globalOcc != null ? globalOcc : new Occupancy();
        List<TimetableEntry> result = new ArrayList<>();
        List<Session> failedSessions = new ArrayList<>();

        Map<String, Map<Long, Integer>> dailyWorkloads = globalDailyWorkloads != null ? globalDailyWorkloads
                : new HashMap<>();
        Map<String, Integer> morningLabCounts = new HashMap<>();
        Map<String, Integer> sectionDailyLoad = new HashMap<>();
        for (String d : DAYS) {
            dailyWorkloads.putIfAbsent(d, new HashMap<>());
            morningLabCounts.put(d, 0);
            sectionDailyLoad.put(d, 0);
        }

        // ✅ ELECTIVE PRE-PASS: Force all elective sessions into the dynamically
        // selected global slots, combining sections!
        Iterator<String> electiveSlotIterator = globalElectiveSlots != null ? globalElectiveSlots.iterator()
                : Collections.<String>emptyIterator();
        Map<String, Integer> electiveSubjectAllocations = new HashMap<>();

        for (Session es : electiveSessions) {
            String subjectCode = es.subject.getCode();
            int currentSubjectAllocation = electiveSubjectAllocations.getOrDefault(subjectCode, 0);

            // Fetch the assigned slot for this specific iteration of this elective subject
            String globalSlotKey;
            if (globalElectiveSlots != null && currentSubjectAllocation < globalElectiveSlots.size()) {
                globalSlotKey = globalElectiveSlots.get(currentSubjectAllocation);
            } else {
                continue; // Not enough global slots selected for this elective's required hours (should
                          // not happen if maxElectiveHours is right)
            }

            String[] slotParts = globalSlotKey.split("\\|");
            String elecDay = slotParts[0];
            String elecTime = slotParts[1];
            String uniqueGlobalElectiveKey = subjectCode + "|" + globalSlotKey; // Distinguish between multiple slots of
                                                                                // same elective

            currentSubjectAllocation++;
            electiveSubjectAllocations.put(subjectCode, currentSubjectAllocation);

            // If this exact elective slot was ALREADY scheduled by another section
            // globally, JOIN the combined class!
            if (globalElectives != null && globalElectives.containsKey(uniqueGlobalElectiveKey)) {
                TimetableEntry existing = globalElectives.get(uniqueGlobalElectiveKey);

                TimetableEntry e = new TimetableEntry();
                e.setSectionId(sectionId);
                e.setDay(elecDay);
                e.setTimeSlot(elecTime);
                e.setSubjectCode(subjectCode);
                e.setSubjectName(es.subject.getName());
                e.setFacultyName(existing.getFacultyName());
                e.setRoomNumber(existing.getRoomNumber());
                e.setType("ELECTIVE");

                result.add(e);
                if (commit)
                    timetableRepo.save(e);

                // Track occupancy to prevent regular classes from overwriting
                occ.used.add(sectionId + "|" + elecDay + "|" + elecTime);
                continue; // Skip new allocation, faculty workload is already accounted for
            }

            // Otherwise, allocate a new faculty and room for this elective subject slot
            String consistencyKey = sectionId + "|" + subjectCode;
            Long lockedFacultyId = subjectToFacultyMap.get(consistencyKey);

            // Find eligible faculty, preferring the locked one if it exists
            Faculty chosen = null;
            for (Faculty f : faculties) {
                if (lockedFacultyId != null && !f.getId().equals(lockedFacultyId))
                    continue;
                if (occ.blocked(null, f.getName(), elecDay, elecTime)) // Check faculty only (null section)
                    continue;
                int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);
                int dLoad = dailyWorkloads.get(elecDay) != null ? dailyWorkloads.get(elecDay).getOrDefault(f.getId(), 0)
                        : 0;
                int wLimit = f.getMaxHoursPerWeek() > 0 ? f.getMaxHoursPerWeek() : DEFAULT_WEEKLY;
                int dLimit = f.getMaxHoursPerDay() > 0 ? f.getMaxHoursPerDay() : DEFAULT_DAILY;
                if (wLoad >= wLimit || dLoad >= dLimit)
                    continue;
                chosen = f;
                break;
            }
            // If locked faculty not available, pick any eligible
            if (chosen == null && lockedFacultyId != null) {
                for (Faculty f : faculties) {
                    if (occ.blocked(null, f.getName(), elecDay, elecTime))
                        continue;
                    int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);
                    int dLoad = dailyWorkloads.get(elecDay) != null
                            ? dailyWorkloads.get(elecDay).getOrDefault(f.getId(), 0)
                            : 0;
                    int wLimit = f.getMaxHoursPerWeek() > 0 ? f.getMaxHoursPerWeek() : DEFAULT_WEEKLY;
                    int dLimit = f.getMaxHoursPerDay() > 0 ? f.getMaxHoursPerDay() : DEFAULT_DAILY;
                    if (wLoad >= wLimit || dLoad >= dLimit)
                        continue;
                    chosen = f;
                    break;
                }
            }
            if (chosen == null)
                continue;

            // Find a room
            Room room = rooms.stream()
                    .filter(r -> r.getCapacity() >= section.getCapacity()) // Electives might need bigger rooms for
                                                                           // combined sections in real world
                    .filter(r -> !occ.roomBlocked(r.getName(), elecDay, elecTime))
                    .findFirst().orElse(null);
            if (room == null)
                continue;

            TimetableEntry e = new TimetableEntry();
            e.setSectionId(sectionId);
            e.setDay(elecDay);
            e.setTimeSlot(elecTime);
            e.setSubjectCode(es.subject.getCode());
            e.setSubjectName(es.subject.getName());
            e.setFacultyName(chosen.getName());
            e.setRoomNumber(room.getName());
            e.setType("ELECTIVE");

            result.add(e);
            if (commit)
                timetableRepo.save(e);

            // Mark ONLY faculty and room as used (so other electives can still be scheduled
            // for this section)
            occ.used.add(chosen.getName() + "|" + elecDay + "|" + elecTime);
            occ.used.add(room.getName() + "|" + elecDay + "|" + elecTime);
            occ.used.add(sectionId + "|" + elecDay + "|" + elecTime); // Mark branch slot as taken

            weeklyLoad.put(chosen.getId(), weeklyLoad.getOrDefault(chosen.getId(), 0) + 1);
            sectionDailyLoad.put(elecDay, sectionDailyLoad.getOrDefault(elecDay, 0) + 1);
            dailyWorkloads.get(elecDay).put(chosen.getId(),
                    dailyWorkloads.get(elecDay).getOrDefault(chosen.getId(), 0) + 1);

            // Lock faculty-subject consistency
            subjectToFacultyMap.putIfAbsent(consistencyKey, chosen.getId());

            if (globalElectives != null) {
                globalElectives.put(uniqueGlobalElectiveKey, e);
            }
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
     * Try to place a session in a specific day.
     * UPDATED: Faculty consistency enforced at section level via
     * "sectionId|subjectCode" key.
     */
    private boolean tryPlaceSession(Session s, String sectionId, String day,
            Occupancy occ, Map<Long, Integer> dailyLoad,
            Map<Long, Integer> weeklyLoad, List<Room> rooms,
            List<Faculty> faculties, Section section, List<TimetableEntry> result,
            boolean commit, Map<String, Integer> morningLabCount,
            Map<String, Integer> sectionDailyLoad,
            Map<String, Long> subjectToFacultyMap) {

        String subjectCode = s.subject.getCode();
        // ✅ Section-level key: one faculty per (section, subject) pair
        String consistencyKey = sectionId + "|" + subjectCode;
        Long lockedFacultyId = subjectToFacultyMap.get(consistencyKey);

        // Build candidate list: locked faculty comes first, then others sorted by load
        List<Faculty> candidateFaculty;
        if (lockedFacultyId != null) {
            // Hard-lock: only use the locked faculty for this section+subject
            Faculty locked = faculties.stream()
                    .filter(f -> f.getId().equals(lockedFacultyId))
                    .findFirst().orElse(null);
            if (locked == null)
                return false; // locked faculty no longer active

            int dLoad = dailyLoad.getOrDefault(locked.getId(), 0);
            int wLoad = weeklyLoad.getOrDefault(locked.getId(), 0);
            int dLimit = locked.getMaxHoursPerDay() > 0 ? locked.getMaxHoursPerDay() : DEFAULT_DAILY;
            int wLimit = locked.getMaxHoursPerWeek() > 0 ? locked.getMaxHoursPerWeek() : DEFAULT_WEEKLY;
            if (dLoad + s.length > dLimit || wLoad + s.length > wLimit)
                return false;
            candidateFaculty = List.of(locked);
        } else {
            // No lock yet — pick from all eligible, sorted by least-loaded first
            candidateFaculty = faculties.stream()
                    .filter(x -> {
                        int dLoadX = dailyLoad.getOrDefault(x.getId(), 0);
                        int wLoadX = weeklyLoad.getOrDefault(x.getId(), 0);
                        int dLimitX = x.getMaxHoursPerDay() > 0 ? x.getMaxHoursPerDay() : DEFAULT_DAILY;
                        int wLimitX = x.getMaxHoursPerWeek() > 0 ? x.getMaxHoursPerWeek() : DEFAULT_WEEKLY;
                        return (dLoadX + s.length <= dLimitX) && (wLoadX + s.length <= wLimitX);
                    })
                    .sorted(Comparator
                            .comparingInt((Faculty x) -> weeklyLoad.getOrDefault(x.getId(), 0))
                            .thenComparingInt(x -> -specializationScore(x, s.subject))
                            .thenComparing(Faculty::getName))
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        }

        if (candidateFaculty.isEmpty())
            return false;

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

                // ✅ Record this faculty-subject assignment for THIS SECTION (section-level key)
                subjectToFacultyMap.putIfAbsent(consistencyKey, f.getId());

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
                Map<String, Map<Long, Integer>> globalDailyWorkloads = new HashMap<>();
                for (String d : DAYS) {
                    globalDailyWorkloads.put(d, new HashMap<>());
                }
                Occupancy globalOcc = new Occupancy();

                // ✅ NEW: Track which faculty teaches which subject globally
                Map<String, Long> subjectToFacultyMap = new HashMap<>();
                // Key: subjectCode (e.g., "CSE314"), Value: facultyId

                Map<String, TimetableEntry> globalElectives = new HashMap<>();

                // ✅ NEW: Calculate Max Elective Hours needed
                int maxElectiveHours = 0;
                for (Subject sub : subjectRepo.findAll()) {
                    if (sub.isElective()) {
                        int hours = lectureHours(sub);
                        if (hours > maxElectiveHours)
                            maxElectiveHours = hours;
                    }
                }

                // Pick N random unique global slots for these electives
                List<String> allPossibleSlots = new ArrayList<>();
                for (String d : DAYS) {
                    for (int i = 1; i < TIME_SLOTS.size(); i++) {
                        if (i == 5 || i == 2)
                            continue; // Skip lunch (5) and lab start (2)
                        allPossibleSlots.add(d + "|" + TIME_SLOTS.get(i));
                    }
                }
                Collections.shuffle(allPossibleSlots);
                List<String> globalElectiveSlots = allPossibleSlots.subList(0,
                        Math.min(maxElectiveHours, allPossibleSlots.size()));

                for (Section s : sectionRepo.findAll()) {
                    List<TimetableEntry> sectionTT = generateForSection(
                            String.valueOf(s.getId()), commit, globalFacultyLoad, globalOcc, subjectToFacultyMap,
                            globalElectives, globalElectiveSlots, globalDailyWorkloads);
                    all.addAll(sectionTT);
                }

                if (commit) {
                    auditLogService.logAction("TIMETABLE", "GENERATE_ALL",
                            "Successfully generated master timetable for all sections (" + all.size() + " entries)",
                            "System/Admin", null);

                    notificationService.createAdminNotification(
                            "Master Timetable Generated",
                            "The master timetable for all sections was successfully generated or optimized.",
                            "TIMETABLE_MASTER_GENERATED");

                    // Notify all faculty about the new timetable
                    List<Faculty> activeFaculties = facultyRepo.findByActiveTrue();
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

    /**
     * Leave-aware optimization: Reassigns sessions of an on-leave faculty
     * to other eligible faculty members while keeping the schedule conflict-free.
     *
     * @param facultyName Name of the faculty on leave
     * @param leaveDays   Set of DAYS (e.g. "MONDAY") the faculty will be absent
     * @return List of maps describing each reassigned entry
     */
    @Transactional
    public List<Map<String, Object>> optimizeForLeave(String facultyName, Set<String> leaveDays) {
        // 1. Identify which (sectionId + subjectCode) pairs are affected by the leave
        Set<String> affectedSectionSubjects = timetableRepo.findByFacultyName(facultyName).stream()
                .filter(e -> leaveDays.contains(e.getDay().toUpperCase()))
                .map(e -> e.getSectionId() + "|" + e.getSubjectCode())
                .collect(java.util.stream.Collectors.toSet());

        if (affectedSectionSubjects.isEmpty()) {
            return List.of();
        }

        // 2. Fetch ALL timetable entries for the affected (sectionId + subjectCode)
        // pairs across the ENTIRE week
        List<TimetableEntry> allEntriesForAffectedSubjects = timetableRepo.findByFacultyName(facultyName).stream()
                .filter(e -> affectedSectionSubjects.contains(e.getSectionId() + "|" + e.getSubjectCode()))
                .collect(java.util.stream.Collectors.toList());

        // Group them by the (sectionId + subjectCode) pair so we reassign them together
        Map<String, List<TimetableEntry>> groupedEntries = allEntriesForAffectedSubjects.stream()
                .collect(java.util.stream.Collectors.groupingBy(e -> e.getSectionId() + "|" + e.getSubjectCode()));

        List<Faculty> allFaculty = facultyRepo.findByActiveTrue();

        // Build current occupancy from all existing entries (excluding the ones we are
        // about to reassign)
        Occupancy occ = new Occupancy();
        Map<Long, Integer> weeklyLoad = new HashMap<>();

        timetableRepo.findAll().stream()
                .filter(e -> !allEntriesForAffectedSubjects.contains(e))
                .forEach(e -> {
                    occ.mark(e.getSectionId(), e.getFacultyName(), e.getRoomNumber(), e.getDay(), e.getTimeSlot());
                    Faculty f = allFaculty.stream()
                            .filter(x -> x.getName().equals(e.getFacultyName()))
                            .findFirst().orElse(null);
                    if (f != null) {
                        weeklyLoad.put(f.getId(), weeklyLoad.getOrDefault(f.getId(), 0) + 1);
                    }
                });

        List<Map<String, Object>> reassigned = new ArrayList<>();
        Map<Long, StringBuilder> notificationBuilder = new HashMap<>();

        for (Map.Entry<String, List<TimetableEntry>> group : groupedEntries.entrySet()) {
            List<TimetableEntry> entriesToReassign = group.getValue();
            int requiredHours = entriesToReassign.size();

            // Find a replacement faculty capable of taking ALL iterations of this
            // subject-section pair
            Faculty replacement = allFaculty.stream()
                    .filter(f -> !f.getName().equals(facultyName))
                    .filter(f -> {
                        int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);
                        int wLimit = f.getMaxHoursPerWeek() > 0 ? f.getMaxHoursPerWeek() : DEFAULT_WEEKLY;
                        return (wLoad + requiredHours) <= wLimit; // Must have capacity for ALL hours
                    })
                    .filter(f -> {
                        // Check occupancy for ALL slots of this subject
                        return entriesToReassign.stream().noneMatch(entry -> occ.blocked(entry.getSectionId(),
                                f.getName(), entry.getDay(), entry.getTimeSlot()));
                    })
                    .min(Comparator.comparingInt(f -> weeklyLoad.getOrDefault(f.getId(), 0)))
                    .orElse(null);

            if (replacement != null) {
                // We found a replacement! Reassign ALL entries in the group to them
                String oldFaculty = facultyName;
                String subjectCode = entriesToReassign.get(0).getSubjectCode();
                String sectionId = entriesToReassign.get(0).getSectionId();

                for (TimetableEntry entry : entriesToReassign) {
                    entry.setFacultyName(replacement.getName());
                    timetableRepo.save(entry);

                    // Mark new occupancy
                    occ.mark(entry.getSectionId(), replacement.getName(), entry.getRoomNumber(), entry.getDay(),
                            entry.getTimeSlot());
                    weeklyLoad.put(replacement.getId(), weeklyLoad.getOrDefault(replacement.getId(), 0) + 1);

                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("entryId", entry.getId());
                    info.put("day", entry.getDay());
                    info.put("timeSlot", entry.getTimeSlot());
                    info.put("subjectCode", entry.getSubjectCode());
                    info.put("sectionId", entry.getSectionId());
                    info.put("oldFaculty", oldFaculty);
                    info.put("newFaculty", replacement.getName());
                    info.put("room", entry.getRoomNumber());
                    reassigned.add(info);
                }

                // Batch up the notification details for this replacement faculty
                StringBuilder sb = notificationBuilder.computeIfAbsent(replacement.getId(),
                        k -> new StringBuilder("You have been reassigned to take over: "));
                sb.append(subjectCode).append(" (Section ").append(sectionId).append(") for ").append(requiredHours)
                        .append(" classes. ");
            }
        }

        // Send out notifications to all faculty who received new assignments
        for (Map.Entry<Long, StringBuilder> entry : notificationBuilder.entrySet()) {
            notificationService.createFacultyNotification(
                    entry.getKey(),
                    "New Classes Assigned (Leave Substitution)",
                    entry.getValue().toString().trim(),
                    "TIMETABLE_REASSIGNED");
        }

        if (!reassigned.isEmpty()) {
            auditLogService.logAction("TIMETABLE", "LEAVE_OPTIMIZE",
                    "Reassigned " + reassigned.size()
                            + " total sessions (maintaining section-subject consistency) from " + facultyName
                            + " due to approved leave.",
                    "Admin", null);
            notificationService.createAdminNotification(
                    "Timetable Optimized for Leave",
                    "Consistency rule enforced: Reassigned " + reassigned.size() + " total session(s) from "
                            + facultyName + " to cover approved leave across the entire week.",
                    "TIMETABLE_LEAVE_OPTIMIZED");
        }

        return reassigned;
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
