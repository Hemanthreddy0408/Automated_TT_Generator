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
import AnnouncementsFaculty from "./pages/Announcements-Faculty";
import LeaveModal from "./components/leave/LeaveModel";
import LeaveRequestsPage from "./pages/admin/LeaveRequestsPage";
import SectionManagement from "./pages/admin/SectionsPage";

import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

const App = () => {
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* --- PUBLIC --- */}
              <Route path="/" element={<Index />} />

              {/* --- FACULTY PORTAL (NEW DESIGN) --- */}
              <Route path="/faculty">
                <Route index element={<Navigate to="/faculty/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardFaculty onApplyLeave={() => setLeaveModalOpen(true)} />} />
                <Route path="schedule" element={<FacultySchedule />} />
                <Route path="leave" element={<LeaveStatusFaculty onApplyLeave={() => setLeaveModalOpen(true)} />} />
                <Route path="department" element={<DepartmentFaculty />} />
                <Route path="announcements" element={<AnnouncementsFaculty onApplyLeave={() => setLeaveModalOpen(true)} />} />
              </Route>

              {/* --- ADMIN: FACULTY ROUTES --- */}
              <Route path="/admin/faculty/add/qualifications" element={<AddFacultyQualificationsPage />} />
              <Route path="/admin/faculty/add/review" element={<AddFacultyReviewPage />} />
              <Route path="/admin/constraints/add" element={<AddConstraintPage />} />
              <Route path="/admin/faculty/add" element={<AddFacultyPage />} />
              <Route path="/admin/faculty" element={<FacultyPage />} />

              {/* --- ADMIN: OTHER ROUTES --- */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/sections/add" element={<AddSectionPage />} />
              <Route path="/admin/sections/edit/:id" element={<AddSectionPage />} />
              <Route path="/admin/timetable" element={<TimetablePage />} />
              <Route path="/admin/rooms/add" element={<AddRoomPage />} />
              <Route path="/admin/rooms/edit/:id" element={<EditRoomPage />} />
              <Route path="/admin/rooms" element={<RoomsPage />} />
              <Route path="/admin/subjects/add" element={<AddSubjectPage />} />
              <Route path="/admin/subjects" element={<SubjectsPage />} />
              <Route path="/admin/sections" element={<SectionManagement />} />
              <Route path="/admin/constraints" element={<ConstraintsPage />} />
              <Route path="/admin/history" element={<HistoryPage />} />
              <Route path="/admin/leaves" element={<LeaveRequestsPage />} />

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
    </QueryClientProvider>
  );
};

export default App;
