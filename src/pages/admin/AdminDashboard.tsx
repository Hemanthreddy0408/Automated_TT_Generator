import { AdminLayout } from '@/components/layout/AdminLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickStats } from '@/components/timetable/QuickStats';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  mockMetrics,
  mockSessions,
  mockFaculty,
  mockSections,
  getSubjectById,
  getFacultyById,
} from '@/data/mockData';
import {
  Users,
  BookOpen,
  Building2,
  Layers,
  Calendar,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const recentChanges = [
    { id: 1, action: 'Session moved', subject: 'CS301', from: 'Mon 9:00', to: 'Tue 10:00', time: '2 hours ago' },
    { id: 2, action: 'Room changed', subject: 'CS401', from: 'LH-101', to: 'LH-102', time: '5 hours ago' },
    { id: 3, action: 'Faculty assigned', subject: 'CS402', faculty: 'Dr. Emily Watson', time: '1 day ago' },
  ];

  const upcomingConflicts = mockSessions.filter(s => s.hasConflict);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your academic scheduling system"
      actions={
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Timetable
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Faculty"
            value={mockMetrics.totalFaculty}
            subtitle="Active teaching staff"
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
            variant="default"
          />
          <MetricCard
            title="Subjects"
            value={mockMetrics.totalSubjects}
            subtitle="Courses this semester"
            icon={<BookOpen className="h-6 w-6" />}
            variant="info"
          />
          <MetricCard
            title="Rooms"
            value={mockMetrics.totalRooms}
            subtitle="Available venues"
            icon={<Building2 className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="Sections"
            value={mockMetrics.totalSections}
            subtitle="Student groups"
            icon={<Layers className="h-6 w-6" />}
            variant="warning"
          />
        </div>

        {/* Quick Stats Bar */}
        <Card>
          <CardContent className="py-4">
            <QuickStats
              scheduledCount={mockMetrics.scheduledSessions}
              conflictCount={mockMetrics.conflictCount}
              utilizationRate={mockMetrics.utilizationRate}
              pendingChanges={3}
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
                <p className="text-sm text-muted-foreground">CS-3A Section • Fall 2024</p>
              </div>
              <Link to="/admin/timetable">
                <Button variant="outline" size="sm" className="gap-2">
                  Full View
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <TimetableGrid
              sessions={mockSessions.filter(s => s.sectionId === 'sec1')}
              highlightConflicts
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conflicts Alert */}
            {upcomingConflicts.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Active Conflicts
                  </CardTitle>
                  <CardDescription>
                    {upcomingConflicts.length} scheduling conflict{upcomingConflicts.length > 1 ? 's' : ''} require attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingConflicts.map((conflict) => {
                    const subject = getSubjectById(conflict.subjectId);
                    return (
                      <div
                        key={conflict.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                      >
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{subject?.code}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conflict.conflictReason}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          Resolve
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Recent Changes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Recent Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {change.action} - <span className="text-primary">{change.subject}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {change.from && change.to ? `${change.from} → ${change.to}` : change.faculty}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{change.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Faculty Workload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Faculty Workload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockFaculty.slice(0, 4).map((faculty) => {
                  const sessionsCount = mockSessions.filter(s => s.facultyId === faculty.id).length;
                  const loadPercentage = (sessionsCount / (faculty.maxHoursPerWeek / 2)) * 100;
                  const isOverloaded = loadPercentage > 90;
                  
                  return (
                    <div key={faculty.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{faculty.name}</span>
                        <Badge 
                          variant="outline" 
                          className={isOverloaded ? 'status-warning' : 'text-muted-foreground'}
                        >
                          {sessionsCount} sessions
                        </Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverloaded ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
