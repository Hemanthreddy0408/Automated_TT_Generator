import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { QuickStats } from '@/components/timetable/QuickStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  mockSessions,
  mockSections,
  mockFaculty,
  mockRooms,
  mockMetrics,
  getSessionsForSection,
  getSessionsForFaculty,
  getSessionsForRoom,
} from '@/data/mockData';
import {
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Users,
  Building2,
  Eye,
  Edit3,
  History,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'section' | 'faculty' | 'room';

export default function TimetablePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('section');
  const [selectedEntity, setSelectedEntity] = useState<string>('sec1');
  const [isEditing, setIsEditing] = useState(false);

  const getSessionsForView = () => {
    switch (viewMode) {
      case 'section':
        return getSessionsForSection(selectedEntity);
      case 'faculty':
        return getSessionsForFaculty(selectedEntity);
      case 'room':
        return getSessionsForRoom(selectedEntity);
      default:
        return mockSessions;
    }
  };

  const getEntityOptions = () => {
    switch (viewMode) {
      case 'section':
        return mockSections.map((s) => ({ id: s.id, name: s.name }));
      case 'faculty':
        return mockFaculty.filter(f => f.isActive).map((f) => ({ id: f.id, name: f.name }));
      case 'room':
        return mockRooms.filter(r => r.active).map((r) => ({ id: r.id, name: `${r.code} - ${r.name}` }));
      default:
        return [];
    }
  };

  const viewModeConfig = {
    section: { icon: Layers, label: 'Section' },
    faculty: { icon: Users, label: 'Faculty' },
    room: { icon: Building2, label: 'Room' },
  };

  return (
    <AdminLayout
      title="Timetable Management"
      subtitle="View, generate, and manage academic schedules"
      actions={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as Image</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Bar */}
        <Card>
          <CardContent className="py-4">
            <QuickStats
              scheduledCount={mockMetrics.scheduledSessions}
              conflictCount={mockMetrics.conflictCount}
              utilizationRate={mockMetrics.utilizationRate}
              pendingChanges={2}
            />
          </CardContent>
        </Card>

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => {
              setViewMode(v as ViewMode);
              const options = v === 'section' ? mockSections : v === 'faculty' ? mockFaculty : mockRooms;
              setSelectedEntity(String(options[0]?.id || ''));
            }}>
              <TabsList className="bg-muted/50">
                {Object.entries(viewModeConfig).map(([key, { icon: Icon, label }]) => (
                  <TabsTrigger key={key} value={key} className="gap-2">
                    <Icon className="h-4 w-4" />
                    By {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Entity Selector */}
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {getEntityOptions().map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Eye className="h-4 w-4" />
                  View Mode
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit Mode
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Timetable Status */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="status-active">
            Published • Version 3
          </Badge>
          <span className="text-sm text-muted-foreground">
            Last updated: Aug 1, 2024 at 2:30 PM
          </span>
          {isEditing && (
            <Badge variant="outline" className="status-warning animate-pulse-soft">
              Editing Mode Active
            </Badge>
          )}
        </div>

        {/* Timetable Grid */}
        <TimetableGrid
          sessions={getSessionsForView()}
          viewMode={viewMode}
          highlightConflicts
          onSessionClick={(session) => {
            if (isEditing) {
              console.log('Edit session:', session);
            }
          }}
        />

        {/* Legend */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded slot-lecture" />
                <span className="text-sm">Lecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded slot-lab" />
                <span className="text-sm">Laboratory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded slot-tutorial" />
                <span className="text-sm">Tutorial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-dashed border-destructive bg-destructive/10" />
                <span className="text-sm">Conflict</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded slot-break" />
                <span className="text-sm">Break</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
