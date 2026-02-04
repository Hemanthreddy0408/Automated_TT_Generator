import axios from "axios";
import { Subject, Section } from "@/types/timetable";

/* ===========================
   AXIOS INSTANCE
   =========================== */
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

export const createRoom = async (room: any) => {
  const res = await API.post("/rooms", room);
  return res.data;
};

export const updateRoom = async (id: number, room: any) => {
  const res = await API.put(`/rooms/${id}`, room);
  return res.data;
};

export const deleteRoom = async (id: number) => {
  await API.delete(`/rooms/${id}`);
};
/* ===========================
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
export const createFaculty = async (faculty: FacultyPayload) => {
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
  };

  const res = await API.post("/faculty", payload);
  return res.data;
};

/* -------- UPDATE FACULTY -------- */
export const updateFaculty = async (
  id: number,
  faculty: FacultyPayload
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

export const createSection = async (section: Omit<Section, "id">) => {
  const res = await API.post("/sections", section);
  return res.data;
};

export const deleteSection = async (id: number) => {
  await API.delete(`/sections/${id}`);
};

/* ===========================
   CONSTRAINTS API
   =========================== */
export const getConstraints = async () => {
  const res = await API.get("/constraints");
  return Array.isArray(res.data) ? res.data : [];
};

export const createConstraint = async (payload: any) => {
  const res = await API.post("/constraints", payload);
  return res.data;
};

export const toggleConstraintStatus = async (id: string) => {
  await API.patch(`/constraints/${id}/toggle`);
};

/* ===========================
   TIMETABLE API
   =========================== */
export const generateTimetable = async (sectionId: number) => {
  await API.post(`/timetable/generate/${sectionId}`);
};

export const getTimetable = async (sectionId: number) => {
  const res = await API.get(`/timetable/${sectionId}`);
  return Array.isArray(res.data) ? res.data : [];
};
