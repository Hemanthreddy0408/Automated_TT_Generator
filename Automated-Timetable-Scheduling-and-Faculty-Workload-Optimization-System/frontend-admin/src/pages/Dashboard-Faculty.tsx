import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import StatCard from '../components/dashboard/StatCard';
import { useUser } from '../context/UserContext';

const Dashboard = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const { user, loading } = useUser();

  if (loading) return null; // Let main layout or sidebar handle loading if needed, or just show nothing

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
              value="03"
              subText="2 Theory, 1 Lab"
              icon="school"
            />
            <StatCard
              label="Weekly Load"
              value={`${(user as any)?.maxHoursPerWeek || 18}h`}
              subText="Assigned hours"
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
              <ScheduleGrid />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981]">analytics</span> My Workload
              </h4>
              <WorkloadProgress label="Total Hours" current={18} max={(user as any)?.maxHoursPerWeek || 20} color="bg-[#10b981]" />
              <WorkloadProgress label="Theory Load" current={12} max={(user as any)?.maxHoursPerWeek || 20} color="bg-sky-500" />
              <WorkloadProgress label="Lab Load" current={6} max={(user as any)?.maxHoursPerWeek || 20} color="bg-purple-500" />
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
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${(current / max) * 100}%` }}></div>
    </div>
  </div>
);

export default Dashboard;