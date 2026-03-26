import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  CheckCircle,
  BarChart3,
  Users,
  BookOpen,
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import { getFacultyWorkloadSummary, getAllTimetableEntries, getFacultyAnalyticsDetails, FacultyWorkload } from "@/lib/api";

export default function AnalyticsPage() {
  const [workloads, setWorkloads] = useState<FacultyWorkload[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [facultyDetails, setFacultyDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleFacultyClick = async (facultyName: string) => {
    setSelectedFaculty(facultyName);
    setLoadingDetails(true);
    try {
      const details = await getFacultyAnalyticsDetails(facultyName);
      setFacultyDetails(details);
    } catch (err) {
      console.error("Failed to load faculty details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

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
                      <tr
                        key={w.facultyId}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => handleFacultyClick(w.facultyName)}
                      >
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

      {/* FACULTY DETAILS MODAL */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {selectedFaculty.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedFaculty}</h2>
                  <p className="text-sm text-muted-foreground">Detailed Analytics & Schedule</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedFaculty(null); setFacultyDetails(null); }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading faculty profile...</span>
                  </div>
                </div>
              ) : facultyDetails ? (
                <div className="space-y-8">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-sm text-blue-600 font-semibold">Total Weekly Load</p>
                      <p className="text-2xl font-bold mt-1 text-blue-900">{facultyDetails.weeklyWorkload} hours</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                      <p className="text-sm text-purple-600 font-semibold">Total Subjects Assigned</p>
                      <p className="text-2xl font-bold mt-1 text-purple-900">{facultyDetails.subjectsAssigned?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                      <p className="text-sm text-green-600 font-semibold">Total Sections Handled</p>
                      <p className="text-2xl font-bold mt-1 text-green-900">{facultyDetails.sectionsTeaching?.length || 0}</p>
                    </div>
                  </div>

                  {/* Subject & Sections Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Subjects teaching
                      </h3>
                      <div className="space-y-2">
                        {facultyDetails.subjectsAssigned?.length > 0 ? (
                          facultyDetails.subjectsAssigned.map((sub: string, i: number) => (
                            <div key={i} className="px-3 py-2 bg-muted/40 rounded-lg text-sm border">
                              {sub}
                            </div>
                          ))
                        ) : <p className="text-sm text-muted-foreground italic">No subjects scheduled.</p>}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Sections teaching
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {facultyDetails.sectionsTeaching?.length > 0 ? (
                          facultyDetails.sectionsTeaching.map((sec: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary font-medium text-sm rounded-full border border-primary/20">
                              Section {sec}
                            </span>
                          ))
                        ) : <p className="text-sm text-muted-foreground italic">No sections scheduled.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Daily Schedule */}
                  <div>
                    <h3 className="font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Detailed Regular Schedule
                    </h3>
                    <div className="grid grid-cols-5 gap-4">
                      {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(day => {
                        const lessons = facultyDetails.dailySchedule?.[day] || [];
                        return (
                          <div key={day} className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
                            <div className="bg-muted/50 py-2 border-b text-center font-semibold text-xs text-muted-foreground tracking-wider">
                              {day.substring(0, 3)}
                            </div>
                            <div className="p-2 space-y-2 flex-1 min-h-[150px]">
                              {lessons.length > 0 ? (
                                lessons.map((l: any, i: number) => (
                                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs relative group">
                                    <div className="font-bold text-blue-900 truncate" title={l.subjectCode}>{l.subjectCode}</div>
                                    <div className="text-blue-700 font-medium truncate">{l.sectionName}</div>
                                    <div className="mt-2 text-muted-foreground truncate">{l.timeSlot}</div>
                                    <div className="text-muted-foreground truncate font-medium">{l.roomNumber}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic opacity-50">
                                  Free
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">Failed to load data.</div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4 border-t bg-muted/10 text-right">
              <button
                onClick={() => { setSelectedFaculty(null); setFacultyDetails(null); }}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
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
