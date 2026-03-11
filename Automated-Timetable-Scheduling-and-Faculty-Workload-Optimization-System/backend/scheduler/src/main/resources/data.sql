-- Sample data for development

-- Insert Rooms
INSERT INTO rooms (name, code, building, floor, type, capacity, status, active, wheelchair_accessible) VALUES
('Lecture Hall 101', 'LH101', 'Main Building', '1st Floor', 'LECTURE', 100, 'PUBLISHED', true, true),
('Computer Lab 1', 'CL101', 'CS Building', 'Ground Floor', 'LAB', 30, 'PUBLISHED', true, false),
('Seminar Room A', 'SR-A', 'Admin Building', '2nd Floor', 'SEMINAR', 20, 'PUBLISHED', true, true),
('Lecture Hall 102', 'LH102', 'Main Building', '1st Floor', 'LECTURE', 80, 'PUBLISHED', true, false),
('Physics Lab', 'PL101', 'Science Building', '1st Floor', 'LAB', 25, 'PUBLISHED', true, false);

-- Insert Subjects
INSERT INTO subjects (code, name, department, credits, faculty_count, lecture_hours_per_week, tutorial_hours_per_week, lab_hours_per_week, elective) VALUES
('CS101', 'Introduction to Programming', 'CSE', 4, 2, 3, 1, 2, false),
('CS201', 'Data Structures', 'CSE', 4, 2, 3, 1, 2, false),
('CS301', 'Algorithms', 'CSE', 4, 2, 3, 1, 0, false),
('MATH101', 'Calculus I', 'Mathematics', 4, 1, 4, 0, 0, false),
('PHYS101', 'Physics I', 'Physics', 4, 1, 3, 1, 2, false),
('CSE220', 'Computer Networks', 'CSE', 4, 1, 3, 0, 2, false),
('CSE343', 'Machine Learning', 'CSE', 4, 1, 3, 0, 2, false);

-- Insert Faculty
-- Ravi, Ibraheem, Gowtham, Punith requested
INSERT INTO faculty (name, email, department, designation, employee_id, max_hours_per_day, max_hours_per_week, specialization, active) VALUES
('Ravi', 'ravikarthikeya1825@gmail.com', 'CSE', 'Assistant Professor', 'FAC001', 6, 30, 'Machine Learning', true),
('Ibraheem', 'ibraheem@university.edu', 'CSE', 'Assistant Professor', 'FAC002', 6, 30, 'Data Structures', true),
('Gowtham', 'gowtham@university.edu', 'CSE', 'Professor', 'FAC003', 6, 30, 'Calculus', true),
('Punith', 'punith@university.edu', 'CSE', 'Assistant Professor', 'FAC004', 6, 30, 'Quantum Physics', true),
('Dr. Ramya', 'ramya@university.edu', 'CSE', 'Professor', 'FAC005', 10, 60, 'Networks', true);
