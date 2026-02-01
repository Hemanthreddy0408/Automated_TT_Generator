const API_BASE_URL = "http://localhost:8082";

export const getRooms = async () => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`);
  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });
  return res.json();
};

export const getFaculty = async () => {
  const res = await fetch(`${API_BASE_URL}/api/faculty`);
  return res.json();
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFaculty = async (faculty: any) => {
  const res = await fetch(`${API_BASE_URL}/api/faculty`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(faculty),
  });
  return res.json();
};
import axios from "axios";
import { Subject } from "@/types/timetable";



export const getSubjects = async (): Promise<Subject[]> => {
  const res = await axios.get(`${API_BASE_URL}/api/subjects`);
  return res.data;
};

export const createSubject = async (subject: Subject) => {
  const res = await axios.post(`${API_BASE_URL}/api/subjects`, subject);
  return res.data;
};
