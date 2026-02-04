import {
  Faculty,
  Subject,
  Room,
  Section,
  TimeSlot,
  ScheduleSession,
  Timetable,
  Constraint,
  DashboardMetrics,
} from '@/types/timetable';

export const mockFaculty: Faculty[] = [
  {
    id: 'f1',
    name: 'Dr. Sarah Mitchell',
    email: 's.mitchell@university.edu',
    department: 'Computer Science',
    designation: 'Professor',
    qualifications: ['Ph.D. Computer Science', 'M.S. Software Engineering'],
    eligibleSubjects: ['s1', 's2', 's5'],
    maxHoursPerDay: 6,
    maxHoursPerWeek: 20,
    isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 'f2',
    name: 'Dr. James Chen',
    email: 'j.chen@university.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualifications: ['Ph.D. Artificial Intelligence', 'B.Tech. CSE'],
    eligibleSubjects: ['s3', 's4'],
    maxHoursPerDay: 6,
    maxHoursPerWeek: 22,
    isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  },
  {
    id: 'f3',
    name: 'Prof. Emily Watson',
    email: 'e.watson@university.edu',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    qualifications: ['Ph.D. Data Science', 'M.S. Statistics'],
    eligibleSubjects: ['s4', 's6'],
    maxHoursPerDay: 7,
    maxHoursPerWeek: 24,
    isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: 'f4',
    name: 'Dr. Michael Brown',
    email: 'm.brown@university.edu',
    department: 'Computer Science',
    designation: 'Professor',
    qualifications: ['Ph.D. Networks', 'M.Tech. IT'],
    eligibleSubjects: ['s2', 's5'],
    maxHoursPerDay: 5,
    maxHoursPerWeek: 18,
    isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: 'f5',
    name: 'Dr. Lisa Park',
    email: 'l.park@university.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualifications: ['Ph.D. HCI', 'M.Des. Interaction Design'],
    eligibleSubjects: ['s6', 's1'],
    maxHoursPerDay: 6,
    maxHoursPerWeek: 20,
    isActive: false,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
  },
];

export const mockSubjects: Subject[] = [
  {
    id: 's1',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    credits: 4,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    isElective: false,
    eligibleFaculty: ['f1', 'f5'],
  },
  {
    id: 's2',
    code: 'CS302',
    name: 'Database Management Systems',
    department: 'Computer Science',
    credits: 4,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    isElective: false,
    eligibleFaculty: ['f1', 'f4'],
  },
  {
    id: 's3',
    code: 'CS401',
    name: 'Artificial Intelligence',
    department: 'Computer Science',
    credits: 3,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 0,
    labHoursPerWeek: 2,
    isElective: false,
    eligibleFaculty: ['f2'],
  },
  {
    id: 's4',
    code: 'CS402',
    name: 'Machine Learning',
    department: 'Computer Science',
    credits: 4,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    isElective: true,
    eligibleFaculty: ['f2', 'f3'],
  },
  {
    id: 's5',
    code: 'CS303',
    name: 'Computer Networks',
    department: 'Computer Science',
    credits: 3,
    lectureHoursPerWeek: 3,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 0,
    isElective: false,
    eligibleFaculty: ['f1', 'f4'],
  },
  {
    id: 's6',
    code: 'CS403',
    name: 'Human Computer Interaction',
    department: 'Computer Science',
    credits: 3,
    lectureHoursPerWeek: 2,
    tutorialHoursPerWeek: 1,
    labHoursPerWeek: 2,
    isElective: true,
    eligibleFaculty: ['f3', 'f5'],
  },
];

