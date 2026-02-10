import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import StatCard from '../components/dashboard/StatCard';
import { useUser } from '../context/UserContext';
import { getFacultyTimetable } from '../lib/api';
import { TimetableEntry } from '../components/timetable/TimetableGrid';
import { toast } from 'sonner';

const Dashboard = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const { user, loading: userLoading } = useUser();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (user?.name) {
        setLoading(true);
        try {
          console.log("DEBUG: Fetching schedule for:", user.name);
          const data = await getFacultyTimetable(user.name);
          console.log("DEBUG: Fetched entries:", data);
          setEntries(data);
        } catch (error) {
          console.error("Failed to fetch faculty schedule", error);

        } finally {
          setLoading(false);
        }
      }
    };
    fetchSchedule();
  }, [user?.name]);

  if (userLoading) return null;

  // Calculate Stats
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const todaysClasses = entries.filter(e => e.day.toUpperCase() === today);

  const weeklyLoad = entries.length; // Assuming each entry is 1 hour or standard slot. 
  // Actually slots are 50 mins, but for load calculation, let's just count sessions for now or use credits if available.
  // The user model has maxHoursPerWeek.

  const theoryLoad = entries.filter(e => e.type === 'LECTURE').length;
  const labLoad = entries.filter(e => e.type === 'LAB').length;


  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Faculty Portal</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Welcome back, {user?.name || "Professor"}
            </p>
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
            <StatCard
              label="Today's Classes"
              value={todaysClasses.length.toString().padStart(2, '0')}
              subText={`${todaysClasses.filter(e => e.type === 'LECTURE').length} Theory, ${todaysClasses.filter(e => e.type === 'LAB').length} Lab`}
              icon="school"
            />
            <StatCard
              label="Weekly Load"
              value={`${weeklyLoad}h`}
              subText={`Max ${(user as any)?.maxHoursPerWeek || 20}h`}
              icon="timer"
            />
            <StatCard
              label="My Subjects"
              value={(user as any)?.eligibleSubjects ? (user as any).eligibleSubjects.length.toString().padStart(2, '0') : "04"}
              subText="Fall 2024"
              icon="menu_book"
            />
            <StatCard
              label="Department"
              value={user?.department ? user.department.substring(0, 3).toUpperCase() : "CS"}
              subText="Section Head"
              icon="layers"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-xl font-bold mb-2">Current Week Schedule</h4>
              <p className="text-sm text-slate-500 mb-8 font-medium">My Personalized Academic Calendar</p>
              {loading ? <p>Loading...</p> : <ScheduleGrid entries={entries} />}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981]">analytics</span> My Workload
              </h4>
              <WorkloadProgress label="Total Hours" current={weeklyLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-[#10b981]" />
              <WorkloadProgress label="Theory Load" current={theoryLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-sky-500" />
              <WorkloadProgress label="Lab Load" current={labLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const WorkloadProgress = ({ label, current, max, color }: any) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className={`text-[10px] font-extrabold ${color.replace('bg-', 'text-')} bg-slate-100 px-2 py-0.5 rounded-full`}>
        {current}h / {max}h
      </span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min((current / max) * 100, 100)}%` }}></div>
    </div>
  </div>
);

export default Dashboard;