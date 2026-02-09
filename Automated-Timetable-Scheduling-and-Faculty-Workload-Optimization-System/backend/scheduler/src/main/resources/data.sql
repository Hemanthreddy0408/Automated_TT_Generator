-- Clean up existing data to prevent duplicates on restart
TRUNCATE TABLE timetable_entries RESTART IDENTITY CASCADE;
TRUNCATE TABLE subject_eligible_faculty RESTART IDENTITY CASCADE;
TRUNCATE TABLE subjects RESTART IDENTITY CASCADE;
TRUNCATE TABLE sections RESTART IDENTITY CASCADE;
TRUNCATE TABLE faculty RESTART IDENTITY CASCADE;
TRUNCATE TABLE rooms RESTART IDENTITY CASCADE;

INSERT INTO rooms
(name, code, building, floor, type, capacity, status, active, wheelchair_accessible)
VALUES ('AB1-401','AB1401','AB1','4','LECTURE',70,'PUBLISHED',true,true),
('AB1-402','AB1402','AB1','4','LECTURE',70,'PUBLISHED',true,true),
('AB1-403','AB1403','AB1','4','LECTURE',70,'PUBLISHED',true,true),
('AB1-404','AB1404','AB1','4','LECTURE',70,'PUBLISHED',true,true),
('AB2-201','AB2201','AB2','2','LECTURE',70,'PUBLISHED',true,true),
('AB2-202','AB2202','AB2','2','LECTURE',70,'PUBLISHED',true,true),
('Programming Lab 1','PL1','CSE BLOCK','GF','LAB',40,'PUBLISHED',true,true),
('Programming Lab 2','PL2','CSE BLOCK','GF','LAB',40,'PUBLISHED',true,true),
('Hardware Lab','HWLAB','CSE BLOCK','GF','LAB',35,'PUBLISHED',true,true),
('Networks Lab','NETLAB','CSE BLOCK','1','LAB',35,'PUBLISHED',true,true),
('Seminar Hall','SEM1','ADMIN','2','SEMINAR',120,'PUBLISHED',true,true);

INSERT INTO faculty
(active, department, designation, email, employee_id,
 max_hours_per_day, max_hours_per_week, name, specialization)
VALUES (true,'CSE','Professor','ramya@amrita.edu','CSE001',5,20,'Dr. Ramya G R','Programming'),
(true,'CSE','Professor','dhanya@amrita.edu','CSE002',5,20,'Dr. Dhanya D','Hardware'),
(true,'CSE','Professor','asha@amrita.edu','CSE003',5,20,'Dr. Asha Priya','Communication'),
(true,'CSE','Professor','mahesh@amrita.edu','CSE004',5,20,'Dr. Mahesh J','Mathematics'),
(true,'CSE','Professor','karthik@amrita.edu','CSE005',5,20,'Dr. Karthik','Algorithms'),
(true,'CSE','Associate Professor','anitha@amrita.edu','CSE006',5,20,'Dr. Anitha M','AI'),
(true,'CSE','Associate Professor','raghu@amrita.edu','CSE007',5,20,'Dr. Raghu','Systems'),
(true,'CSE','Associate Professor','divya@amrita.edu','CSE008',5,20,'Dr. Divya','ML'),
(true,'CSE','Associate Professor','vishnu@amrita.edu','CSE009',5,20,'Dr. Vishnu','Networks'),
(true,'CSE','Assistant Professor','nisha@amrita.edu','CSE010',5,18,'Nisha R','Programming'),
(true,'CSE','Assistant Professor','harini@amrita.edu','CSE011',5,18,'Harini S','DBMS'),
(true,'CSE','Assistant Professor','deepak@amrita.edu','CSE012',5,18,'Deepak P','OS'),
(true,'CSE','Assistant Professor','rahul@amrita.edu','CSE013',5,18,'Rahul K','CN'),
(true,'CSE','Assistant Professor','pooja@amrita.edu','CSE014',5,18,'Pooja M','SE'),
(true,'CSE','Lab Instructor','lab1@amrita.edu','CSE015',6,24,'Lab Instructor 1','Programming Lab'),
(true,'CSE','Lab Instructor','lab2@amrita.edu','CSE016',6,24,'Lab Instructor 2','Hardware Lab'),
(true,'CSE','Lab Instructor','lab3@amrita.edu','CSE017',6,24,'Lab Instructor 3','Networks Lab');

INSERT INTO sections (name, department, year, capacity, status)
VALUES
('CSE-A','CSE',1,60,'ACTIVE'),
('CSE-B','CSE',1,60,'ACTIVE'),
('CSE-A','CSE',2,60,'ACTIVE'),
('CSE-B','CSE',2,60,'ACTIVE'),
('CSE-A','CSE',3,60,'ACTIVE'),
('CSE-B','CSE',3,60,'ACTIVE'),
('CSE-A','CSE',4,60,'ACTIVE'),
('CSE-B','CSE',4,60,'ACTIVE');


INSERT INTO subjects
(code,name,department,credits,faculty_count,
 lecture_hours_per_week,tutorial_hours_per_week,lab_hours_per_week,year,elective,common_course)
VALUES
('23CSE101','Computational Problem Solving','CSE',4,1,3,1,3,1,false,false),
('23CSE102','Computer Hardware Essentials','CSE',4,1,3,1,0,1,false,false),
('23MAT101','Calculus','CSE',4,1,3,1,0,1,false,false),
('23EEE101','Basic Electrical & Electronics','CSE',4,1,3,0,3,1,false,false),
('23ENG101','Technical Communication','CSE',3,1,2,0,0,1,false,false);

INSERT INTO subjects  (code,name,department,credits,faculty_count,
 lecture_hours_per_week,tutorial_hours_per_week,lab_hours_per_week,year,elective,common_course)
 VALUES
('23CSE201','Data Structures','CSE',4,1,3,1,3,2,false,false),
('23CSE202','Discrete Math','CSE',4,1,3,1,0,2,false,false),
('23CSE203','Digital Systems','CSE',4,1,3,0,3,2,false,false),
('23MAT201','Probability','CSE',4,1,3,1,0,2,false,false);

INSERT INTO subjects  (code,name,department,credits,faculty_count,
 lecture_hours_per_week,tutorial_hours_per_week,lab_hours_per_week,year,elective,common_course)
 VALUES
('23CSE301','Machine Learning','CSE',4,1,3,0,3,3,false,false),
('23CSE302','Computer Networks','CSE',4,1,3,0,3,3,false,false),
('23CSE303','Theory of Computation','CSE',4,1,3,0,0,3,false,false),
('23CSE304','Embedded Systems','CSE',4,1,3,0,3,3,false,false),
('23CSE351','Professional Elective I','CSE',3,1,3,0,0,3,true,false);

INSERT INTO subjects  (code,name,department,credits,faculty_count,
 lecture_hours_per_week,tutorial_hours_per_week,lab_hours_per_week,year,elective,common_course)
 VALUES
('23CSE401','Compiler Design','CSE',4,1,3,0,3,4,false,false),
('23CSE451','Professional Elective II','CSE',3,1,3,0,0,4,true,false),
('23CSE452','Professional Elective III','CSE',3,1,3,0,0,4,true,false);