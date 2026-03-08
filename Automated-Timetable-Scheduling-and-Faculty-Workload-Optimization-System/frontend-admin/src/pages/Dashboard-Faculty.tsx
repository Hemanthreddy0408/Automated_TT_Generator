import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { TimetableGrid } from '../components/timetable/TimetableGrid';
import { useUser } from '../context/UserContext';
import { generateICS } from '../lib/icsUtils';
import { toast } from 'sonner';
import { getFacultyTimetable, getNotifications, markNotificationsRead } from '../lib/api';
import { TimetableEntry } from '../components/timetable/TimetableGrid';
import { buildTimetableMatrix } from '../utils/timetableMapper';
import PasswordModal from '../components/auth/PasswordModal';
import { TimetableLegend } from '../components/timetable/TimetableLegend';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';

/**
 * Faculty Dashboard Component
 * Displays key metrics for the logged-in faculty member, 
 * including today's classes, weekly workload, and their personalized timetable.
 */
const Dashboard = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const { user, loading: userLoading } = useUser();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          toast.error("Could not load your schedule.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSchedule();
  }, [user?.name]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      if (user?.id) {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      }
    };
    fetchNotifs();
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await markNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const timetableMatrix = useMemo(() => {
    if (!entries.length) return {};
    // Ensure all entries have valid types for the grid
    const sanitized = entries.map(e => ({
      ...e,
      type: (e.type === 'LECTURE' || e.type === 'LAB') ? e.type : 'LECTURE'
    })) as TimetableEntry[];
    return buildTimetableMatrix(sanitized);
  }, [entries]);

  if (userLoading) return null;

  // Calculate Stats
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const todaysClasses = entries.filter(e => e.day.toUpperCase() === today);

  const weeklyLoad = entries.length;
  const theoryLoad = entries.filter(e => e.type === 'LECTURE').length;
  const labLoad = entries.filter(e => e.type === 'LAB').length;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm transition-all">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Portal</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Welcome back, <span className="text-[#10b981] font-bold">{user?.name || "Professor"}</span>
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
            >
              Change Password
            </button>
            <button
              onClick={onApplyLeave}
              className="px-6 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              Apply Leave
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Today's Classes"
              value={todaysClasses.length.toString().padStart(2, '0')}
              subText={`${todaysClasses.filter(e => e.type === 'LECTURE').length} Theory, ${todaysClasses.filter(e => e.type === 'LAB').length} Lab`}
              icon="school"
              trendColor="border-l-sky-500"
            />
            <StatCard
              label="Weekly Load"
              value={`${weeklyLoad}h`}
              subText={`Max ${(user as any)?.maxHoursPerWeek || 20}h`}
              icon="timer"
              trendColor="border-l-[#10b981]"
            />
            <StatCard
              label="My Subjects"
              value={(user as any)?.eligibleSubjects ? (user as any).eligibleSubjects.length.toString().padStart(2, '0') : "04"}
              subText="Active Curriculum"
              icon="menu_book"
              trendColor="border-l-orange-500"
            />
            <StatCard
              label="Department"
              value={user?.department ? user.department.substring(0, 3).toUpperCase() : "CS"}
              subText="Academic Unit"
              icon="layers"
              trendColor="border-l-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Current Week Schedule</h4>
                  <p className="text-sm text-slate-500 font-medium">Your Personalized Academic Calendar</p>
                </div>
                {loading && <div className="animate-pulse text-xs font-bold text-[#10b981]">SYNCING...</div>}
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed">
                  <p className="text-slate-400 font-medium">Updating timetable database...</p>
                </div>
              ) : Object.keys(timetableMatrix).length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed gap-4">
                  <span className="material-symbols-outlined text-4xl text-slate-200">event_busy</span>
                  <p className="text-slate-400 font-medium text-center">No classes scheduled for you this week.<br /><span className="text-xs">Check with your department head.</span></p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
                  <TimetableGrid timetable={timetableMatrix} />
                </div>
              )}

              <TimetableLegend entries={entries} />
            </div>

            <div className="flex flex-col gap-6">
              {/* WORKLOAD PANEL */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg flex flex-col">
                <h4 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-800">
                  <span className="material-symbols-outlined text-[#10b981]">analytics</span> My Workload
                </h4>
                <div className="space-y-2 flex-1">
                  <WorkloadProgress label="Total Hours" current={weeklyLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-[#10b981]" />
                  <WorkloadProgress label="Theory Load" current={theoryLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-sky-500" />
                  <WorkloadProgress label="Lab Load" current={labLoad} max={(user as any)?.maxHoursPerWeek || 20} color="bg-purple-500" />
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-400 leading-relaxed">
                  Workload is calculated based on assigned sessions in the master timetable. Max hours are set by admin policies.
                </div>
              </div>

              {/* NOTIFICATIONS PANEL */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#10b981]" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-300 gap-2">
                      <BellOff className="h-6 w-6" />
                      <p className="text-[11px] font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-[11px] leading-snug transition-colors ${n.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-[#10b981]/5 border-[#10b981]/20 text-slate-700'
                          }`}
                      >
                        <p className="font-bold mb-0.5">{n.title}</p>
                        <p className="opacity-70 line-clamp-2">{n.message}</p>
                        {n.createdAt && (
                          <p className="opacity-40 text-[9px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

const WorkloadProgress = ({ label, current, max, color }: any) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
      <span className={`text-[10px] font-extrabold ${color.replace('bg-', 'text-')} bg-slate-100 px-2 py-0.5 rounded-full shadow-sm`}>
        {current}h / {max}h
      </span>
    </div>
    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full ${color} transition-all duration-1000 ease-out shadow-lg`}
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

export default Dashboard;