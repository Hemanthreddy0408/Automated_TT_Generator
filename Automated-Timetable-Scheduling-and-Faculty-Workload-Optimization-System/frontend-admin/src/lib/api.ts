import axios from "axios";
import { Subject, Section } from "@/types/timetable";

/* ===========================
   BASE CONFIG
   AXIOS INSTANCE
   =========================== */
const API_BASE_URL = "http://localhost:8083";
const API = axios.create({
  baseURL: "http://localhost:8083/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================
   ROOMS API
   =========================== */
export const getRooms = async () => {
  const res = await API.get("/rooms");
  return Array.isArray(res.data) ? res.data : [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  const res = await API.post("/rooms", room);
  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRoom = async (id: number, room: any) => {
  const res = await API.put(`/rooms/${id}`, room);
  return res.data;
};

export const deleteRoom = async (id: number) => {
  await API.delete(`/rooms/${id}`);
};

/* ===========================
   FACULTY API
   FACULTY API ✅ FINAL & SAFE
   =========================== */
export interface FacultyPayload {
  id?: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  isActive: boolean;
  avatarUrl?: string | null;
}

/* -------- GET ALL FACULTY -------- */
export const getFaculty = async (): Promise<FacultyPayload[]> => {
  const res = await API.get("/faculty");
  return Array.isArray(res.data) ? res.data : [];
};

/* -------- CREATE FACULTY -------- */
export const createFaculty = async (faculty: FacultyPayload & { qualifications?: string[], eligibleSubjects?: string[] }) => {
  const payload = {
    name: faculty.name,
    email: faculty.email,
    department: faculty.department,
    designation: faculty.designation,
    employeeId: faculty.employeeId,
    maxHoursPerDay: faculty.maxHoursPerDay,
    maxHoursPerWeek: faculty.maxHoursPerWeek,
    active: faculty.isActive,
    avatarUrl: faculty.avatarUrl ?? null,
    qualifications: faculty.qualifications || [],
    eligibleSubjects: faculty.eligibleSubjects || [],
  };
  const res = await API.post("/faculty", payload);
  return res.data;
};

/* -------- UPDATE FACULTY -------- */
export const updateFaculty = async (
  id: number,
  faculty: FacultyPayload & { qualifications?: string[], eligibleSubjects?: string[] }
) => {
  const payload = {
    name: faculty.name,
    email: faculty.email,
    department: faculty.department,
    designation: faculty.designation,
    employeeId: faculty.employeeId,
    maxHoursPerDay: faculty.maxHoursPerDay,
    maxHoursPerWeek: faculty.maxHoursPerWeek,
    active: faculty.isActive,
    avatarUrl: faculty.avatarUrl ?? null,
    qualifications: faculty.qualifications || [],
    eligibleSubjects: faculty.eligibleSubjects || [],
  };
  const res = await API.put(`/faculty/${id}`, payload);
  return res.data;
};

/* -------- DELETE FACULTY -------- */
export const deleteFaculty = async (id: number) => {
  await API.delete(`/faculty/${id}`);
};

/* ===========================
   SUBJECTS API
   =========================== */
export const getSubjects = async (): Promise<Subject[]> => {
  const res = await API.get("/subjects");
  return Array.isArray(res.data) ? res.data : [];
};

export const createSubject = async (subject: Subject) => {
  const res = await API.post("/subjects", subject);
  return res.data;
};

export const updateSubject = async (id: number, subject: Subject) => {
  const res = await API.put(`/subjects/${id}`, subject);
  return res.data;
};

export const deleteSubject = async (id: number) => {
  await API.delete(`/subjects/${id}`);
};

/* ===========================
   SECTIONS API
   =========================== */
export const getSections = async (): Promise<Section[]> => {
  const res = await API.get("/sections");
  return Array.isArray(res.data) ? res.data : [];
};

export const getSection = async (id: string): Promise<Section> => {
  const res = await API.get(`/sections/${id}`);
  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSection = async (section: any) => {
  const res = await API.post("/sections", section);
  return res.data;
};


export const deleteSection = async (id: number) => {
  await API.delete(`/sections/${id}`);
};

export const updateSection = async (id: number, section: any) => {
  const res = await API.put(`/sections/${id}`, section);
  return res.data;
};

/* ===========================
   CONSTRAINTS API
   =========================== */
export const getConstraints = async () => {
  const res = await API.get("/constraints");
  return Array.isArray(res.data) ? res.data : [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createConstraint = async (payload: any) => {
  const res = await API.post("/constraints", payload);
  return res.data;
};

export const toggleConstraintStatus = async (id: string) => {
  await API.patch(`/constraints/${id}/toggle`);
};

/* ===========================
   TIMETABLE API ✅ FIXED
   =========================== */
// SECTION ID IS STRING (UUID)
export const generateTimetable = async (sectionId: string) => {
  await API.post(`/timetable/generate/${sectionId}`);
};

export const generateAllTimetables = async () => {
  await API.post(`/timetable/generate-all`);
};

export const getTimetable = async (sectionId: string) => {
  const res = await API.get(`/timetable/${sectionId}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllTimetableEntries = async () => {
  const res = await API.get("/timetable");
  return Array.isArray(res.data) ? res.data : [];
};

/* ===========================
   AUDIT LOG API
   =========================== */
export interface AuditLog {
  id: number;
  userEmail: string;
  actionType: string;
  entityType: string;
  description: string;
  timestamp: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const res = await API.get("/audit-logs");
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Failed to fetch audit logs", e);
    return [];
  }
};
