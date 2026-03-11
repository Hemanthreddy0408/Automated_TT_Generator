import axios from "axios";
import { Subject } from "@/types/timetable";

const API_BASE_URL = "https://automated-tt-generator.onrender.com";

export const getAuditLogs = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/audit-logs`);
  return res.data;
};

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

/* ===========================
   TIMETABLE API
   =========================== */
export const getFacultySchedule = async (facultyName: string) => {
  const res = await axios.get(`${API_BASE_URL}/api/timetable/faculty/${facultyName}`);
  return res.data;
};

/* ===========================
   NOTIFICATIONS API
   =========================== */
export const getFacultyNotifications = async (facultyId: number, page = 0, size = 10) => {
  const res = await axios.get(`${API_BASE_URL}/api/notifications/faculty/${facultyId}?page=${page}&size=${size}`);
  return res.data; // Page<NotificationDTO>
};

export const getFacultyUnreadCount = async (facultyId: number) => {
  const res = await axios.get(`${API_BASE_URL}/api/notifications/faculty/${facultyId}/unread-count`);
  return res.data; // { count: number }
};

export const markAllFacultyAsRead = async (facultyId: number) => {
  await axios.put(`${API_BASE_URL}/api/notifications/faculty/${facultyId}/read-all`);
};

export const markNotificationAsRead = async (notificationId: number) => {
  await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`);
};

/* ===========================
   AUTHENTICATION API
   =========================== */
export interface LoginRequest {
  identifier: string; // email or employeeId
  password: string;
  role: "admin" | "faculty";
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  department: string;
  employeeId: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  role: string | null;
  user: UserData | null;
  preAuthToken?: string;
}

export interface OtpVerifyRequest {
  preAuthToken: string;
  otp: string;
  identifier: string;
  role: "admin" | "faculty";
}

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: "Network error. Please check your connection.",
      role: null,
      user: null,
    };
  }
};

export const verifyOtp = async (request: OtpVerifyRequest): Promise<LoginResponse> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, request);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: "Network error. Please check your connection.",
      role: null,
      user: null,
    };
  }
};

export const logout = async (): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/auth/logout`);
};