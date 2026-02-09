// Core data types for Academic Timetable Management System

export type UserRole = 'admin' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
}

export interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  avatarUrl?: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  qualifications: string[];
  specialization: string;
  eligibleSubjects: string[];
  facultyCount: number;
  isActive: boolean;
}
export interface Subject {
  id?: number;
  code: string;
  name: string;
  department: string;
  credits: number;
  lectureHoursPerWeek: number;
  tutorialHoursPerWeek: number;
  labHoursPerWeek: number;
  elective: boolean; // 👈 MATCH BACKEND
  commonCourse: boolean; // 👈 NEW
  facultyCount: number; // 👈 ADDED
  year: number;
  eligibleFaculty: string[];
}


export interface Room {
  id: number;
  name: string;
  code: string;
  building: string;
  floor: string;
  type: 'LECTURE' | 'LAB' | 'SEMINAR';
  capacity: number;
  active: boolean;
  wheelchairAccessible: boolean;
  equipment: string[];
  status?: 'DRAFT' | 'PUBLISHED';  // Add status field for draft functionality
}



export interface Section {
  id: number;
  name: string;
  department: string;
  year: number;
  capacity: number;
  status?: 'ACTIVE' | 'DRAFT';
  mentorId?: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  isBreak: boolean;
  breakType?: 'short' | 'lunch';
}

export interface ScheduleSession {
  id: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  sectionId: string;
  dayOfWeek: number; // 0-6, Monday = 0
  timeSlotId: string;
  sessionType: 'lecture' | 'lab' | 'tutorial';
  duration: number; // number of consecutive slots
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface Timetable {
  id: string;
  name: string;
  semester: string;
  year: number;
  status: 'draft' | 'published' | 'archived';
  sessions: ScheduleSession[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;
}

export interface Constraint {
  id: string;
  type: 'institutional' | 'faculty' | 'room' | 'section';
  name: string;
  description: string;
  isActive: boolean;
  priority: 'mandatory' | 'preferred' | 'optional';
  parameters: Record<string, unknown>;
}

export interface ConflictReport {
  id: string;
  sessionId: string;
  type: 'faculty_overlap' | 'room_overlap' | 'section_overlap' | 'constraint_violation';
  severity: 'error' | 'warning';
  description: string;
  affectedEntities: string[];
  suggestedResolution?: string;
}

export interface ScheduleChange {
  id: string;
  timetableId: string;
  changeType: 'create' | 'update' | 'delete';
  sessionId: string;
  previousState?: Partial<ScheduleSession>;
  newState?: Partial<ScheduleSession>;
  reason: string;
  changedBy: string;
  changedAt: Date;
  isApplied: boolean;
}

export interface DashboardMetrics {
  totalFaculty: number;
  totalSubjects: number;
  totalRooms: number;
  totalSections: number;
  scheduledSessions: number;
  conflictCount: number;
  utilizationRate: number;
  lastUpdated: Date;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
