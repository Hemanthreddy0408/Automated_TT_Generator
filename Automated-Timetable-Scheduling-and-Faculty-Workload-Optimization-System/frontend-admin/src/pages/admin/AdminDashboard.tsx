import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickStats } from '@/components/timetable/QuickStats';
import { TimetableGrid, TimetableEntry } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { buildTimetableMatrix } from "@/utils/timetableMapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  BookOpen,
  Building2,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getFaculty,
  getSubjects,
  getRooms,
  getSections,
  getAllTimetableEntries,
  getOptimizationChanges,
  clearOptimizationChanges,
  FacultyPayload,
  OptimizationChange
} from "@/lib/api";
import { Section, Subject } from "@/types/timetable";

export default function AdminDashboard() {
  // State
  const [metrics, setMetrics] = useState({
    faculty: 0,
    subjects: 0,
    rooms: 0,
    sections: 0,
    scheduledSessions: 0,
  });
  const [facultyList, setFacultyList] = useState<FacultyPayload[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [allEntries, setAllEntries] = useState<TimetableEntry[]>([]);
  const [optimizationChanges, setOptimizationChanges] = useState<OptimizationChange[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facData, subData, roomData, secData, ttData] = await Promise.all([
          getFaculty(),
          getSubjects(),
          getRooms(),
          getSections(),
          getAllTimetableEntries(),
        ]);

        setFacultyList(facData);
        setSections(secData);
        setAllEntries(ttData);

        setMetrics({
          faculty: facData.length,
          subjects: subData.length,
          rooms: roomData.length,
          sections: secData.length,
          scheduledSessions: ttData.filter(t => t.type === 'LECTURE' || t.type === 'LAB').length,
        });

        // Default to first section for preview
        // Auto select section that actually has timetable
        const sectionWithTT = secData.find(sec =>
          ttData.some(t => String(t.sectionId) === String(sec.id))
        );

        if (sectionWithTT) {
          setSelectedSectionId(String(sectionWithTT.id));
        } else if (secData.length > 0) {
          setSelectedSectionId(String(secData[0].id));
        }

        // Fetch optimization changes
        const changes = await getOptimizationChanges();
        setOptimizationChanges(changes);


      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Timetable for Selected Section
  const selectedSectionEntries = useMemo(() => {
    if (!selectedSectionId) return [];
    return allEntries.filter(e => String(e.sectionId) === selectedSectionId); // Ensure strict string comparison if needed, but backend sends string usually.
    // The api might return sectionId as string in entry. section.id is number/long.
    // Let's coerce both to string.
  }, [allEntries, selectedSectionId]);

  const timetableMatrix = useMemo(() => {
    return buildTimetableMatrix(selectedSectionEntries);
  }, [selectedSectionEntries]);

  // Derived: Active Conflicts (Simple client-side check)
  // We check for Faculty Double Booking or Room Double Booking
  const conflicts = useMemo(() => {
    const conflictsList: { id: string; entryId: number; subject: string; reason: string }[] = [];

    // Group by Day+Slot
    const slotMap = new Map<string, TimetableEntry[]>();

    // Deduplicate identical physical sessions before counting conflicts (e.g. 7 sections taking the same Elective room/faculty)
    const uniqueEntries = new Map<string, TimetableEntry>();
    allEntries.forEach(e => {
      // Electives are exactly identical in Room, TimeSlot, Day, and Faculty
      const physicalKey = `${e.day}-${e.timeSlot}-${e.facultyName}-${e.roomNumber}`;
      if (!uniqueEntries.has(physicalKey)) {
        uniqueEntries.set(physicalKey, e);
      }
    });

    uniqueEntries.forEach(e => {
      const key = `${e.day}-${e.timeSlot}`;
      if (!slotMap.has(key)) slotMap.set(key, []);
      slotMap.get(key)?.push(e);
    });

    slotMap.forEach((entries) => {
      // Check Faculty Overlap
      const facultyEntries = new Map<string, TimetableEntry[]>();
      entries.forEach(e => {
        if (e.facultyName && e.facultyName !== "TBA") {
          if (!facultyEntries.has(e.facultyName)) facultyEntries.set(e.facultyName, []);
          facultyEntries.get(e.facultyName)?.push(e);
        }
      });

      facultyEntries.forEach((clashes, faculty) => {
        if (clashes.length > 1) {
          // The second one is the conflict
          const conflictingEntry = clashes[1];
          conflictsList.push({
            id: crypto.randomUUID(),
            entryId: conflictingEntry.id,
            subject: `Faculty: ${faculty}`,
            reason: `Double booked on ${clashes[0].day} at ${clashes[0].timeSlot}`
          });
        }
      });

      // Check Room Overlap
      const roomEntries = new Map<string, TimetableEntry[]>();
      entries.forEach(e => {
        if (e.roomNumber && e.roomNumber !== "TBA") {
          if (!roomEntries.has(e.roomNumber)) roomEntries.set(e.roomNumber, []);
          roomEntries.get(e.roomNumber)?.push(e);
        }
      });
      roomEntries.forEach((clashes, room) => {
        if (clashes.length > 1) {
          const conflictingEntry = clashes[1];
          conflictsList.push({
            id: crypto.randomUUID(),
            entryId: conflictingEntry.id,
            subject: `Room: ${room}`,
            reason: `Double booked on ${clashes[0].day} at ${clashes[0].timeSlot}`
          });
        }
      });
    });

    return conflictsList;
  }, [allEntries]);

  // Derived: Faculty Workload
  const facultyWorkload = useMemo(() => {
    return facultyList.map(f => {
      const sessions = allEntries.filter(e => e.facultyName === f.name).length;
      return {
        ...f,
        sessions,
        percentage: Math.min((sessions / (f.maxHoursPerWeek || 30)) * 100, 100)
      };
    }).sort((a, b) => b.sessions - a.sessions).slice(0, 5); // Top 5
  }, [facultyList, allEntries]);

  const selectedSectionName = sections.find(s => String(s.id) === selectedSectionId)?.name || "Unknown Section";
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your academic scheduling system"
      actions={
        <div className="flex items-center gap-2">
          {optimizationChanges.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 border-primary/50 text-primary hover:bg-primary/5"
              onClick={() => setIsChangesModalOpen(true)}
            >
              <Users className="h-4 w-4" />
              View Changes
            </Button>
          )}
          <Link to="/admin/timetable">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Timetable
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Faculty"
            value={metrics.faculty}
            subtitle="Active teaching staff"
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 0, isPositive: true }}
            variant="default"
          />
          <MetricCard
            title="Subjects"
            value={metrics.subjects}
            subtitle="Courses this semester"
            icon={<BookOpen className="h-6 w-6" />}
            variant="info"
          />
          <MetricCard
            title="Rooms"
            value={metrics.rooms}
            subtitle="Available venues"
            icon={<Building2 className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="Sections"
            value={metrics.sections}
            subtitle="Student groups"
            icon={<Layers className="h-6 w-6" />}
            variant="warning"
          />
        </div>

        {/* Quick Stats Bar */}
        <Card>
          <CardContent className="py-4">
            <QuickStats
              scheduledCount={metrics.scheduledSessions}
              conflictCount={conflicts.length}
              utilizationRate={85} // Placeholder or calculate
              pendingChanges={0}
            />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timetable Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Current Week Schedule</h2>
                <p className="text-sm text-muted-foreground">{selectedSectionName} • Fall 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Link to={`/admin/timetable?sectionId=${selectedSectionId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Full View
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {selectedSectionId ? (
              <TimetableGrid
                timetable={timetableMatrix}
              />

            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50">
                <p className="text-slate-400">Select a section to view timetable</p>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conflicts Alert */}
            {conflicts.length > 0 ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Active Conflicts
                  </CardTitle>
                  <CardDescription>
                    {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} require attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                  {conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                    >
                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{conflict.subject}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const { resolveConflict } = await import('@/lib/api');
                                await resolveConflict(conflict.entryId);
                                // Refresh entries
                                const { getAllTimetableEntries } = await import('@/lib/api');
                                const newEntries = await getAllTimetableEntries();
                                setAllEntries(newEntries);
                              } catch (e) {
                                console.error('Failed to resolve conflict automatically', e);
                                alert('Could not find a free slot to automatically resolve this conflict.');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            Auto-Resolve
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conflict.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Sparkles className="h-5 w-5" />
                    No Conflicts
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    All systems operational. No scheduling conflicts detected across any sections.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Faculty Workload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Faculty Workload (Top 5)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {facultyWorkload.map((faculty) => {
                  const isOverloaded = faculty.percentage > 90;

                  return (
                    <div key={faculty.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate w-32">{faculty.name}</span>
                        <Badge
                          variant="outline"
                          className={isOverloaded ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-blue-50'}
                        >
                          {faculty.sessions} sessions
                        </Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isOverloaded ? 'bg-red-500' : 'bg-primary'
                            }`}
                          style={{ width: `${faculty.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {facultyWorkload.length === 0 && <p className="text-sm text-muted-foreground">No faculty data.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Optimization Changes Modal */}
      <Dialog open={isChangesModalOpen} onOpenChange={setIsChangesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Optimization Changes
                </DialogTitle>
                <DialogDescription>
                  Review faculty reassignments made during timetable optimization.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={async () => {
                  if (confirm("Clear all optimization history?")) {
                    await clearOptimizationChanges();
                    setOptimizationChanges([]);
                    setIsChangesModalOpen(false);
                  }
                }}
              >
                Clear History
              </Button>
            </div>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Section</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Day/Time</TableHead>
                  <TableHead>Previous Faculty</TableHead>
                  <TableHead className="text-primary font-bold">New Faculty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimizationChanges.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">{change.sectionId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{change.subjectCode}</span>
                        <span className="text-xs text-muted-foreground">{change.subjectName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm capitalize">{change.day.toLowerCase()}</span>
                        <span className="text-xs text-muted-foreground">{change.timeSlot}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground line-through decoration-destructive/30">
                      {change.previousFaculty}
                    </TableCell>
                    <TableCell className="text-primary font-bold">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {change.newFaculty}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {optimizationChanges.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No optimization changes recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
