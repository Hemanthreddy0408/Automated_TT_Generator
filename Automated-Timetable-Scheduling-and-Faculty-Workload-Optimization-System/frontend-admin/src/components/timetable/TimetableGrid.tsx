
import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Coffee, Utensils, Info, Clock, GraduationCap } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export type TimetableEntry = {
  id?: number;
  sectionId?: string;
  day: string;
  timeSlot: string;
  subjectCode?: string;
  subjectName?: string;
  facultyName?: string;
  roomNumber?: string;
  type: "LECTURE" | "LAB" | "BREAK" | "LUNCH";
  hasConflict?: boolean;
};

type Props = {
  entries?: TimetableEntry[];
};

// Pastel color palette for subjects
const COLORS = [
  "bg-red-50 border-red-200 text-red-900 border-l-red-500",
  "bg-orange-50 border-orange-200 text-orange-900 border-l-orange-500",
  "bg-amber-50 border-amber-200 text-amber-900 border-l-amber-500",
  "bg-green-50 border-green-200 text-green-900 border-l-green-500",
  "bg-emerald-50 border-emerald-200 text-emerald-900 border-l-emerald-500",
  "bg-teal-50 border-teal-200 text-teal-900 border-l-teal-500",
  "bg-cyan-50 border-cyan-200 text-cyan-900 border-l-cyan-500",
  "bg-sky-50 border-sky-200 text-sky-900 border-l-sky-500",
  "bg-blue-50 border-blue-200 text-blue-900 border-l-blue-500",
  "bg-indigo-50 border-indigo-200 text-indigo-900 border-l-indigo-500",
  "bg-violet-50 border-violet-200 text-violet-900 border-l-violet-500",
  "bg-purple-50 border-purple-200 text-purple-900 border-l-purple-500",
  "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900 border-l-fuchsia-500",
  "bg-pink-50 border-pink-200 text-pink-900 border-l-pink-500",
  "bg-rose-50 border-rose-200 text-rose-900 border-l-rose-500",
];

const getColorForSubject = (subjectCode?: string) => {
  if (!subjectCode) return "bg-gray-50 border-gray-100";
  let hash = 0;
  for (let i = 0; i < subjectCode.length; i++) {
    hash = subjectCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export function TimetableGrid({ entries = [] }: Props) {
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const TIME_SLOTS = [
    "08:00-08:50",
    "09:00-09:50",
    "10:00-10:50",
    "10:30-10:45", // BREAK
    "11:00-11:50",
    "12:00-12:50",
    "01:15-02:05", // LUNCH
    "02:10-03:00",
    "03:10-04:00",
    "04:10-05:00",
  ];

  const findEntry = (day: string, slot: string) =>
    entries.find(e => e.day === day && e.timeSlot === slot);

  return (
    <div className="overflow-x-auto border rounded-2xl bg-white shadow-xl">
      <div className="grid grid-cols-[100px_repeat(10,minmax(160px,1fr))] gap-[1px] bg-slate-200">
        {/* HEADER */}
        <div className="bg-slate-50/80 backdrop-blur-sm p-4 font-bold text-xs text-slate-500 uppercase flex items-center justify-center tracking-widest border-b">
          Day / Time
        </div>
        {TIME_SLOTS.map(slot => (
          <div
            key={`header-${slot}`}
            className="bg-slate-50/80 backdrop-blur-sm p-4 font-bold text-xs text-center text-slate-700 flex items-center justify-center whitespace-nowrap border-b"
          >
            {slot}
          </div>
        ))}

        {/* ROWS */}
        {DAYS.map(day => (
          <Fragment key={day}>
            <div className="bg-slate-50/30 font-black text-xs p-4 flex items-center justify-center border-r text-slate-500 tracking-tighter">
              {day}
            </div>
            {TIME_SLOTS.map(slot => {
              const entry = findEntry(day, slot);
              const isSpecial = slot === "10:30-10:45" || slot === "01:15-02:05";
              const label = slot === "10:30-10:45" ? "BREAK" : "LUNCH";

              if (isSpecial) {
                return (
                  <div key={`${day}-${slot}`} className="bg-slate-50/50 flex items-center justify-center p-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                      {label === "LUNCH" ? <Utensils className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                      {label}
                    </div>
                  </div>
                );
              }

              const colorClass = getColorForSubject(entry?.subjectCode);

              return (
                <div key={`${day}-${slot}`} className="bg-white p-2 min-h-[120px]">
                  {entry ? (
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <Card
                          className={`group h-full p-3 flex flex-col gap-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 cursor-pointer ${colorClass} ${entry.hasConflict ? 'ring-2 ring-destructive ring-offset-2' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-black/5 text-[9px] h-5 px-2 font-black tracking-tighter uppercase">
                              {entry.type === "LAB" ? "Laboratory" : "Lecture"}
                            </Badge>
                            {entry.roomNumber && (
                              <div className="flex items-center text-[10px] font-bold text-slate-600 bg-white/60 px-1.5 py-0.5 rounded-md border border-white/20 shadow-inner">
                                <MapPin className="h-3 w-3 mr-1 opacity-50" />
                                {entry.roomNumber}
                              </div>
                            )}
                          </div>

                          <div className="font-black text-sm leading-tight line-clamp-2 tracking-tight">
                            {entry.subjectCode}
                          </div>

                          {entry.facultyName && (
                            <div className="flex items-center text-[11px] font-semibold text-slate-600 mt-auto pt-2 border-t border-black/5">
                              <Users className="h-3 w-3 mr-2 flex-shrink-0 opacity-40" />
                              <span className="truncate">{entry.facultyName}</span>
                            </div>
                          )}
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 overflow-hidden border-none shadow-2xl rounded-2xl z-50">
                        <div className={`p-4 ${colorClass.split(' ')[0]} border-b`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/20 hover:bg-white/30 text-current border-none font-bold">
                              {entry.type}
                            </Badge>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" /> {entry.timeSlot}
                            </span>
                          </div>
                          <h4 className="text-lg font-black tracking-tight leading-tight">
                            {entry.subjectName || entry.subjectCode}
                          </h4>
                          <p className="text-xs font-bold opacity-60 mt-1">{entry.subjectCode}</p>
                        </div>
                        <div className="p-4 bg-white space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Faculty</p>
                              <p className="text-sm font-bold text-slate-700">{entry.facultyName || 'TBA'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                              <p className="text-sm font-bold text-slate-700">{entry.roomNumber || 'TBA'}</p>
                            </div>
                          </div>
                          {entry.hasConflict && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
                              <Info className="h-4 w-4" />
                              <p className="text-[11px] font-bold">This slot has a scheduling conflict</p>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <div className="h-full rounded-2xl border-2 border-dashed border-slate-50 flex items-center justify-center group hover:border-slate-100 transition-colors">
                      <span className="text-slate-100 text-2xl font-black group-hover:text-slate-200">-</span>
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
