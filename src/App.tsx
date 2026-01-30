import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TimetablePage from "./pages/admin/TimetablePage";
import FacultyPage from "./pages/admin/FacultyPage";
import RoomsPage from "./pages/admin/RoomsPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import ConstraintsPage from "./pages/admin/ConstraintsPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HistoryPage from "./pages/admin/HistoryPage";
import AddFacultyPage from "@/pages/faculty/add/AddFacultyPage";
import AddFacultyQualificationsPage from "@/pages/faculty/add/AddFacultyQualificationsPage";
import AddFacultyReviewPage from "@/pages/faculty/add/AddFacultyReviewPage";
import AddSubjectPage from "@/pages/subjects/AddSubjectPage";
import AddRoomPage from "@/pages/rooms/AddRoomPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/timetable" element={<TimetablePage />} />
          <Route path="/admin/faculty" element={<FacultyPage />} />
          <Route path="/admin/rooms" element={<RoomsPage />} />
          <Route path="/admin/subjects" element={<SubjectsPage />} />
          <Route path="/admin/sections" element={<AdminDashboard />} />
          <Route path="/admin/constraints" element={<ConstraintsPage />} />
          <Route path="/admin/history" element={<HistoryPage />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/faculty/add" element={<AddFacultyPage />} />
          <Route path="/admin/faculty/add" element={<AddFacultyPage />} />
          <Route path="/admin/faculty/add/qualifications" element={<AddFacultyQualificationsPage />} />
          <Route path="/admin/faculty/add" element={<AddFacultyPage />} />
          <Route path="/admin/faculty/add" element={<AddFacultyPage />} />
          <Route path="/admin/faculty/add/qualifications" element={<AddFacultyQualificationsPage />} />
          <Route path="/admin/faculty/add/review" element={<AddFacultyReviewPage />}/>
          <Route path="/admin/faculty/add/review"  element={<AddFacultyReviewPage />}/>
          <Route path="/admin/subjects/add" element={<AddSubjectPage />} />
          <Route path="/admin/rooms/add" element={<AddRoomPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />

          {/* Faculty Routes */}
          <Route path="/faculty" element={<FacultyDashboard />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
