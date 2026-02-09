package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Faculty;
import com.acadschedule.scheduler.entity.Room;
import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.entity.Subject;
import com.acadschedule.scheduler.entity.TimetableEntry;
import com.acadschedule.scheduler.repository.RoomRepository;
import com.acadschedule.scheduler.repository.SectionRepository;
import com.acadschedule.scheduler.repository.SubjectRepository;
import com.acadschedule.scheduler.repository.TimetableRepository;
import com.acadschedule.scheduler.repository.FacultyRepository;
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
    private final SectionRepository sectionRepo;

    public TimetableGenerationService(
            TimetableRepository timetableRepo,
            FacultyRepository facultyRepo,
            SubjectRepository subjectRepo,
            RoomRepository roomRepo,
            SectionRepository sectionRepo
    ) {
        this.timetableRepo = timetableRepo;
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.roomRepo = roomRepo;
        this.sectionRepo = sectionRepo;
    }

    private enum SlotType {
        LIGHT, CORE, ELECTIVE, LAB, BREAK, LUNCH, FREE
    }

    private static final Map<String, List<SlotType>> WEEK_TEMPLATE = Map.of(
            "MONDAY", List.of(SlotType.LIGHT, SlotType.CORE, SlotType.CORE, SlotType.BREAK, SlotType.CORE, SlotType.CORE, SlotType.LUNCH, SlotType.ELECTIVE, SlotType.LAB, SlotType.LAB),
            "TUESDAY", List.of(SlotType.FREE, SlotType.CORE, SlotType.CORE, SlotType.BREAK, SlotType.CORE, SlotType.CORE, SlotType.LUNCH, SlotType.ELECTIVE, SlotType.LAB, SlotType.LAB),
            "WEDNESDAY", List.of(SlotType.FREE, SlotType.CORE, SlotType.CORE, SlotType.BREAK, SlotType.CORE, SlotType.CORE, SlotType.LUNCH, SlotType.FREE, SlotType.FREE, SlotType.FREE),
            "THURSDAY", List.of(SlotType.FREE, SlotType.CORE, SlotType.CORE, SlotType.BREAK, SlotType.CORE, SlotType.CORE, SlotType.LUNCH, SlotType.ELECTIVE, SlotType.LAB, SlotType.LAB),
            "FRIDAY", List.of(SlotType.FREE, SlotType.CORE, SlotType.CORE, SlotType.BREAK, SlotType.CORE, SlotType.CORE, SlotType.LUNCH, SlotType.FREE, SlotType.LAB, SlotType.LAB)
    );

    private static final List<String> DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"
    );

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

    @Transactional
    public void generateForAllSections() {
        timetableRepo.deleteAll();

        List<Section> sections = sectionRepo.findAll();
        List<Faculty> faculties = facultyRepo.findAll().stream()
                .filter(Faculty::isActive).toList();
        List<Room> rooms = roomRepo.findAll().stream()
                .filter(Room::isActive).toList();

        if (faculties.isEmpty() || rooms.isEmpty() || sections.isEmpty()) {
            throw new RuntimeException("Missing Faculty / Room / Section data");
        }

        // Lab day assignment (rotation)
        Map<String, String> sectionLabDays = new HashMap<>();
        for (int i = 0; i < sections.size(); i++) {
            sectionLabDays.put(String.valueOf(sections.get(i).getId()), DAYS.get(i % DAYS.size()));
        }

        // Global workload tracking
        Map<Long, Integer> weeklyLoad = new HashMap<>();
        Map<String, Map<Long, Integer>> dailyLoad = new HashMap<>();
        DAYS.forEach(d -> dailyLoad.put(d, new HashMap<>()));

        for (Section section : sections) {
            List<Subject> sectionSubjects = subjectRepo.findByDepartmentAndYear(
                    section.getDepartment(),
                    section.getYear()
            );
            String labDay = sectionLabDays.get(String.valueOf(section.getId()));
            generateInternal(String.valueOf(section.getId()), sectionSubjects, faculties, rooms, weeklyLoad, dailyLoad, labDay);
        }
    }

    @Transactional
    public void generateForSection(String sectionId) {
        timetableRepo.deleteBySectionId(sectionId);

        Section section = sectionRepo.findById(Long.parseLong(sectionId))
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<Faculty> faculties = facultyRepo.findAll().stream()
                .filter(Faculty::isActive).toList();
        List<Room> rooms = roomRepo.findAll().stream()
                .filter(Room::isActive).toList();
        
        List<Subject> subjects = subjectRepo.findByDepartmentAndYear(
                section.getDepartment(),
                section.getYear()
        );

        if (faculties.isEmpty() || rooms.isEmpty() || subjects.isEmpty()) {
            throw new RuntimeException("Missing Faculty / Room / Subject data for this section");
        }

        // Simple lab day assignment for single section (based on its ID hash to be stable)
        String labDay = DAYS.get((int)(section.getId() % DAYS.size()));

        // Calculate current workload from DB for other sections
        Map<Long, Integer> weeklyLoad = new HashMap<>();
        Map<String, Map<Long, Integer>> dailyLoad = new HashMap<>();
        DAYS.forEach(d -> dailyLoad.put(d, new HashMap<>()));
        
        List<TimetableEntry> allEntries = timetableRepo.findAll();
        for (TimetableEntry entry : allEntries) {
            if (entry.getSectionId().equals(sectionId)) continue;
            
            Optional<Faculty> facultyOpt = faculties.stream()
                    .filter(f -> f.getName().equals(entry.getFacultyName()))
                    .findFirst();
            
            if (facultyOpt.isPresent()) {
                Long fId = facultyOpt.get().getId();
                weeklyLoad.put(fId, weeklyLoad.getOrDefault(fId, 0) + 1);
                dailyLoad.get(entry.getDay()).put(fId, dailyLoad.get(entry.getDay()).getOrDefault(fId, 0) + 1);
            }
        }

        generateInternal(sectionId, subjects, faculties, rooms, weeklyLoad, dailyLoad, labDay);
    }

    private void generateInternal(
            String sectionId,
            List<Subject> subjects,
            List<Faculty> faculties,
            List<Room> rooms,
            Map<Long, Integer> weeklyLoad,
            Map<String, Map<Long, Integer>> dailyLoad,
            String labDay
    ) {
        // remaining hours per subject
        Map<Long, Integer> remaining = new HashMap<>();
        for (Subject s : subjects) {
            int total = s.getLectureHoursPerWeek()
                    + s.getTutorialHoursPerWeek()
                    + s.getLabHoursPerWeek();
            remaining.put(s.getId(), total);
        }

        // Section fetch for department filtering
        Long secId = Long.parseLong(sectionId);
        Section section = sectionRepo.findById(secId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        // Day load tracker for SECTION
        Map<String, Integer> sectionDayLoad = new HashMap<>();
        DAYS.forEach(d -> sectionDayLoad.put(d, 0));
        int MAX_CLASSES_PER_DAY = 8;

        // Lab day tracker for this section
        Set<String> labDaysUsed = new HashSet<>();
        
        // Travel optimization
        String lastBuilding = null;

        // DAY → SLOT template driven scheduling
        for (String day : DAYS) {
            List<SlotType> template = WEEK_TEMPLATE.get(day);
            for (int i = 0; i < template.size(); i++) {
                SlotType slotType = template.get(i);
                String slot = SLOTS.get(i);

                if (slotType == SlotType.BREAK) {
                    saveSpecial(sectionId, day, slot, "BREAK");
                    continue;
                }
                if (slotType == SlotType.LUNCH) {
                    saveSpecial(sectionId, day, slot, "LUNCH");
                    continue;
                }
                if (slotType == SlotType.FREE) {
                    continue;
                }

                // 🔥 Section Day balancing rule
                if (sectionDayLoad.get(day) >= MAX_CLASSES_PER_DAY)
                    continue;

                // Categories filtering
                final SlotType currentTargetType = slotType;
                List<Subject> targetSubjects = subjects.stream()
                        .filter(s -> {
                            if (currentTargetType == SlotType.LAB) return s.getLabHoursPerWeek() >= 2;
                            if (currentTargetType == SlotType.ELECTIVE) return s.isElective();
                            if (currentTargetType == SlotType.LIGHT) return s.getName().contains("EVS") || s.getName().contains("PE") || s.getName().contains("Aptitude") || s.getName().contains("Mentoring") || s.isCommonCourse();
                            if (currentTargetType == SlotType.CORE) return !s.isElective();

                            return false;
                        })
                        .filter(s -> remaining.get(s.getId()) > 0)
                        // Pick subject with most remaining hours to distribute evenly
                        .sorted((a, b) -> Integer.compare(remaining.get(b.getId()), remaining.get(a.getId())))
                        .toList();

                if (targetSubjects.isEmpty()) continue;

                boolean assigned = false;

                for (Subject subject : targetSubjects) {
                    // Rule 5: MAX_SAME_SUBJECT_PER_DAY = 1
                    // Allow same subject max 2 times per day
                    long countToday = timetableRepo.countSubjectPerDay(sectionId, day, subject.getCode());
                    if (countToday >= 2) continue;

                    boolean isLab = subject.getLabHoursPerWeek() >= 2;
                    int duration = isLab ? 2 : 1;

                    // Rule 2: Lab day rotation & Afternoon Block
                    if (isLab) {
                        // Soft lab distribution → prefer labDay but allow other days if needed
                        if (!day.equalsIgnoreCase(labDay) && Math.random() < 0.6) continue;

                        // Allow labs on up to 3 days per week
                        if (labDaysUsed.size() >= 3 && !labDaysUsed.contains(day)) continue;

                        // Labs ONLY in Slot 8 + Slot 9 (indices 8 and 9)
                        if (i < 8) continue; 
                    }
                    
                    // Rule 3: Elective ONLY in Slot 7 (index 7)
                    // Prefer electives in slot 7 but allow spillover if needed
                    if (subject.isElective() && i != 7 && Math.random() < 0.6) continue;

                    // Faculty and room filter
                    List<Faculty> eligibleDeptFaculties = faculties.stream()
                            .filter(f -> f.getDepartment().equalsIgnoreCase(section.getDepartment()))
                            .toList();
                    
                    List<Faculty> sortedFaculties = pickFacultiesByLoad(eligibleDeptFaculties, weeklyLoad);

                    for (Faculty faculty : sortedFaculties) {
                        // Workload constraint: Max 3 sessions per day for faculty (approx 3 hours)
                        if (dailyLoad.get(day).getOrDefault(faculty.getId(), 0) >= 5) continue;

                        // Workload constraint: Max hours per week (from entity or default 30)
                        if (weeklyLoad.getOrDefault(faculty.getId(), 0) >= faculty.getMaxHoursPerWeek()) continue;

                        for (Room room : rooms) {
                            // Rule 4: Travel optimization (soft building preference)
                            if (lastBuilding != null && !room.getBuilding().equals(lastBuilding)) {
    if (Math.random() < 0.3) continue; // reduced penalty
}


                            if (isFree(sectionId, subject, faculty, room, day, i, duration)) {
                                placeSession(
                                    sectionId, subject, faculty, room, day, i, duration,
                                    weeklyLoad, dailyLoad, sectionDayLoad, labDaysUsed
                                );
                                
                                remaining.put(subject.getId(), remaining.get(subject.getId()) - duration);
                                assigned = true;
                                lastBuilding = room.getBuilding();
                                if (duration > 1) i += duration - 1;
                                break;
                            }
                        }
                        if (assigned) break;
                    }
                    if (assigned) break;
                }
            }
        }
    }
    // FINAL PASS → fill any remaining empty slots with remaining subjects
private void fillRemainingGaps(
        String sectionId,
        List<Subject> subjects,
        List<Faculty> faculties,
        List<Room> rooms,
        Map<Long, Integer> weeklyLoad,
        Map<String, Map<Long, Integer>> dailyLoad
) {
    for (String day : DAYS) {
        for (String slot : SLOTS) {

            if (slot.equals("10:30-10:45") || slot.equals("01:15-02:05"))
                continue;

            if (timetableRepo.existsBySectionIdAndDayAndTimeSlot(sectionId, day, slot))
                continue;

            for (Subject subject : subjects) {
                for (Faculty faculty : faculties) {
                    for (Room room : rooms) {

                        if (isFree(sectionId, subject, faculty, room, day,
                                SLOTS.indexOf(slot), 1)) {

                            saveEntry(sectionId, subject, faculty, room, day, slot, "LECTURE");
                            return; // place only one per gap
                        }
                    }
                }
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
            Subject subject,
            Faculty faculty,
            Room room,
            String day,
            int slotIndex,
            int duration
    ) {
        for (int i = 0; i < duration; i++) {
            if (slotIndex + i >= SLOTS.size()) return false;
            String slot = SLOTS.get(slotIndex + i);

            // SECTION clash
            if (timetableRepo.existsBySectionIdAndDayAndTimeSlot(sectionId, day, slot))
                return false;

            // FACULTY clash
            if (timetableRepo.existsByFacultyNameAndDayAndTimeSlot(
                    faculty.getName(), day, slot))
                return false;

            // ROOM clash
            if (timetableRepo.existsByRoomNumberAndDayAndTimeSlot(
                    room.getName(), day, slot))
                return false;

            // ELECTIVE / COMMON alignment across sections
            if (subject.isElective() || subject.isCommonCourse()) {
                List<TimetableEntry> existing = timetableRepo.findBySubjectCode(subject.getCode());
                // Only consider entries from OTHER sections for alignment
                List<TimetableEntry> otherSections = existing.stream()
                        .filter(ent -> !ent.getSectionId().equals(sectionId))
                        .toList();

                if (!otherSections.isEmpty()) {
                    // Already scheduled in another section. Must match ONE of those slots.
                    boolean matchFound = false;
                    for (TimetableEntry ent : otherSections) {
                        if (ent.getDay().equalsIgnoreCase(day) && ent.getTimeSlot().equals(slot)) {
                            matchFound = true;
                            break;
                        }
                    }
                    if (!matchFound) return false;
                }
            }
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
            Map<String, Map<Long, Integer>> dailyLoad,
            Map<String, Integer> sectionDayLoad,
            Set<String> labDaysUsed
    ) {
        String type = duration > 1 ? "LAB" : "LECTURE";
        for (int d = 0; d < duration; d++) {
            saveEntry(
                    sectionId,
                    subject,
                    faculty,
                    room,
                    day,
                    SLOTS.get(slotIndex + d),
                    type
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

        sectionDayLoad.put(
                day,
                sectionDayLoad.getOrDefault(day, 0) + duration
        );

        if (type.equals("LAB")) {
            labDaysUsed.add(day);
        }
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
        e.setSubjectName(subject.getName());
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
