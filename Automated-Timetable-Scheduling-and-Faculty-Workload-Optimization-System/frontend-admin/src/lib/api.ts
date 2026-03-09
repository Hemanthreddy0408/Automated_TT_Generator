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

/* -------- UPDATE FACULTY PASSWORD -------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateFacultyPassword = async (id: number, payload: any) => {
  const res = await API.put(`/faculty/${id}/password`, payload);
  return res.data;
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

export const getFacultyTimetable = async (facultyName: string) => {
  const encodedName = encodeURIComponent(facultyName);
  const res = await API.get(`/timetable/faculty/${encodedName}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getFacultyAnalyticsDetails = async (facultyName: string) => {
  const encodedName = encodeURIComponent(facultyName);
  const res = await API.get(`/timetable/faculty/${encodedName}/analytics`);
  return res.data;
};

export const updateTimetableEntry = async (entry: any, force = false) => {
  try {
    const res = await API.put(`/timetable/update?force=${force}`, entry);
    return { success: true, data: res.data };
  } catch (error: any) {
    if (error.response && error.response.status === 409) {
      return { success: false, conflict: true, messages: error.response.data };
    }
    throw error;
  }
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
  status?: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const res = await API.get('/audit-logs');
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Failed to fetch audit logs", e);
    return [];
  }
};

export interface UpdateAuditLogRequest {
  id: number;
  description: string;
  lastModifiedTimestamp: string;
}

export interface UpdateAuditLogResponse {
  success: boolean;
  hasConflict: boolean;
  message: string;
  data?: AuditLog;
  currentData?: AuditLog;
}

export const updateAuditLog = async (payload: UpdateAuditLogRequest): Promise<UpdateAuditLogResponse> => {
  try {
    const res = await API.put(`/audit-logs/${payload.id}`, {
      description: payload.description,
      lastModifiedTimestamp: payload.lastModifiedTimestamp,
    });
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.status === 409) {
      // Conflict detected
      return error.response.data;
    }
    return {
      success: false,
      hasConflict: false,
      message: error.response?.data?.error || "Failed to update audit log",
    };
  }
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
    const res = await API.post("/auth/login", credentials);
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
    const res = await API.post("/auth/verify-otp", request);
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
  await API.post("/auth/logout");
};

/* ===========================
   FACULTY WORKLOAD API
   =========================== */
export const getFacultyWorkloadSummary = async (): Promise<any[]> => {
  try {
    const res = await API.get("/faculty/workload-summary");
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Failed to fetch faculty workload summary", e);
    return [];
  }
};

/* ===========================
   LEAVE OPTIMIZATION API
   =========================== */
export const optimizeForLeave = async (leaveId: number): Promise<any> => {
  const res = await API.post(`/leaves/${leaveId}/optimize`);
  return res.data;
};

export const getNotifications = async (facultyId: number): Promise<any[]> => {
  try {
    const res = await API.get(`/notifications/faculty/${facultyId}?page=0&size=10`);
    return res.data?.content ?? [];
  } catch (e) {
    console.error("Failed to fetch notifications", e);
    return [];
  }
};

export const markNotificationsRead = async (facultyId: number): Promise<void> => {
  try {
    await API.put(`/notifications/faculty/${facultyId}/read-all`);
  } catch (e) {
    console.error("Failed to mark notifications read", e);
  }
};

/* ===========================
   ELECTIVES API
   =========================== */
export const getElectives = async (): Promise<Record<string, any[]>> => {
  try {
    const res = await API.get('/timetable/electives');
    return res.data ?? {};
  } catch (e) {
    console.error("Failed to fetch electives", e);
    return {};
  }
};

/* ===========================
   CONFLICTS API
   =========================== */
export const resolveConflict = async (entryId: number): Promise<any> => {
  const res = await API.post(`/timetable/resolve-conflict/${entryId}`);
  return res.data;
};

/* ===========================
   OPTIMIZATION CHANGES API
   =========================== */
export interface OptimizationChange {
  id: number;
  sectionId: string;
  subjectCode: string;
  subjectName: string;
  day: string;
  timeSlot: string;
  previousFaculty: string;
  newFaculty: string;
  timestamp: string;
}

export const getOptimizationChanges = async (): Promise<OptimizationChange[]> => {
  try {
    const res = await API.get("/timetable/optimization-changes");
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Failed to fetch optimization changes", e);
    return [];
  }
};

export const clearOptimizationChanges = async (): Promise<void> => {
  try {
    await API.delete("/timetable/optimization-changes");
  } catch (e) {
    console.error("Failed to clear optimization changes", e);
  }
};

export const changeAdminPassword = async (data: any): Promise<any> => {
  const response = await API.post('/auth/admin/change-password', data);
  return response.data;
};
