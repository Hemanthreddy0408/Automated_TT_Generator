import axios from "axios";
import { Subject, Section } from "@/types/timetable";

/* ===========================
   BASE CONFIG
   =========================== */
const API_BASE_URL = "http://localhost:8083";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRoom = async (id: number, room: any) => {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  return res.json();
};

export const deleteRoom = async (id: number) => {
  await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "DELETE",
  });
};

/* ===========================
   FACULTY API
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateFaculty = async (id: number, faculty: any) => {
  const res = await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faculty),
  });
  return res.json();
};

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

export const updateSubject = async (id: number, subject: Subject) => {
  const res = await axios.put(
    `${API_BASE_URL}/api/subjects/${id}`,
    subject
  );
  return res.data;
};

export const deleteSubject = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/api/subjects/${id}`);
};

// ===== SECTIONS API =====

export const getSections = async () => {
  const res = await fetch("http://localhost:8083/api/sections");
  return res.json();
};

export const createSection = async (section: Omit<any, "id">) => {
  const res = await fetch("http://localhost:8083/api/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(section),
  });
  return res.json();
};

export const deleteSection = async (id: number) => {
  await fetch(`http://localhost:8083/api/sections/${id}`, {
    method: "DELETE",
  });
};

/* ===========================
   CONSTRAINTS API
   =========================== */
export const getConstraints = async () => {
  const response = await fetch(`${API_BASE_URL}/api/constraints`);
  if (!response.ok) throw new Error("Failed to fetch constraints");
  return response.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createConstraint = async (payload: any) => {
  const response = await fetch(`${API_BASE_URL}/api/constraints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create constraint");
  }

  return response.json();
};

export const toggleConstraintStatus = async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/constraints/${id}/toggle`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle status");
  }
};