export const mockRooms: Room[] = [
  {
    id: 'r1',
    code: 'LH-101',
    name: 'Lecture Hall 101',
    building: 'Main Block',
    floor: 1,
    capacity: 120,
    type: 'lecture',
    equipment: ['Projector', 'Whiteboard', 'AC', 'Microphone'],
    isActive: true,
  },
  {
    id: 'r2',
    code: 'LH-102',
    name: 'Lecture Hall 102',
    building: 'Main Block',
    floor: 1,
    capacity: 80,
    type: 'lecture',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    isActive: true,
  },
  {
    id: 'r3',
    code: 'LAB-A1',
    name: 'Computer Lab A1',
    building: 'Tech Block',
    floor: 2,
    capacity: 40,
    type: 'lab',
    equipment: ['Computers', 'Projector', 'AC', 'Software Suite'],
    isActive: true,
  },
  {
    id: 'r4',
    code: 'LAB-A2',
    name: 'Computer Lab A2',
    building: 'Tech Block',
    floor: 2,
    capacity: 40,
    type: 'lab',
    equipment: ['Computers', 'Projector', 'AC', 'GPU Workstations'],
    isActive: true,
  },
  {
    id: 'r5',
    code: 'SR-201',
    name: 'Seminar Room 201',
    building: 'Main Block',
    floor: 2,
    capacity: 30,
    type: 'seminar',
    equipment: ['Projector', 'Whiteboard', 'AC', 'Video Conference'],
    isActive: true,
  },
  {
    id: 'r6',
    code: 'LH-201',
    name: 'Lecture Hall 201',
    building: 'Science Block',
    floor: 2,
    capacity: 100,
    type: 'lecture',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    isActive: false,
  },
];

export const mockSections: Section[] = [
  {
    id: 'sec1',
    name: 'CS-3A',
    department: 'Computer Science',
    semester: 5,
    year: 2024,
    strength: 60,
    subjects: ['s1', 's2', 's5'],
  },
  {
    id: 'sec2',
    name: 'CS-3B',
    department: 'Computer Science',
    semester: 5,
    year: 2024,
    strength: 55,
    subjects: ['s1', 's2', 's5'],
  },
  {
    id: 'sec3',
    name: 'CS-4A',
    department: 'Computer Science',
    semester: 7,
    year: 2024,
    strength: 50,
    subjects: ['s3', 's4', 's6'],
  },
  {
    id: 'sec4',
    name: 'CS-4B',
    department: 'Computer Science',
    semester: 7,
    year: 2024,
    strength: 48,
    subjects: ['s3', 's4', 's6'],
  },
];

export const mockTimeSlots: TimeSlot[] = [
  { id: 't1', startTime: '09:00', endTime: '09:50', duration: 50, isBreak: false },
  { id: 't2', startTime: '09:50', endTime: '10:40', duration: 50, isBreak: false },
  { id: 't3', startTime: '10:40', endTime: '10:55', duration: 15, isBreak: true, breakType: 'short' },
  { id: 't4', startTime: '10:55', endTime: '11:45', duration: 50, isBreak: false },
  { id: 't5', startTime: '11:45', endTime: '12:35', duration: 50, isBreak: false },
  { id: 't6', startTime: '12:35', endTime: '13:30', duration: 55, isBreak: true, breakType: 'lunch' },
  { id: 't7', startTime: '13:30', endTime: '14:20', duration: 50, isBreak: false },
  { id: 't8', startTime: '14:20', endTime: '15:10', duration: 50, isBreak: false },
  { id: 't9', startTime: '15:10', endTime: '15:25', duration: 15, isBreak: true, breakType: 'short' },
  { id: 't10', startTime: '15:25', endTime: '16:15', duration: 50, isBreak: false },
  { id: 't11', startTime: '16:15', endTime: '17:05', duration: 50, isBreak: false },
];

