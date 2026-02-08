import { Subject } from "@/types/timetable";
import { mockRooms, mockFaculty, mockSubjects } from "@/data/mockData";

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/* ===========================
   ROOMS API
   =========================== */
export const getRooms = async () => {
  await delay(500);
  return mockRooms;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  await delay(500);
  const newRoom = { ...room, id: `r${Date.now()}` };
  mockRooms.push(newRoom);
  return newRoom;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRoom = async (id: number, room: any) => {
  await delay(500);
  const index = mockRooms.findIndex((r: any) => r.id === id || r.id === String(id));
  if (index !== -1) {
    mockRooms[index] = { ...mockRooms[index], ...room };
    return mockRooms[index];
  }
  return room;
};

export const deleteRoom = async (id: number) => {
  await delay(500);
  const index = mockRooms.findIndex((r: any) => r.id === id || r.id === String(id));
  if (index !== -1) {
    mockRooms.splice(index, 1);
  }
};

/* ===========================
   FACULTY API
   =========================== */
export const getFaculty = async () => {
  await delay(500);
  return mockFaculty;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFaculty = async (faculty: any) => {
  await delay(500);
  const newFaculty = { ...faculty, id: `f${Date.now()}` };
  mockFaculty.push(newFaculty);
  return newFaculty;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateFaculty = async (id: number, faculty: any) => {
  await delay(500);
  const index = mockFaculty.findIndex((f: any) => f.id === id || f.id === String(id));
  if (index !== -1) {
    mockFaculty[index] = { ...mockFaculty[index], ...faculty };
    return mockFaculty[index];
  }
  return faculty;
};

export const deleteFaculty = async (id: number) => {
  await delay(500);
  const index = mockFaculty.findIndex((f: any) => f.id === id || f.id === String(id));
  if (index !== -1) {
    mockFaculty.splice(index, 1);
  }
};

/* ===========================
   SUBJECTS API
   =========================== */
export const getSubjects = async (): Promise<Subject[]> => {
  await delay(500);
  return mockSubjects;
};

export const createSubject = async (subject: Subject) => {
  await delay(500);
  const newSubject = { ...subject, id: `s${Date.now()}` };
  mockSubjects.push(newSubject);
  return newSubject;
};

export const updateSubject = async (id: number, subject: Subject) => {
  await delay(500);
  const index = mockSubjects.findIndex((s: any) => s.id === id || s.id === String(id));
  if (index !== -1) {
    mockSubjects[index] = { ...mockSubjects[index], ...subject };
    return mockSubjects[index];
  }
  return subject;
};

export const deleteSubject = async (id: number) => {
  await delay(500);
  const index = mockSubjects.findIndex((s: any) => s.id === id || s.id === String(id));
  if (index !== -1) {
    mockSubjects.splice(index, 1);
  }
};