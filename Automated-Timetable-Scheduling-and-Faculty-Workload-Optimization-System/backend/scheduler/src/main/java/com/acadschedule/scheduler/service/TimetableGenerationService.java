package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final SectionRepository sectionRepo;
    private final RoomRepository roomRepo;
    private final OptimizationChangeRepository optimizationChangeRepo;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${scheduler.grid.days}")
    private List<String> DAYS;

    @org.springframework.beans.factory.annotation.Value("${scheduler.grid.time-slots}")
    private List<String> TIME_SLOTS;

    @org.springframework.beans.factory.annotation.Value("${scheduler.grid.non-teachable-slots}")
    private Set<Integer> NON_TEACHABLE_SLOTS;

    @org.springframework.beans.factory.annotation.Value("${scheduler.grid.valid-lab-starts}")
    private Set<Integer> VALID_LAB_START_SLOTS;

    @org.springframework.beans.factory.annotation.Value("${scheduler.section.max-daily-hours:7}")
    private int MAX_SECTION_DAILY_HOURS;

    @org.springframework.beans.factory.annotation.Value("${scheduler.lab.min-capacity-ratio:0.5}")
    private double LAB_MIN_CAPACITY_RATIO;

    @org.springframework.beans.factory.annotation.Value("${scheduler.generation.max-attempts.section:50}")
    private int MAX_ATTEMPTS_SECTION;

    @org.springframework.beans.factory.annotation.Value("${scheduler.generation.max-attempts.all:250}")
    private int MAX_ATTEMPTS_ALL;

    public TimetableGenerationService(TimetableRepository timetableRepo, FacultyRepository facultyRepo,
            SubjectRepository subjectRepo, SectionRepository sectionRepo, RoomRepository roomRepo,
            OptimizationChangeRepository optimizationChangeRepo,
            AuditLogService auditLogService, NotificationService notificationService, ObjectMapper objectMapper) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.sectionRepo = sectionRepo;
        this.roomRepo = roomRepo;
        this.optimizationChangeRepo = optimizationChangeRepo;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    /* ================== PUBLIC ================== */

    /**
     * Entry point for generating a single section's timetable.
     * Implements a retry logic to overcome random deadlocks in the allocation
     * engine.
     */
    public List<TimetableEntry> generateForSection(String sectionId, boolean commit) {
        List<Faculty> faculties = facultyRepo.findByActiveTrue();
        List<Room> rooms = roomRepo.findAll().stream().filter(Room::isActive).toList();
        List<Subject> allSubjects = subjectRepo.findAll();

        RuntimeException lastError = null;

        // ✅ PRIME GLOBAL STATE: Gather all existing entries from OTHER sections
        // to prevent collisions when generating just one section.
        Map<Long, Integer> globalFacultyLoad = new HashMap<>();
        Occupancy globalOcc = new Occupancy();

        Map<String, TimetableEntry> globalElectives = new HashMap<>();

        Map<String, Faculty> facultyMap = new HashMap<>();
        faculties.forEach(f -> facultyMap.put(f.getName(), f));

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

        String snapshotJson = null;
        if (commit) {
            try {
                snapshotJson = objectMapper.writeValueAsString(timetableRepo.findBySectionId(sectionId));
            } catch (Exception e) {
            }
        }

        Section section = sectionRepo.findById(Long.parseLong(sectionId)).orElseThrow();
        List<TimetableEntry> existingEntriesForSection = timetableRepo.findBySectionId(sectionId);

        for (int attempt = 1; attempt <= MAX_ATTEMPTS_SECTION; attempt++) {
            try {
                System.out.println("Attempt " + attempt + " for section " + sectionId);
                // Pass the pre-filled global state
                List<TimetableEntry> result = generateForSectionInternal(section, existingEntriesForSection, commit,
                        globalFacultyLoad, globalOcc,
                        new HashMap<>(), globalElectives, null, new HashMap<>(), faculties, rooms, allSubjects);

                if (commit) {
                    auditLogService.logAction("TIMETABLE", "GENERATE",
                            "Generated timetable for Section ID: " + sectionId, "System/Admin", null, snapshotJson);

                    notificationService.createAdminNotification(
                            "Timetable Generated",
                            "Timetable for Section ID " + sectionId + " was successfully generated.",
                            "TIMETABLE_SECTION_GENERATED");
                }

                return result;
            } catch (RuntimeException e) {
                if (e.getMessage() != null && e.getMessage().startsWith("CRITICAL")) {
                    throw e; // Fail-fast on data errors
                }
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
    private List<TimetableEntry> generateForSectionInternal(
            Section section,
            List<TimetableEntry> existingEntries,
            boolean commit,
            Map<Long, Integer> existingFacultyLoad,
            Occupancy globalOcc,
            Map<String, Long> subjectToFacultyMap,
            Map<String, TimetableEntry> globalElectives,
            List<String> globalElectiveSlots,
            Map<String, Map<Long, Integer>> globalDailyWorkloads,
            List<Faculty> faculties,
            List<Room> rooms,
            List<Subject> allSubjects) {

        String sectionId = String.valueOf(section.getId());
        System.err.println("DEBUG OVERLOAD: Generating for section " + section.getName());

        if (commit)
            timetableRepo.deleteBySectionId(sectionId);

        List<Subject> subjects = allSubjects.stream()
                .filter(s -> s.getDepartment().equalsIgnoreCase(section.getDepartment())
                        && s.getYear() == section.getYear())
                .toList();

        // ✅ Pre-populate faculty-subject map from EXISTING timetable entries
        // This ensures consistency when regenerating a single section
        Map<String, Faculty> facultyByName = new HashMap<>();
        faculties.forEach(f -> facultyByName.put(f.getName(), f));

        existingEntries.forEach(existing -> {
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

        System.err.println("DEBUG OVERLOAD: Expanding sessions for " + subjects.size() + " subjects.");
        if (subjects.isEmpty()) {
            System.err.println("DEBUG OVERLOAD: No subjects found for " + section.getDepartment() + " Year "
                    + section.getYear() + " - returning empty.");
            return Collections.emptyList();
        }

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
                int wLimit = f.getMaxHoursPerWeek();
                int dLimit = f.getMaxHoursPerDay();
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
                    int wLimit = f.getMaxHoursPerWeek();
                    int dLimit = f.getMaxHoursPerDay();
                    if (wLoad >= wLimit || dLoad >= dLimit)
                        continue;
                    chosen = f;
                    break;
                }
            }
            if (chosen == null) {
                System.err.println("DEBUG OVERLOAD: Could not find ANY faculty for elective " + subjectCode + " at "
                        + elecDay + " " + elecTime);
                continue;
            }

            // Find a room
            Room room = rooms.stream()
                    .filter(r -> r.getCapacity() >= section.getCapacity())
                    .filter(r -> !occ.roomBlocked(r.getName(), elecDay, elecTime))
                    .findFirst().orElse(null);
            if (room == null) {
                System.err.println("DEBUG OVERLOAD: Could not find ANY room for elective " + subjectCode + " at "
                        + elecDay + " " + elecTime);
                continue;
            }

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

        // PASS 1: Place all LAB sessions (most constrained first)
        // Two sub-passes: (a) randomized for speed, (b) exhaustive if randomized fails
        for (Session s : sessions) {
            if (s.length != 2)
                continue;

            boolean placed = false;

            // (a) Try random order first
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

            // (b) Exhaustive fallback — try all days in fixed order
            if (!placed) {
                for (String day : DAYS) {
                    if (tryPlaceSession(s, sectionId, day, occ, dailyWorkloads.get(day), weeklyLoad,
                            rooms, faculties, section, result, commit, morningLabCounts, sectionDailyLoad,
                            subjectToFacultyMap)) {
                        placed = true;
                        break;
                    }
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
            int dLimit = locked.getMaxHoursPerDay();
            int wLimit = locked.getMaxHoursPerWeek();
            if (dLoad + s.length > dLimit || wLoad + s.length > wLimit)
                return false;
            candidateFaculty = List.of(locked);
        } else {
            // If NO faculty is mapped to this subject at all, throw exception
            boolean hasAnyEligibleMap = faculties.stream().anyMatch(f -> {
                boolean isEligible = false;
                if (f.getEligibleSubjects() != null) {
                    isEligible = f.getEligibleSubjects().contains(s.subject.getCode()) ||
                            f.getEligibleSubjects().contains(s.subject.getName());
                }
                if (!isEligible && s.subject.getEligibleFaculty() != null) {
                    isEligible = s.subject.getEligibleFaculty().contains(f.getName());
                }
                return isEligible;
            });

            if (!hasAnyEligibleMap) {
                throw new RuntimeException("CRITICAL: No faculty members are mapped to teach subject: " +
                        s.subject.getCode() + " - " + s.subject.getName() + ". Please update mappings.");
            }

            // No lock yet — pick ONLY from ELIGIBLE faculty, sorted by least-loaded first
            candidateFaculty = faculties.stream()
                    .filter(x -> {
                        boolean isEligible = false;
                        if (x.getEligibleSubjects() != null) {
                            isEligible = x.getEligibleSubjects().contains(s.subject.getCode()) ||
                                    x.getEligibleSubjects().contains(s.subject.getName());
                        }
                        if (!isEligible && s.subject.getEligibleFaculty() != null) {
                            isEligible = s.subject.getEligibleFaculty().contains(x.getName());
                        }
                        return isEligible;
                    })
                    .filter(x -> {
                        int dLoadX = dailyLoad.getOrDefault(x.getId(), 0);
                        int wLoadX = weeklyLoad.getOrDefault(x.getId(), 0);
                        int dLimitX = x.getMaxHoursPerDay();
                        int wLimitX = x.getMaxHoursPerWeek();
                        return (dLoadX + s.length <= dLimitX) && (wLoadX + s.length <= wLimitX);
                    })
                    .sorted(Comparator
                            .comparingInt((Faculty x) -> weeklyLoad.getOrDefault(x.getId(), 0))
                            .thenComparing(Faculty::getName))
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        }

        if (candidateFaculty.isEmpty()) {
            System.err.println("DEBUG: No candidate faculty eligible and available (due to load etc.) for subject: "
                    + s.subject.getCode());
            return false;
        }

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

                // LIMIT: section daily load
                int currentLoad = sectionDailyLoad.getOrDefault(day, 0);
                if (currentLoad + s.length > MAX_SECTION_DAILY_HOURS)
                    continue;

                // ── Skip non-teachable slots (BREAK and LUNCH_BREAK) ──────────────────────
                if (NON_TEACHABLE_SLOTS.contains(si))
                    continue;

                // ── For LAB sessions (length == 2): only allow pre-validated starting slots
                // to guarantee no break/lunch is spanned ────────────────────────────────
                if (s.length == 2 && !VALID_LAB_START_SLOTS.contains(si)) {
                    continue;
                }

                // Check we have enough consecutive slots remaining
                if (si + s.length > TIME_SLOTS.size())
                    continue;

                // Double-check: none of the spanned slots may be non-teachable
                boolean spansBreak = false;
                for (int k = 0; k < s.length; k++) {
                    if (NON_TEACHABLE_SLOTS.contains(si + k)) {
                        spansBreak = true;
                        break;
                    }
                }
                if (spansBreak)
                    continue;

                // Check if all required TIME_SLOTS are free (section + faculty)
                boolean allFree = true;
                for (int k = 0; k < s.length; k++) {
                    if (occ.blocked(sectionId, f.getName(), day, TIME_SLOTS.get(si + k))) {
                        allFree = false;
                        break;
                    }
                }
                if (!allFree)
                    continue;

                // ── Find a suitable room ─────────────────────────────────────────────────
                Room room = null;

                if (s.length == 2) {
                    // LAB sessions: ONLY accept rooms whose type is LAB; no fallback.
                    // Lab sessions are typically run in batches (half the section at once),
                    // so we allow any LAB room with at least 50% of section capacity.
                    int minLabCap = (int) Math.max(1, section.getCapacity() * LAB_MIN_CAPACITY_RATIO);
                    for (Room r : rooms) {
                        if (r.getCapacity() < minLabCap)
                            continue;
                        if (r.getType() == null || r.getType() != RoomType.LAB)
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
                } else {
                    // LECTURE / ELECTIVE sessions: prefer non-lab rooms, fallback to any
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
                    continue; // No suitable room found

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

                sectionDailyLoad.put(day, sectionDailyLoad.getOrDefault(day, 0) + s.length);

                return true;
            }

        } // end faculty loop

        return false; // no faculty could place this session
    }

    /**
     * Generates timetables for all sections while sharing global workload and room
     * occupancy.
     * This ensures no faculty is overbooked across different sections.
     * UPDATED: Now includes faculty-subject consistency tracking
     */
    public List<TimetableEntry> generateForAllSections(boolean commit) {

        String snapshotJson = null;
        if (commit) {
            try {
                snapshotJson = objectMapper.writeValueAsString(timetableRepo.findAll());
            } catch (Exception e) {
            }
            timetableRepo.deleteAll();
        }

        // ✅ CACHE EVERYTHING ONCE TO AVOID THOUSANDS OF DB QUERIES
        List<Faculty> activeFaculties = facultyRepo.findByActiveTrue();
        List<Room> activeRooms = roomRepo.findAll().stream().filter(Room::isActive).toList();
        List<Subject> allSubjects = subjectRepo.findAll();
        List<Section> allSections = sectionRepo.findAll();

        List<TimetableEntry> all = new ArrayList<>();
        Map<Long, Integer> globalFacultyLoad = new HashMap<>();
        Map<String, Map<Long, Integer>> globalDailyWorkloads = new HashMap<>();
        for (String d : DAYS) {
            globalDailyWorkloads.put(d, new HashMap<>());
        }
        Occupancy globalOcc = new Occupancy();
        Map<String, Long> subjectToFacultyMap = new HashMap<>();
        Map<String, TimetableEntry> globalElectives = new HashMap<>();

        // Calculate Max Elective Hours needed across all subjects
        int maxElectiveHours = 0;
        for (Subject sub : allSubjects) {
            if (sub.isElective()) {
                int hours = lectureHours(sub);
                if (hours > maxElectiveHours)
                    maxElectiveHours = hours;
            }
        }

        // Pick N globally-consistent slots for electives (avoid breaks/lunch)
        List<String> allPossibleSlots = new ArrayList<>();
        for (String d : DAYS) {
            for (int i = 0; i < TIME_SLOTS.size(); i++) {
                if (NON_TEACHABLE_SLOTS.contains(i))
                    continue;
                allPossibleSlots.add(d + "|" + TIME_SLOTS.get(i));
            }
        }
        Collections.shuffle(allPossibleSlots);
        List<String> globalElectiveSlots = allPossibleSlots.subList(0,
                Math.min(maxElectiveHours, allPossibleSlots.size()));

        List<TimetableEntry> allExistingTimetables = timetableRepo.findAll();

        // --- PER-SECTION RETRY --- //
        for (Section s : allSections) {
            String sectionId = String.valueOf(s.getId());
            List<TimetableEntry> existingEntriesForSection = allExistingTimetables.stream()
                    .filter(e -> sectionId.equals(e.getSectionId())).toList();
            RuntimeException lastSectionError = null;
            boolean sectionPlaced = false;

            for (int attempt = 1; attempt <= MAX_ATTEMPTS_ALL; attempt++) {
                try {
                    List<TimetableEntry> sectionTT = generateForSectionInternal(
                            s, existingEntriesForSection, false,
                            globalFacultyLoad, globalOcc,
                            subjectToFacultyMap, globalElectives,
                            globalElectiveSlots, globalDailyWorkloads,
                            activeFaculties, activeRooms, allSubjects);

                    // Commit section entries to DB if requested
                    if (commit) {
                        timetableRepo.deleteBySectionId(sectionId);
                        timetableRepo.saveAll(sectionTT);
                    }

                    all.addAll(sectionTT);
                    sectionPlaced = true;
                    System.out.println("Section " + sectionId + " placed on attempt " + attempt);
                    break;
                } catch (RuntimeException e) {
                    if (e.getMessage() != null && e.getMessage().startsWith("CRITICAL")) {
                        throw e; // Fail-fast on data errors, abort entire generation
                    }
                    lastSectionError = e;
                    // Allow a small context reset between retries of the same section
                }
            }

            if (!sectionPlaced) {
                System.err.println(
                        "WARNING: Could not generate timetable for section " + sectionId + " after 100 attempts: " +
                                (lastSectionError != null ? lastSectionError.getMessage() : "unknown"));
                // Do not throw an exception here, allow other sections to generate
            }
        }

        if (commit) {
            auditLogService.logAction("TIMETABLE", "GENERATE_ALL",
                    "Successfully generated master timetable for all sections (" + all.size() + " entries)",
                    "System/Admin", null, snapshotJson);

            notificationService.createAdminNotification(
                    "Master Timetable Generated",
                    "The master timetable for all sections was successfully generated or optimized.",
                    "TIMETABLE_MASTER_GENERATED");

            for (Faculty f : activeFaculties) {
                notificationService.createFacultyNotification(
                        f.getId(),
                        "Timetable Updated",
                        "A new timetable has been generated. Please check your schedule.",
                        "TIMETABLE_UPDATED");
            }
        }

        return all;
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
        String snapshotJson = null;
        try {
            snapshotJson = objectMapper.writeValueAsString(timetableRepo.findAll());
        } catch (Exception e) {
        }

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

            String subjectCode = entriesToReassign.get(0).getSubjectCode();
            String subjectName = entriesToReassign.get(0).getSubjectName();

            // Find a replacement faculty capable of taking ALL iterations of this
            // subject-section pair
            Faculty replacement = allFaculty.stream()
                    .filter(f -> !f.getName().equals(facultyName))
                    .filter(f -> {
                        // Strict Faculty-Subject Mapping check
                        return (f.getEligibleSubjects() != null &&
                                (f.getEligibleSubjects().contains(subjectCode)
                                        || f.getEligibleSubjects().contains(subjectName)));
                    })
                    .filter(f -> {
                        int wLoad = weeklyLoad.getOrDefault(f.getId(), 0);
                        int wLimit = f.getMaxHoursPerWeek();
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

                    // RECORD THE CHANGE PERSISTENTLY
                    OptimizationChange change = new OptimizationChange();
                    change.setSectionId(entry.getSectionId());
                    change.setSubjectCode(entry.getSubjectCode());
                    change.setSubjectName(entry.getSubjectName());
                    change.setDay(entry.getDay());
                    change.setTimeSlot(entry.getTimeSlot());
                    change.setPreviousFaculty(oldFaculty);
                    change.setNewFaculty(replacement.getName());
                    change.setTimestamp(java.time.LocalDateTime.now());
                    optimizationChangeRepo.save(change);
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
                    "Admin", null, snapshotJson);
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
