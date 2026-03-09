package com.acadschedule.scheduler.util;

import com.acadschedule.scheduler.entity.*;
import com.acadschedule.scheduler.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class FacultySubjectInitializer implements CommandLineRunner {

    private final FacultyRepository facultyRepo;
    private final SubjectRepository subjectRepo;
    private final SectionRepository sectionRepo;
    private final RoomRepository roomRepo;
    private final PasswordEncoder passwordEncoder;

    public FacultySubjectInitializer(FacultyRepository facultyRepo, SubjectRepository subjectRepo,
            SectionRepository sectionRepo, RoomRepository roomRepo, PasswordEncoder passwordEncoder) {
        this.facultyRepo = facultyRepo;
        this.subjectRepo = subjectRepo;
        this.sectionRepo = sectionRepo;
        this.roomRepo = roomRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing Comprehensive Faculty-Subject Database Seeding...");

        String defaultPass = passwordEncoder.encode("faculty123");

        // 0. Clean and Reset
        roomRepo.deleteAll();
        List<Faculty> allFac = facultyRepo.findAll();
        for (Faculty fac : allFac) {
            fac.setActive(false);
            fac.getEligibleSubjects().clear();
            if (fac.getPassword() == null || fac.getPassword().isEmpty()) {
                fac.setPassword(defaultPass);
            }
        }
        facultyRepo.saveAll(allFac);

        // 1. Create Rooms (35 Rooms: 25 LH, 10 LAB)
        for (int i = 1; i <= 25; i++) {
            Room r = new Room();
            r.setName("LH-" + i);
            r.setCode("LH" + i);
            r.setType(RoomType.LECTURE);
            r.setCapacity(70);
            r.setBuilding("Academic Block");
            r.setFloor(String.valueOf((i - 1) / 5 + 1));
            r.setStatus(RoomStatus.PUBLISHED);
            r.setActive(true);
            roomRepo.save(r);
        }
        for (int i = 1; i <= 10; i++) {
            Room r = new Room();
            r.setName("LAB-" + i);
            r.setCode("LAB" + i);
            r.setType(RoomType.LAB);
            r.setCapacity(40);
            r.setBuilding("Innovation Center");
            r.setFloor(String.valueOf(i));
            r.setStatus(RoomStatus.PUBLISHED);
            r.setActive(true);
            roomRepo.save(r);
        }

        // 2. Create Faculty (30 Faculty)
        List<String> facultyNames = new ArrayList<>(Arrays.asList(
                "Dr. Ramya", "Dr. Vishnu", "Dr. Asha", "Dr. Dhanaya", "Dr. Ravi", "Dr. Meera",
                "Dr. Arun", "Dr. Priya", "Dr. Santosh", "Dr. Kavya", "Dr. Suresh", "Dr. Lakshmi",
                "Dr. Rajesh", "Dr. Anjali", "Dr. Vikram", "Dr. Sneha", "Dr. Manoj", "Dr. Sunita",
                "Dr. Amit", "Dr. Pooja", "Dr. Karthik", "Dr. Swathi", "Dr. Naveen", "Dr. Divya",
                "Dr. Mahesh", "Dr. Deepa", "Dr. Vinay", "Dr. Geetha", "Dr. Sunil", "Dr. Rekha"));

        Map<String, Faculty> facultyMap = new HashMap<>();
        for (String name : facultyNames) {
            Faculty f = facultyRepo.findAll().stream().filter(fac -> fac.getName().equals(name)).findFirst()
                    .orElse(null);
            if (f == null) {
                f = new Faculty();
                f.setName(name);
                f.setEmail(name.replace(" ", "").replace(".", "").toLowerCase() + "@university.edu");
                f.setDepartment("CSE");
                f.setPassword(defaultPass);
            }
            f.setActive(true);
            f.setMaxHoursPerDay(10);
            f.setMaxHoursPerWeek(60);
            f.getEligibleSubjects().clear();
            facultyRepo.save(f);
            facultyMap.put(name, f);
        }

        // 3. Clear Subject mappings
        List<Subject> allSubjects = subjectRepo.findAll();
        for (Subject s : allSubjects) {
            s.getEligibleFaculty().clear();
            subjectRepo.save(s);
        }

        // 4. Create Subjects (6 per year, 3 labs each)
        String[][] subjectsData = {
                // Year 1
                { "Programming in C", "CSE110", "LAB", "1", "4", "3", "2", "false" },
                { "Mathematics", "MATH101", "LECTURE", "1", "4", "4", "0", "false" },
                { "Digital Logic", "CSE120", "LAB", "1", "4", "3", "2", "false" },
                { "Engineering Physics", "PHY101", "LAB", "1", "4", "3", "2", "false" },
                { "English Communication", "ENG101", "LECTURE", "1", "2", "2", "0", "false" },
                { "Environmental Studies", "ENV101", "LECTURE", "1", "2", "2", "0", "false" },
                // Year 2
                { "Data Structures", "CSE210", "LAB", "2", "4", "3", "2", "false" },
                { "Computer Organization", "CSE211", "LECTURE", "2", "3", "3", "0", "false" },
                { "Operating Systems", "CSE310", "LAB", "2", "4", "3", "2", "false" },
                { "Database Systems", "CSE320", "LAB", "2", "4", "3", "2", "false" },
                { "Discrete Mathematics", "MATH201", "LECTURE", "2", "3", "3", "0", "false" },
                { "Theory of Computation", "CSE212", "LECTURE", "2", "3", "3", "0", "false" },
                // Year 3
                { "Computer Networks", "CSE220", "LAB", "3", "4", "3", "2", "false" },
                { "Machine Learning", "CSE343", "LAB", "3", "4", "3", "2", "false" },
                { "Software Engineering", "CSE311", "LAB", "3", "4", "3", "2", "false" },
                { "Artificial Intelligence", "CSE385", "LECTURE", "3", "4", "4", "0", "false" },
                { "Cloud Computing", "CSE380", "ELECTIVE", "3", "3", "3", "0", "true" },
                { "Edge Computing", "CSE370", "ELECTIVE", "3", "3", "3", "0", "true" },
                { "Data Mining", "CSE315", "ELECTIVE", "3", "3", "3", "0", "true" },
                { "Cyber Security", "CSE368", "ELECTIVE", "3", "3", "3", "0", "true" }
        };

        Map<String, Subject> subjectMap = new HashMap<>();
        for (String[] data : subjectsData) {
            String name = data[0];
            String code = data[1];
            Subject s = subjectRepo.findAll().stream().filter(sub -> sub.getCode().equals(code)).findFirst()
                    .orElse(null);
            if (s == null) {
                s = new Subject();
                s.setName(name);
                s.setCode(code);
                s.setDepartment("CSE");
            }
            s.setType(data[2]);
            s.setYear(Integer.parseInt(data[3]));
            s.setCredits(Integer.parseInt(data[4]));
            s.setLectureHoursPerWeek(Integer.parseInt(data[5]));
            s.setLabHoursPerWeek(Integer.parseInt(data[6]));
            s.setElective(Boolean.parseBoolean(data[7]));
            subjectRepo.save(s);
            subjectMap.put(code, s);
        }

        // 5. Create Sections (24 total)
        String[] sectionLetters = { "A", "B", "C", "D", "E", "F", "G", "H" };
        for (int year = 1; year <= 3; year++) {
            for (String letter : sectionLetters) {
                String secName = "CSE " + letter + " (Yr" + year + ")";
                Section sec = sectionRepo.findAll().stream().filter(s -> s.getName().equals(secName)).findFirst()
                        .orElse(null);
                if (sec == null) {
                    sec = new Section();
                    sec.setName(secName);
                    sec.setYear(year);
                    sec.setDepartment("CSE");
                    sec.setCapacity(60);
                    sec.setStatus("ACTIVE");
                    sectionRepo.save(sec);
                }
            }
        }

        // 6. Establish Mappings
        // User specified mappings
        mapFacultyToSubjects(facultyMap.get("Dr. Ramya"), subjectMap, "CSE220", "CSE343", "CSE380", "CSE210", "CSE385");
        mapFacultyToSubjects(facultyMap.get("Dr. Vishnu"), subjectMap, "CSE310", "CSE320", "CSE211", "CSE385");
        mapFacultyToSubjects(facultyMap.get("Dr. Asha"), subjectMap, "CSE110", "MATH101", "CSE311");
        mapFacultyToSubjects(facultyMap.get("Dr. Dhanaya"), subjectMap, "CSE120", "CSE370", "CSE315");
        mapFacultyToSubjects(facultyMap.get("Dr. Ravi"), subjectMap, "PHY101", "CSE368", "CSE220");
        mapFacultyToSubjects(facultyMap.get("Dr. Meera"), subjectMap, "CSE311", "CSE320", "CSE110");

        // Distribute remaining subjects to other faculty
        mapFacultyToSubjects(facultyMap.get("Dr. Arun"), subjectMap, "CSE110", "CSE210", "CSE220", "CSE311", "CSE370");
        mapFacultyToSubjects(facultyMap.get("Dr. Priya"), subjectMap, "MATH101", "ENG101", "ENV101", "MATH201");
        mapFacultyToSubjects(facultyMap.get("Dr. Santosh"), subjectMap, "CSE120", "CSE211", "CSE310", "CSE212",
                "CSE315");
        mapFacultyToSubjects(facultyMap.get("Dr. Kavya"), subjectMap, "PHY101", "CSE320", "CSE343", "CSE380");
        mapFacultyToSubjects(facultyMap.get("Dr. Suresh"), subjectMap, "CSE110", "CSE210", "CSE310", "CSE315",
                "CSE368");
        mapFacultyToSubjects(facultyMap.get("Dr. Lakshmi"), subjectMap, "MATH101", "MATH201", "ENG101", "CSE368");
        mapFacultyToSubjects(facultyMap.get("Dr. Rajesh"), subjectMap, "CSE120", "CSE211", "CSE311", "CSE370");
        mapFacultyToSubjects(facultyMap.get("Dr. Anjali"), subjectMap, "PHY101", "CSE320", "CSE220", "CSE212");
        mapFacultyToSubjects(facultyMap.get("Dr. Vikram"), subjectMap, "CSE210", "CSE310", "CSE343", "CSE380",
                "CSE385");
        mapFacultyToSubjects(facultyMap.get("Dr. Sneha"), subjectMap, "CSE110", "CSE211", "CSE311", "CSE315");
        mapFacultyToSubjects(facultyMap.get("Dr. Manoj"), subjectMap, "CSE120", "CSE210", "CSE320", "CSE368");
        mapFacultyToSubjects(facultyMap.get("Dr. Sunita"), subjectMap, "PHY101", "CSE310", "CSE220", "CSE370");
        mapFacultyToSubjects(facultyMap.get("Dr. Amit"), subjectMap, "MATH101", "MATH201", "ENG101", "ENV101");
        mapFacultyToSubjects(facultyMap.get("Dr. Pooja"), subjectMap, "CSE110", "CSE211", "CSE311", "CSE343");

        // Final tier of faculty to fill any gaps
        mapFacultyToSubjects(facultyMap.get("Dr. Karthik"), subjectMap, "CSE110", "CSE210");
        mapFacultyToSubjects(facultyMap.get("Dr. Swathi"), subjectMap, "CSE120", "CSE211");
        mapFacultyToSubjects(facultyMap.get("Dr. Naveen"), subjectMap, "PHY101", "CSE220", "CSE385");
        mapFacultyToSubjects(facultyMap.get("Dr. Divya"), subjectMap, "MATH101", "CSE310");
        mapFacultyToSubjects(facultyMap.get("Dr. Mahesh"), subjectMap, "CSE210", "CSE311");
        mapFacultyToSubjects(facultyMap.get("Dr. Deepa"), subjectMap, "CSE211", "CSE320");
        mapFacultyToSubjects(facultyMap.get("Dr. Vinay"), subjectMap, "CSE212", "CSE343", "CSE385");
        mapFacultyToSubjects(facultyMap.get("Dr. Geetha"), subjectMap, "MATH201", "CSE110");
        mapFacultyToSubjects(facultyMap.get("Dr. Sunil"), subjectMap, "ENG101", "CSE120");
        mapFacultyToSubjects(facultyMap.get("Dr. Rekha"), subjectMap, "ENV101", "PHY101");

        facultyRepo.saveAll(facultyMap.values());
        subjectRepo.saveAll(subjectMap.values());

        System.out.println("Comprehensive Faculty-Subject Database Seeding Completed!");
    }

    private void mapFacultyToSubjects(Faculty f, Map<String, Subject> subjectMap, String... codes) {
        if (f == null)
            return;
        for (String code : codes) {
            Subject s = subjectMap.get(code);
            if (s != null) {
                f.getEligibleSubjects().add(s.getCode());
                s.getEligibleFaculty().add(f.getName());
            }
        }
    }
}