export const mockSessions: ScheduleSession[] = [
  // Monday
  { id: 'ss1', subjectId: 's1', facultyId: 'f1', roomId: 'r1', sectionId: 'sec1', dayOfWeek: 0, timeSlotId: 't1', sessionType: 'lecture', duration: 1 },
  { id: 'ss2', subjectId: 's2', facultyId: 'f1', roomId: 'r2', sectionId: 'sec2', dayOfWeek: 0, timeSlotId: 't2', sessionType: 'lecture', duration: 1 },
  { id: 'ss3', subjectId: 's3', facultyId: 'f2', roomId: 'r1', sectionId: 'sec3', dayOfWeek: 0, timeSlotId: 't4', sessionType: 'lecture', duration: 1 },
  { id: 'ss4', subjectId: 's1', facultyId: 'f1', roomId: 'r3', sectionId: 'sec1', dayOfWeek: 0, timeSlotId: 't7', sessionType: 'lab', duration: 2 },
  // Tuesday
  { id: 'ss5', subjectId: 's4', facultyId: 'f3', roomId: 'r1', sectionId: 'sec3', dayOfWeek: 1, timeSlotId: 't1', sessionType: 'lecture', duration: 1 },
  { id: 'ss6', subjectId: 's5', facultyId: 'f4', roomId: 'r2', sectionId: 'sec1', dayOfWeek: 1, timeSlotId: 't2', sessionType: 'lecture', duration: 1 },
  { id: 'ss7', subjectId: 's2', facultyId: 'f1', roomId: 'r3', sectionId: 'sec2', dayOfWeek: 1, timeSlotId: 't4', sessionType: 'lab', duration: 2 },
  { id: 'ss8', subjectId: 's3', facultyId: 'f2', roomId: 'r4', sectionId: 'sec4', dayOfWeek: 1, timeSlotId: 't7', sessionType: 'lab', duration: 2 },
  // Wednesday
  { id: 'ss9', subjectId: 's1', facultyId: 'f1', roomId: 'r1', sectionId: 'sec1', dayOfWeek: 2, timeSlotId: 't1', sessionType: 'lecture', duration: 1 },
  { id: 'ss10', subjectId: 's6', facultyId: 'f3', roomId: 'r5', sectionId: 'sec3', dayOfWeek: 2, timeSlotId: 't2', sessionType: 'tutorial', duration: 1 },
  { id: 'ss11', subjectId: 's4', facultyId: 'f2', roomId: 'r4', sectionId: 'sec4', dayOfWeek: 2, timeSlotId: 't4', sessionType: 'lab', duration: 2 },
  { id: 'ss12', subjectId: 's5', facultyId: 'f4', roomId: 'r2', sectionId: 'sec2', dayOfWeek: 2, timeSlotId: 't7', sessionType: 'lecture', duration: 1 },
  // Thursday
  { id: 'ss13', subjectId: 's2', facultyId: 'f1', roomId: 'r1', sectionId: 'sec1', dayOfWeek: 3, timeSlotId: 't1', sessionType: 'lecture', duration: 1 },
  { id: 'ss14', subjectId: 's3', facultyId: 'f2', roomId: 'r2', sectionId: 'sec3', dayOfWeek: 3, timeSlotId: 't2', sessionType: 'lecture', duration: 1 },
  { id: 'ss15', subjectId: 's1', facultyId: 'f1', roomId: 'r5', sectionId: 'sec1', dayOfWeek: 3, timeSlotId: 't4', sessionType: 'tutorial', duration: 1 },
  { id: 'ss16', subjectId: 's6', facultyId: 'f3', roomId: 'r3', sectionId: 'sec3', dayOfWeek: 3, timeSlotId: 't7', sessionType: 'lab', duration: 2, hasConflict: true, conflictReason: 'Room double-booked with maintenance' },
  // Friday
  { id: 'ss17', subjectId: 's5', facultyId: 'f4', roomId: 'r1', sectionId: 'sec1', dayOfWeek: 4, timeSlotId: 't1', sessionType: 'lecture', duration: 1 },
  { id: 'ss18', subjectId: 's4', facultyId: 'f3', roomId: 'r2', sectionId: 'sec4', dayOfWeek: 4, timeSlotId: 't2', sessionType: 'lecture', duration: 1 },
  { id: 'ss19', subjectId: 's2', facultyId: 'f4', roomId: 'r3', sectionId: 'sec1', dayOfWeek: 4, timeSlotId: 't4', sessionType: 'lab', duration: 2 },
  { id: 'ss20', subjectId: 's1', facultyId: 'f1', roomId: 'r1', sectionId: 'sec2', dayOfWeek: 4, timeSlotId: 't7', sessionType: 'lecture', duration: 1 },
];

