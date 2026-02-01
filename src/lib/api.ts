import axios from "axios";
import { Subject } from "@/types/timetable";

const API_BASE_URL = "http://localhost:8082";

/* ===========================
   ROOMS API
   =========================== */
export const getRooms = async () => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`);
  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  return res.json();
};

// ✅ NEW: Update Room
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRoom = async (id: number, room: any) => {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  return res.json();
};

// ✅ NEW: Delete Room
export const deleteRoom = async (id: number) => {
  await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "DELETE",
  });
};

/* ===========================
   FACULTY API (Fixed for CRUD)
   =========================== */
export const getFaculty = async () => {
  const res = await fetch(`${API_BASE_URL}/api/faculty`);
  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFaculty = async (faculty: any) => {
  const res = await fetch(`${API_BASE_URL}/api/faculty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faculty),
  });
  return res.json();
};

// ✅ NEW: Update Faculty
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateFaculty = async (id: number, faculty: any) => {
  const res = await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faculty),
  });
  return res.json();
};

// ✅ NEW: Delete Faculty
export const deleteFaculty = async (id: number) => {
  await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
    method: "DELETE",
  });
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