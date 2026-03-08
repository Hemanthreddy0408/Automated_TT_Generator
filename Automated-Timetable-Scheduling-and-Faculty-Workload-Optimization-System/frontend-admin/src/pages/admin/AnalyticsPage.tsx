import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  TrendingUp,
  CheckCircle,
  BarChart3,
  Users,
  BookOpen,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getFacultyWorkloadSummary, getAllTimetableEntries } from "@/lib/api";

interface WorkloadSummary {
  facultyId: number;
  facultyName: string;
  department: string;
  designation: string;
  maxHoursPerWeek: number;
  weeklyHours: number;
  lectureHours: number;
  labHours: number;
  dailyBreakdown: Record<string, number>;
}

export default function AnalyticsPage() {
  const [workloads, setWorkloads] = useState<WorkloadSummary[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFacultyWorkloadSummary(), getAllTimetableEntries()])
      .then(([wl, entries]) => {
        setWorkloads(wl);
        setAllEntries(entries);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEntries = allEntries.length;
  const totalFaculty = workloads.length;
  const avgLoad = totalFaculty > 0
    ? Math.round(workloads.reduce((s, w) => s + w.weeklyHours, 0) / totalFaculty)
    : 0;
  const maxLoad = workloads.length > 0 ? workloads[0].weeklyHours : 0;
  const overloaded = workloads.filter(w => w.weeklyHours > w.maxHoursPerWeek).length;

  // Room utilization: count unique room+day+slot combos filled
  const filledSlots = new Set(allEntries.map(e => `${e.roomNumber}|${e.day}|${e.timeSlot}`)).size;
  // Total possible: assume 8 teaching slots/day × 5 days × rooms
  const uniqueRooms = new Set(allEntries.map(e => e.roomNumber)).size;
  const totalPossible = uniqueRooms * 5 * 8;
  const roomUtilPct = totalPossible > 0 ? Math.round((filledSlots / totalPossible) * 100) : 0;

  const top5 = workloads.slice(0, 5);

  return (
    <AdminLayout
      title="Analytics & Workload Insights"
      subtitle="Live faculty workload distribution and scheduling health"
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Total Sessions" value={String(totalEntries)} icon={<BookOpen className="h-5 w-5" />} color="blue" />
          <KpiCard title="Active Faculty" value={String(totalFaculty)} icon={<Users className="h-5 w-5" />} color="green" />
          <KpiCard title="Avg. Weekly Load" value={`${avgLoad}h`} icon={<Clock className="h-5 w-5" />} color="purple" />
          <KpiCard title="Room Utilization" value={`${roomUtilPct}%`} icon={<BarChart3 className="h-5 w-5" />} color="orange" />
        </div>

        {overloaded > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">
              {overloaded} faculty member{overloaded > 1 ? 's are' : ' is'} over the maximum weekly hour limit.
            </span>
          </div>
        )}

        {/* WORKLOAD BAR CHART */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Faculty Workload Distribution</h3>
              <p className="text-sm text-muted-foreground">Weekly teaching hours per faculty</p>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading workload data...
            </div>
          ) : workloads.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No timetable generated yet. Generate a timetable to see workload distribution.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-56 border-b border-muted pb-2 overflow-x-auto">
              {workloads.map((w) => {
                const pct = w.maxHoursPerWeek > 0
                  ? Math.min((w.weeklyHours / w.maxHoursPerWeek) * 100, 100)
                  : 50;
                const isOver = w.weeklyHours > w.maxHoursPerWeek;
                return (
                  <div key={w.facultyId} className="flex-shrink-0 flex flex-col items-center min-w-[60px] group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
                      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                        <p className="font-bold">{w.facultyName}</p>
                        <p>{w.weeklyHours}h / {w.maxHoursPerWeek}h max</p>
                        <p className="opacity-70">{w.lectureHours}L + {w.labHours}Lab</p>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                    </div>
                    <div
                      className="w-10 rounded-t-lg transition-all duration-500 relative"
                      style={{
                        height: `${Math.max(pct * 1.8, 8)}px`,
                        backgroundColor: isOver ? '#ef4444' : `hsl(${210 - pct * 1.2}, 80%, 55%)`
                      }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap">
                        {w.weeklyHours}h
                      </span>
                    </div>
                    <span className="text-[9px] mt-2 text-muted-foreground text-center font-medium leading-tight max-w-[60px] truncate">
                      {w.facultyName.split(' ').slice(-1)[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center items-center gap-6 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Normal Load
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Over Limit
            </div>
          </div>
        </div>

        {/* FACULTY WORKLOAD TABLE */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">Faculty Workload Details</h3>
            <p className="text-sm text-muted-foreground">Daily and weekly breakdown for each faculty</p>
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Loading...</div>
          ) : workloads.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No data available. Generate a timetable first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Faculty</th>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Department</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Mon</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Tue</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Wed</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Thu</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Fri</th>
                    <th className="text-center px-6 py-3 font-semibold text-muted-foreground">Weekly</th>
                    <th className="text-center px-6 py-3 font-semibold text-muted-foreground">Lecture</th>
                    <th className="text-center px-6 py-3 font-semibold text-muted-foreground">Lab</th>
                    <th className="text-center px-6 py-3 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {workloads.map((w) => {
                    const isOver = w.weeklyHours > w.maxHoursPerWeek;
                    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
                    return (
                      <tr key={w.facultyId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{w.facultyName}</p>
                            <p className="text-xs text-muted-foreground">{w.designation}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{w.department}</td>
                        {days.map(d => (
                          <td key={d} className="px-4 py-4 text-center">
                            <span className={`inline-block min-w-[28px] text-center px-2 py-0.5 rounded-full text-xs font-bold ${(w.dailyBreakdown[d] || 0) > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-muted-foreground'
                              }`}>
                              {w.dailyBreakdown[d] || 0}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${isOver ? 'text-red-600' : 'text-foreground'}`}>
                            {w.weeklyHours}h
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ {w.maxHoursPerWeek}h</span>
                        </td>
                        <td className="px-6 py-4 text-center text-blue-600 font-medium">{w.lectureHours}</td>
                        <td className="px-6 py-4 text-center text-purple-600 font-medium">{w.labHours}</td>
                        <td className="px-6 py-4 text-center">
                          {isOver ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Overloaded</span>
                          ) : w.weeklyHours === 0 ? (
                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">Unassigned</span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                              <CheckCircle className="h-3 w-3" /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TOP 5 BUSIEST */}
        {top5.length > 0 && (
          <div className="bg-card border rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-1">Top 5 Busiest Faculty</h3>
            <p className="text-sm text-muted-foreground mb-6">Highest weekly teaching load</p>
            <div className="space-y-4">
              {top5.map((w, i) => {
                const pct = w.maxHoursPerWeek > 0
                  ? Math.min(Math.round((w.weeklyHours / w.maxHoursPerWeek) * 100), 100)
                  : 0;
                const isOver = w.weeklyHours > w.maxHoursPerWeek;
                return (
                  <div key={w.facultyId} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="w-32 text-sm font-medium truncate">{w.facultyName}</div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-16 text-right">{w.weeklyHours}h</span>
                    <span className="text-xs text-muted-foreground w-10">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function KpiCard({ title, value, icon, color }: {
  title: string; value: string; icon: React.ReactNode; color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  const borders: Record<string, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
  };
  return (
    <div className={`bg-card border rounded-2xl p-6 border-l-4 ${borders[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  );
}
