import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


// Page Imports
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TimetablePage from "./pages/admin/TimetablePage";

import FacultyPage from "./pages/admin/FacultyPage";
import RoomsPage from "./pages/admin/RoomsPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import ConstraintsPage from "./pages/admin/ConstraintsPage";
import HistoryPage from "./pages/admin/HistoryPage";


// Add/Edit Sub-pages
import AddFacultyPage from "@/pages/faculty/add/AddFacultyPage";
import AddFacultyQualificationsPage from "@/pages/faculty/add/AddFacultyQualificationsPage";
import AddFacultyReviewPage from "@/pages/faculty/add/AddFacultyReviewPage";
import AddSubjectPage from "@/pages/subjects/AddSubjectPage";
import AddRoomPage from "@/pages/rooms/AddRoomPage";
import EditRoomPage from "@/pages/rooms/EditRoomPage";
import AddConstraintPage from "@/pages/constraints/AddConstraintPage";
import AddSectionPage from "@/pages/section/AddSectionPage";

// NEW Faculty Portal Pages
import DashboardFaculty from "./pages/Dashboard-Faculty";
import FacultySchedule from "./pages/FacultySchedule-Faculty";
import LeaveStatusFaculty from "./pages/LeaveStatus-Faculty";
import DepartmentFaculty from "./pages/Department-Faculty";
import LeaveModal from "./components/leave/LeaveModel";
import LeaveRequestsPage from "./pages/admin/LeaveRequestsPage";
import SectionManagement from "./pages/admin/SectionsPage";
import Login from "./pages/Login";

import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* --- LOGIN --- */}
                <Route path="/login" element={<Login />} />

                {/* --- PUBLIC --- */}
                <Route path="/" element={<Index />} />

                {/* --- FACULTY PORTAL (PROTECTED) --- */}
                <Route path="/faculty">
                  <Route index element={<Navigate to="/faculty/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute requiredRole="faculty">
                        <DashboardFaculty onApplyLeave={() => setLeaveModalOpen(true)} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="schedule"
                    element={
                      <ProtectedRoute requiredRole="faculty">
                        <FacultySchedule />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="leave"
                    element={
                      <ProtectedRoute requiredRole="faculty">
                        <LeaveStatusFaculty onApplyLeave={() => setLeaveModalOpen(true)} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="department"
                    element={
                      <ProtectedRoute requiredRole="faculty">
                        <DepartmentFaculty />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* --- ADMIN: FACULTY ROUTES (PROTECTED) --- */}
                <Route
                  path="/admin/faculty/add/qualifications"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddFacultyQualificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/faculty/add/review"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddFacultyReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/constraints/add"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddConstraintPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/faculty/add"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddFacultyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/faculty"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <FacultyPage />
                    </ProtectedRoute>
                  }
                />

                {/* --- ADMIN: OTHER ROUTES (PROTECTED) --- */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sections/add"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddSectionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sections/edit/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddSectionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/timetable"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <TimetablePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms/add"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms/edit/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <EditRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <RoomsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/subjects/add"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddSubjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/subjects"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <SubjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sections"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <SectionManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/constraints"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ConstraintsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/history"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/leaves"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <LeaveRequestsPage />
                    </ProtectedRoute>
                  }
                />

                {/* --- 404 CATCH-ALL --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

            {/* Global Leave Modal */}
            <LeaveModal
              isOpen={isLeaveModalOpen}
              onClose={() => setLeaveModalOpen(false)}
            />
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
