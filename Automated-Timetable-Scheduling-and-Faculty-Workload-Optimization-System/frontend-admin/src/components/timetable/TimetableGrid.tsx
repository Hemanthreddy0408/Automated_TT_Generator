
import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Coffee, Utensils } from "lucide-react";

export type TimetableEntry = {
  id?: number;
  day: string;
  timeSlot: string;
  subjectCode?: string;
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
  "bg-red-100 border-red-200 text-red-900",
  "bg-orange-100 border-orange-200 text-orange-900",
  "bg-amber-100 border-amber-200 text-amber-900",
  "bg-green-100 border-green-200 text-green-900",
  "bg-emerald-100 border-emerald-200 text-emerald-900",
  "bg-teal-100 border-teal-200 text-teal-900",
  "bg-cyan-100 border-cyan-200 text-cyan-900",
  "bg-sky-100 border-sky-200 text-sky-900",
  "bg-blue-100 border-blue-200 text-blue-900",
  "bg-indigo-100 border-indigo-200 text-indigo-900",
  "bg-violet-100 border-violet-200 text-violet-900",
  "bg-purple-100 border-purple-200 text-purple-900",
  "bg-fuchsia-100 border-fuchsia-200 text-fuchsia-900",
  "bg-pink-100 border-pink-200 text-pink-900",
  "bg-rose-100 border-rose-200 text-rose-900",
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
    <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
      <div className="grid grid-cols-[100px_repeat(10,minmax(140px,1fr))] gap-[1px] bg-slate-200 border-b">
        {/* HEADER */}
        <div className="bg-slate-50 p-3 font-bold text-xs text-slate-500 uppercase flex items-center justify-center tracking-wider">
          Day / Time
        </div>
        {TIME_SLOTS.map(slot => (
          <div
            key={`header-${slot}`}
            className="bg-slate-50 p-3 font-semibold text-xs text-center text-slate-700 flex items-center justify-center whitespace-nowrap"
          >
            {slot}
          </div>
        ))}

        {/* ROWS */}
        {DAYS.map(day => (
          <Fragment key={day}>
            <div className="bg-white font-bold text-xs p-3 flex items-center justify-center border-r text-slate-700">
              {day.substring(0, 3)}
            </div>
            {TIME_SLOTS.map(slot => {
              const entry = findEntry(day, slot);
              const isSpecial = slot === "10:30-10:45" || slot === "01:15-02:05";
              const label = slot === "10:30-10:45" ? "BREAK" : "LUNCH";

              if (isSpecial) {
                return (
                  <div key={`${day}-${slot}`} className="bg-slate-50/50 flex items-center justify-center p-1">
                    <div className="text-[10px] text-slate-400 font-medium rotate-0 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">
                      {label === "LUNCH" ? <Utensils className="h-3 w-3 inline mr-1" /> : <Coffee className="h-3 w-3 inline mr-1" />}
                      {label}
                    </div>
                  </div>
                );
              }

              const colorClass = getColorForSubject(entry?.subjectCode);

              return (
                <div key={`${day}-${slot}`} className="bg-white p-1 min-h-[100px]">
                  {entry ? (
                    <Card
                      className={`h-full p-2 flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-all border-l-4 ${colorClass} ${entry.hasConflict ? 'ring-2 ring-destructive ring-offset-2' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-white/50 border-black/10 text-[10px] h-5 px-1.5 font-bold">
                          {entry.type === "LAB" ? "LAB" : "LEC"}
                        </Badge>
                        {entry.roomNumber && (
                          <div className="flex items-center text-[10px] opacity-80 font-mono bg-white/40 px-1 rounded-sm">
                            <MapPin className="h-3 w-3 mr-0.5" />
                            {entry.roomNumber}
                          </div>
                        )}
                      </div>

                      <div className="font-bold text-sm leading-tight line-clamp-2">
                        {entry.subjectCode}
                      </div>

                      {entry.facultyName && (
                        <div className="flex items-center text-xs opacity-90 mt-auto">
                          <Users className="h-3 w-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate" title={entry.facultyName}>{entry.facultyName}</span>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <div className="h-full rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center">
                      <span className="text-slate-200 text-lg font-light">-</span>
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