export const mockTimetable: Timetable = {
  id: 'tt1',
  name: 'Fall 2024 Schedule',
  semester: 'Fall',
  year: 2024,
  status: 'published',
  sessions: mockSessions,
  createdAt: new Date('2024-07-15'),
  updatedAt: new Date('2024-08-01'),
  publishedAt: new Date('2024-08-01'),
  version: 3,
};

export const mockConstraints: Constraint[] = [
  {
    id: 'c1',
    type: 'institutional',
    name: 'Working Hours',
    description: 'Classes allowed between 9:00 AM and 5:00 PM only',
    isActive: true,
    priority: 'mandatory',
    parameters: { startTime: '09:00', endTime: '17:00' },
  },
  {
    id: 'c2',
    type: 'institutional',
    name: 'Lunch Break',
    description: 'Mandatory lunch break from 12:35 PM to 1:30 PM',
    isActive: true,
    priority: 'mandatory',
    parameters: { startTime: '12:35', endTime: '13:30' },
  },
  {
    id: 'c3',
    type: 'faculty',
    name: 'Maximum Daily Hours',
    description: 'No faculty should teach more than 6 hours per day',
    isActive: true,
    priority: 'mandatory',
    parameters: { maxHours: 6 },
  },
  {
    id: 'c4',
    type: 'room',
    name: 'Lab Continuous Sessions',
    description: 'Lab sessions must be scheduled in 2-hour continuous blocks',
    isActive: true,
    priority: 'mandatory',
    parameters: { minDuration: 2 },
  },
  {
    id: 'c5',
    type: 'section',
    name: 'Elective Alignment',
    description: 'Elective subjects must be scheduled at same time across sections',
    isActive: true,
    priority: 'preferred',
    parameters: {},
  },
  {
    id: 'c6',
    type: 'institutional',
    name: 'Even Distribution',
    description: 'Distribute classes evenly across weekdays',
    isActive: true,
    priority: 'preferred',
    parameters: { maxVariance: 2 },
  },
];

export const mockMetrics: DashboardMetrics = {
  totalFaculty: mockFaculty.filter(f => f.isActive).length,
  totalSubjects: mockSubjects.length,
  totalRooms: mockRooms.filter(r => r.isActive).length,
  totalSections: mockSections.length,
  scheduledSessions: mockSessions.length,
  conflictCount: mockSessions.filter(s => s.hasConflict).length,
  utilizationRate: 78.5,
  lastUpdated: new Date(),
};

// Helper functions
export const getSubjectById = (id: string) => mockSubjects.find(s => s.id === id);
export const getFacultyById = (id: string) => mockFaculty.find(f => f.id === id);
export const getRoomById = (id: string) => mockRooms.find(r => r.id === id);
export const getSectionById = (id: string) => mockSections.find(s => s.id === id);
export const getTimeSlotById = (id: string) => mockTimeSlots.find(t => t.id === id);

export const getSessionsForDay = (dayOfWeek: number) =>
  mockSessions.filter(s => s.dayOfWeek === dayOfWeek);

export const getSessionsForFaculty = (facultyId: string) =>
  mockSessions.filter(s => s.facultyId === facultyId);

export const getSessionsForSection = (sectionId: string) =>
  mockSessions.filter(s => s.sectionId === sectionId);

export const getSessionsForRoom = (roomId: string) =>
  mockSessions.filter(s => s.roomId === roomId);
