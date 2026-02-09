import React from 'react';
import { TimetableEntry } from '../timetable/TimetableGrid';

interface ScheduleGridProps {
  view?: 'Weekly' | 'Day';
  entries?: TimetableEntry[];
}

const ScheduleGrid = ({ view = 'Weekly', entries = [] }: ScheduleGridProps) => {
  const allDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const daysToDisplay = view === 'Day' ? [allDays.includes(today) ? today : 'MONDAY'] : allDays;

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
    entries.find(e => e.day.toUpperCase() === day && e.timeSlot === slot);

  return (
    <div className="overflow-x-auto selection:bg-[#10b981]/10">
      <div className={`${view === 'Day' ? 'min-w-[400px]' : 'min-w-[800px]'}`}>

        {/* Header */}
        <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(5,1fr)]'} gap-4 mb-4`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Time</div>
          {daysToDisplay.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</div>
          ))}
        </div>

        {/* Rows */}
        {TIME_SLOTS.map(slot => {
          const isSpecial = slot === "10:30-10:45" || slot === "01:15-02:05";
          const label = slot === "10:30-10:45" ? "BREAK" : "LUNCH";

          if (isSpecial) {
            return (
              <div key={slot} className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(5,1fr)]'} gap-4 mb-4`}>
                <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
                  <span>{slot}</span>
                </div>
                <div className={`${view === 'Day' ? 'col-span-1' : 'col-span-5'} py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2`}>
                  <span className="material-symbols-outlined text-sm text-slate-400">coffee</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div key={slot} className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(5,1fr)]'} gap-4 mb-4 min-h-[100px]`}>
              <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
                <span>{slot}</span>
              </div>
              {daysToDisplay.map(day => {
                const entry = findEntry(day, slot);
                return (
                  <ClassCard
                    key={`${day}-${slot}`}
                    code={entry?.subjectCode}
                    title={entry?.subjectName}
                    room={entry?.roomNumber}
                    type={entry?.type === 'LAB' ? 'lab' : 'theory'}
                    faculty={entry?.facultyName} // although this is the faculty's own schedule, might be redundant or useful if checking conflicts
                    section={entry?.sectionId} // This is useful! Faculty want to know which section they are teaching.
                  />
                )
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ClassCard = ({ code, title, room, type, section }: any) => {
  if (!code) return <EmptySlot />;

  const styles = type === 'theory'
    ? 'bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100'
    : 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100';

  return (
    <div className={`${styles} rounded-2xl p-4 border flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group`}>
      <div>
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-extrabold tracking-tighter uppercase">{code}</p>
          <span className="material-symbols-outlined text-sm opacity-60 group-hover:scale-110 transition-transform">
            {type === 'theory' ? 'auto_stories' : 'biotech'}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{title}</p>
        {section && <p className="text-[10px] font-semibold mt-1">Section ID: <span className="text-slate-900">{section}</span></p>}
      </div>
      <div className="flex items-center gap-1.5 opacity-80 mt-2">
        <span className="material-symbols-outlined text-[10px]">location_on</span>
        <p className="text-[9px] font-semibold">{room}</p>
      </div>
    </div>
  );
};

const EmptySlot = () => (
  <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center group hover:border-slate-200 transition-colors">
    <span className="material-symbols-outlined text-slate-200 group-hover:text-slate-300 transition-colors">add_circle</span>
  </div>
);

export default ScheduleGrid;