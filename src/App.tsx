import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddConstraintPage from "@/pages/constraints/AddConstraintPage";
// Page Imports
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TimetablePage from "./pages/admin/TimetablePage";
import FacultyPage from "./pages/admin/FacultyPage";
import RoomsPage from "./pages/admin/RoomsPage";
import SubjectsPage from "./pages/admin/SubjectsPage"
;
import ConstraintsPage from "./pages/admin/ConstraintsPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HistoryPage from "./pages/admin/HistoryPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";

// Add/Edit Sub-pages
import AddFacultyPage from "@/pages/faculty/add/AddFacultyPage";
import AddFacultyQualificationsPage from "@/pages/faculty/add/AddFacultyQualificationsPage";
import AddFacultyReviewPage from "@/pages/faculty/add/AddFacultyReviewPage";
import AddSubjectPage from "@/pages/subjects/AddSubjectPage";
import AddRoomPage from "@/pages/rooms/AddRoomPage";
import EditRoomPage from "@/pages/rooms/EditRoomPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC --- */}
          <Route path="/" element={<Index />} />

          {/* --- ADMIN: FACULTY ROUTES (Order Matters: Specific -> General) --- */}
          
          {/* 1. Step 2 & 3 (Deepest paths first) */}
          <Route path="/admin/faculty/add/qualifications" element={<AddFacultyQualificationsPage />} />
          <Route path="/admin/faculty/add/review" element={<AddFacultyReviewPage />} />
          <Route  path="/admin/constraints/add"  element={<AddConstraintPage />}/>
          {/* 2. Step 1 (Add/Edit Entry) */}
          <Route path="/admin/faculty/add" element={<AddFacultyPage />} />

          {/* 3. Main List Page */}
          <Route path="/admin/faculty" element={<FacultyPage />} />


          {/* --- ADMIN: OTHER ROUTES --- */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/timetable" element={<TimetablePage />} />
          
          {/* Rooms */}
          <Route path="/admin/rooms/add" element={<AddRoomPage />} />
          <Route path="/admin/rooms/edit/:id" element={<EditRoomPage />} />
          <Route path="/admin/rooms" element={<RoomsPage />} />

          {/* Subjects */}
          <Route path="/admin/subjects/add" element={<AddSubjectPage />} />
          <Route path="/admin/subjects" element={<SubjectsPage />} />

          {/* Misc Admin */}
          <Route path="/admin/sections" element={<AdminDashboard />} />
          <Route path="/admin/constraints" element={<ConstraintsPage />} />
          <Route path="/admin/history" element={<HistoryPage />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />

          {/* --- FACULTY PORTAL --- */}
          <Route path="/faculty" element={<FacultyDashboard />} />
          
          {/* --- 404 CATCH-ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;