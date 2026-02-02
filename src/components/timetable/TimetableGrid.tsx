import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ScheduleSession,
  TimeSlot,
  DAYS_OF_WEEK,
} from '@/types/timetable';
import {
  mockTimeSlots,
  getSubjectById,
  getFacultyById,
  getRoomById,
} from '@/data/mockData';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, BookOpen, FlaskConical, Users } from 'lucide-react';

interface TimetableGridProps {
  sessions: ScheduleSession[];
  viewMode?: 'section' | 'faculty' | 'room';
  highlightConflicts?: boolean;
  onSessionClick?: (session: ScheduleSession) => void;
  className?: string;
}

const sessionTypeConfig = {
  lecture: {
    class: 'slot-lecture',
    icon: BookOpen,
    label: 'Lecture',
  },
  lab: {
    class: 'slot-lab',
    icon: FlaskConical,
    label: 'Lab',
  },
  tutorial: {
    class: 'slot-tutorial',
    icon: Users,
    label: 'Tutorial',
  },
};

export function TimetableGrid({
  sessions,
  viewMode = 'section',
  highlightConflicts = true,
  onSessionClick,
  className,
}: TimetableGridProps) {
  const timeSlots = useMemo(
    () => mockTimeSlots.filter((slot) => !slot.isBreak),
    []
  );

  const breakSlots = useMemo(
    () => mockTimeSlots.filter((slot) => slot.isBreak),
    []
  );

  const getSessionForSlot = (dayIndex: number, slotId: string) => {
    return sessions.find(
      (session) =>
        session.dayOfWeek === dayIndex && session.timeSlotId === slotId
    );
  };

  const renderTimeCell = (slot: TimeSlot) => (
    <div
      key={slot.id}
      className="flex flex-col items-center justify-center p-2 text-xs text-muted-foreground border-b border-r bg-muted/30"
    >
      <span className="font-medium">{slot.startTime}</span>
      <span className="text-[10px]">to</span>
      <span className="font-medium">{slot.endTime}</span>
    </div>
  );

  const renderBreakRow = (slot: TimeSlot) => (
    <div
      key={slot.id}
      className="col-span-7 flex items-center justify-center py-2 bg-muted/50 border-b text-xs text-muted-foreground font-medium"
    >
      {slot.breakType === 'lunch' ? '🍽️ Lunch Break' : '☕ Short Break'} ({slot.startTime} - {slot.endTime})
    </div>
  );

  const renderSessionCell = (session: ScheduleSession | undefined, dayIndex: number, slotId: string) => {
    if (!session) {
      return (
        <div
          key={`${dayIndex}-${slotId}`}
          className="min-h-[80px] border-b border-r slot-empty flex items-center justify-center"
        >
          <span className="text-xs text-muted-foreground/50">—</span>
        </div>
      );
    }

    const subject = getSubjectById(session.subjectId);
    const faculty = getFacultyById(session.facultyId);
    const room = getRoomById(session.roomId);
    const config = sessionTypeConfig[session.sessionType];
    const Icon = config.icon;

    const cellContent = (
      <div
        onClick={() => onSessionClick?.(session)}
        className={cn(
          'min-h-[80px] p-2 border-b border-r cursor-pointer transition-all duration-200 hover:shadow-md',
          config.class,
          session.hasConflict && highlightConflicts && 'slot-conflict',
          session.duration > 1 && 'row-span-2'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between gap-1">
            <span className="text-xs font-bold truncate">{subject?.code}</span>
            <Icon className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
          </div>
          <p className="text-[11px] font-medium truncate mt-1">{subject?.name}</p>
          <div className="mt-auto pt-2 space-y-0.5">
            <p className="text-[10px] opacity-80 truncate">{faculty?.name}</p>
            <p className="text-[10px] opacity-70 truncate">{room?.code}</p>
          </div>
          {session.hasConflict && (
            <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>Conflict</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Tooltip key={`${dayIndex}-${slotId}`} delayDuration={300}>
        <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs p-3">
          <div className="space-y-2">
            <div>
              <p className="font-semibold">{subject?.name}</p>
              <p className="text-sm text-muted-foreground">{subject?.code} • {config.label}</p>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Faculty:</span> {faculty?.name}</p>
              <p><span className="text-muted-foreground">Room:</span> {room?.name} ({room?.code})</p>
              <p><span className="text-muted-foreground">Credits:</span> {subject?.credits}</p>
            </div>
            {session.hasConflict && (
              <div className="pt-2 border-t">
                <p className="text-sm text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {session.conflictReason || 'Schedule conflict detected'}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className={cn('rounded-xl border bg-card shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] min-w-[900px]">
          {/* Header Row */}
          <div className="bg-muted/50 border-b border-r p-3 flex items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time
            </span>
          </div>
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="bg-muted/50 border-b border-r p-3 text-center"
            >
              <span className="text-sm font-semibold text-foreground">{day}</span>
            </div>
          ))}

          {/* Time Slots and Sessions */}
          {mockTimeSlots.map((slot) => {
            if (slot.isBreak) {
              return renderBreakRow(slot);
            }

            return (
              <React.Fragment key={slot.id}>
                {renderTimeCell(slot)}
                {DAYS_OF_WEEK.map((_, dayIndex) =>
                  renderSessionCell(getSessionForSlot(dayIndex, slot.id), dayIndex, slot.id)
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
