import { useEffect, useState } from 'react';
import axios from 'axios';



import { Link } from 'react-router-dom';
import { TimetableGrid, TimetableEntry } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  mockFaculty,
  mockSessions,
  mockSections,
  getSessionsForFaculty,
  getSubjectById,
  getRoomById,
  getSectionById,
  mockTimeSlots,
} from '@/data/mockData';
import { DAYS_OF_WEEK } from '@/types/timetable';
import {
  Calendar,
  Clock,
  BookOpen,
  Building2,
  Users,
  Bell,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FacultyDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentFaculty, setCurrentFaculty] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8083/api/faculty/1')
      .then(res => setCurrentFaculty(res.data))
      .catch(err => {
        console.error("Failed to fetch faculty:", err);
        // Fallback to mock if API fails for demo purposes
        setCurrentFaculty(mockFaculty[0]);
      });
  }, []);

  if (!currentFaculty) {
    return <div className="p-6">Loading faculty dashboard...</div>;
  }

  const facultySessions = getSessionsForFaculty(currentFaculty.id?.toString() || "");
  const todaySessions = facultySessions.filter(
    (s) => s.dayOfWeek === currentDay
  );

  const totalHours = facultySessions.length;

  const nextSession = facultySessions.find((s) => s.dayOfWeek === currentDay && s.timeSlotId);
  const nextSubject = nextSession ? getSubjectById(nextSession.subjectId) : null;
  const nextRoom = nextSession ? getRoomById(nextSession.roomId) : null;
  const nextSection = nextSession ? getSectionById(nextSession.sectionId) : null;
  const nextTimeSlot = nextSession ? mockTimeSlots.find((t) => t.id === nextSession.timeSlotId) : null;

  const timetableEntries: TimetableEntry[] = (viewMode === 'week' ? facultySessions : todaySessions).map(session => {
    const subject = getSubjectById(session.subjectId);
    const room = getRoomById(session.roomId);
    const timeSlot = mockTimeSlots.find(t => t.id === session.timeSlotId);

    return {
      id: parseInt(session.id.replace(/\D/g, '')) || Math.random(),
      day: DAYS_OF_WEEK[session.dayOfWeek].toUpperCase(),
      timeSlot: timeSlot ? `${timeSlot.startTime}-${timeSlot.endTime}` : "00:00-00:00",
      subjectCode: subject?.code,
      facultyName: currentFaculty.name,
      roomNumber: room?.code,
      type: session.sessionType === 'lab' ? 'LAB' : 'LECTURE',
      hasConflict: session.hasConflict
    };
  });

  const getInitials = (fullName: string) => {
    if (!fullName) return "?";
    return fullName.split(' ').map((n) => n[0]).join('');
  };

  const getFirstName = (fullName: string) => {
    if (!fullName) return "Faculty";
    return fullName.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AcadSchedule</span>
            </div>
            <Badge variant="secondary" className="font-normal">Faculty Portal</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-muted">
                <AvatarImage src={currentFaculty.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(currentFaculty.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{currentFaculty.name}</p>
                <p className="text-xs text-muted-foreground">{currentFaculty.department}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good Morning, {getFirstName(currentFaculty.name)}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your schedule for today, {DAYS_OF_WEEK[currentDay]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-sm text-muted-foreground">Weekly Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentFaculty.eligibleSubjects?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(facultySessions.map((s) => s.sectionId)).size}
                </p>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Schedule View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'day')}>
                <TabsList>
                  <TabsTrigger value="week">Week View</TabsTrigger>
                  <TabsTrigger value="day">Day View</TabsTrigger>
                </TabsList>
              </Tabs>

              {viewMode === 'day' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
                    disabled={currentDay === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-24 text-center">
                    {DAYS_OF_WEEK[currentDay]}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentDay((d) => Math.min(5, d + 1))}
                    disabled={currentDay === 5}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <TimetableGrid
              entries={timetableEntries}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Class */}
            {nextSession && (
              <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Next Class
                    </CardTitle>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                      {nextTimeSlot?.startTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xl font-semibold">{nextSubject?.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{nextSubject?.code}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{nextRoom?.name} ({nextRoom?.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Section {nextSection?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{nextRoom?.building}, Floor {nextRoom?.floor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  {todaySessions.length} class{todaySessions.length !== 1 ? 'es' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No classes scheduled for today
                  </p>
                ) : (
                  todaySessions.map((session) => {
                    const subject = getSubjectById(session.subjectId);
                    const room = getRoomById(session.roomId);
                    const section = getSectionById(session.sectionId);
                    const timeSlot = mockTimeSlots.find((t) => t.id === session.timeSlotId);

                    return (
                      <div
                        key={session.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          session.sessionType === 'lecture' && 'slot-lecture',
                          session.sessionType === 'lab' && 'slot-lab',
                          session.sessionType === 'tutorial' && 'slot-tutorial'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{subject?.code}</p>
                            <p className="text-sm opacity-80">{subject?.name}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {timeSlot?.startTime}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-70">
                          <span>{room?.code}</span>
                          <span>•</span>
                          <span>{section?.name}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 rounded-full bg-success mt-2" />
                  <div>
                    <p className="text-sm">Room changed for CS301</p>
                    <p className="text-xs text-muted-foreground">LH-101 → LH-102 • Today</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-info mt-2" />
                  <div>
                    <p className="text-sm">New schedule published</p>
                    <p className="text-xs text-muted-foreground">Fall 2024 v3 • Aug 1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
