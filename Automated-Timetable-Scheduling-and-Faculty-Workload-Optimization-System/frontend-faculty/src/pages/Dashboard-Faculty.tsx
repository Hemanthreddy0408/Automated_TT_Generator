import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import StatCard from '../components/dashboard/StatCard';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface Faculty {
  id: number;
  name: string;
  maxHoursPerWeek: number;
  eligibleSubjects: string[];
  department: string;
  designation: string;
}

const Dashboard = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Fetch detailed faculty data using authenticated user's ID
        const response = await axios.get(`http://localhost:8083/api/faculty/${user.id}`, { timeout: 5000 });
        const fData = response.data;
        setFaculty(fData);

        // Fetch sessions using the faculty name
        if (fData.name) {
          const scheduleRes = await axios.get(`http://localhost:8083/api/timetable/faculty/${encodeURIComponent(fData.name)}`);
          setSessions(scheduleRes.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const theorySessions = sessions.filter((s: any) => s.type?.toLowerCase().includes('theory')).length;
  const labSessions = sessions.filter((s: any) => s.type?.toLowerCase().includes('lab')).length;
  const totalHours = sessions.length * 1.5; // Assuming 1.5h per slot

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Faculty Portal</h2>
            <p className="text-xs text-slate-500 font-medium">Welcome back, {faculty?.name || "Dr. Sarah Mitchell"}</p>
          </div>
          <button
            onClick={onApplyLeave}
            className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
          >
            Apply Leave
          </button>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Today's Classes" value={String(theorySessions + labSessions).padStart(2, '0')} subText={`${theorySessions} Theory, ${labSessions} Lab`} icon="school" />
            <StatCard label="Weekly Load" value={`${totalHours}h`} subText={`Max: ${faculty?.maxHoursPerWeek || 20}h`} icon="timer" />
            <StatCard label="My Subjects" value={faculty?.eligibleSubjects ? faculty.eligibleSubjects.length.toString().padStart(2, '0') : "04"} subText="Active Curriculum" icon="menu_book" />
            <StatCard label="Department" value={faculty?.department || "CSE"} subText="Academic Unit" icon="layers" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-bold mb-2">Current Week Schedule</h4>
              <p className="text-sm text-slate-500 mb-8">My Personalized Academic Calendar</p>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 shadow-sm"></div>
                </div>
              ) : sessions.length > 0 ? (
                <ScheduleGrid sessions={sessions} />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <span className="material-symbols-outlined text-6xl opacity-10">calendar_month</span>
                  <p className="text-sm font-medium">No classes scheduled for you this week.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981]">analytics</span> My Workload
              </h4>
              <WorkloadProgress label="Total Hours" current={totalHours} max={faculty?.maxHoursPerWeek || 20} color="bg-[#10b981]" />
              <WorkloadProgress label="Theory Load" current={theorySessions * 1.5} max={faculty?.maxHoursPerWeek || 20} color="bg-sky-500" />
              <WorkloadProgress label="Lab Load" current={labSessions * 1.5} max={faculty?.maxHoursPerWeek || 20} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const WorkloadProgress = ({ label, current, max, color }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className={`text-[10px] font-extrabold ${color.replace('bg-', 'text-')} bg-slate-100 px-2 py-0.5 rounded-full`}>
        {current}h / {max}h
      </span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${(current / max) * 100}%` }}></div>
    </div>
  </div>
);

export default Dashboard;