import axios from "axios";
import { Subject } from "@/types/timetable";

const API_BASE_URL = "http://localhost:8082";

/* ===========================
   ROOMS API
   =========================== */
export const getRooms = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/rooms`);
  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  const res = await axios.post(`${API_BASE_URL}/api/rooms`, room);
  return res.data;
};

// ✅ NEW: Update Room
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRoom = async (id: number, room: any) => {
  const res = await axios.put(`${API_BASE_URL}/api/rooms/${id}`, room);
  return res.data;
};

// ✅ NEW: Delete Room
export const deleteRoom = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/api/rooms/${id}`);
};

/* ===========================
   FACULTY API (Fixed for CRUD)
   =========================== */
export const getFaculty = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/faculty`);
  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFaculty = async (faculty: any) => {
  const res = await axios.post(`${API_BASE_URL}/api/faculty`, faculty);
  return res.data;
};

// ✅ NEW: Update Faculty
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateFaculty = async (id: number, faculty: any) => {
  const res = await axios.put(`${API_BASE_URL}/api/faculty/${id}`, faculty);
  return res.data;
};

// ✅ NEW: Delete Faculty
export const deleteFaculty = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/api/faculty/${id}`);
};

/* ===========================
   SUBJECTS API
   =========================== */
export const getSubjects = async (): Promise<Subject[]> => {
  const res = await axios.get(`${API_BASE_URL}/api/subjects`);
  return res.data;
};

export const createSubject = async (subject: Subject) => {
  const res = await axios.post(`${API_BASE_URL}/api/subjects`, subject);
  return res.data;
};

// ✅ NEW: Update Subject
export const updateSubject = async (id: number, subject: Subject) => {
  const res = await axios.put(`${API_BASE_URL}/api/subjects/${id}`, subject);
  return res.data;
};

// ✅ NEW: Delete Subject
export const deleteSubject = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/api/subjects/${id}`);
};

/* ===========================
   CONSTRAINTS API
   =========================== */
export const getConstraints = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/constraints`);
  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createConstraint = async (data: any) => {
  const res = await axios.post(`${API_BASE_URL}/api/constraints`, data);
  return res.data;
};

export const toggleConstraintStatus = async (id: string) => {
  await axios.patch(`${API_BASE_URL}/api/constraints/${id}/toggle`);
};