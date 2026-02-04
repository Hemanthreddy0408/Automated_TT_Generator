import React from 'react';

interface ScheduleGridProps {
  view?: 'Weekly' | 'Day';
}

const ScheduleGrid = ({ view = 'Weekly' }: ScheduleGridProps) => {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const daysToDisplay = view === 'Day' ? [allDays.includes(today) ? today : 'Monday'] : allDays;

  return (
    <div className="overflow-x-auto selection:bg-[#10b981]/10">
      <div className={`${view === 'Day' ? 'min-w-[400px]' : 'min-w-[800px]'}`}>
        {/* Header */}
        <div className={`grid ${view === 'Day' ? 'grid-cols-2' : 'grid-cols-6'} gap-4 mb-4`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Time</div>
          {daysToDisplay.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</div>
          ))}
        </div>

        {/* 09:00 AM Slot */}
        <div className={`grid ${view === 'Day' ? 'grid-cols-2' : 'grid-cols-6'} gap-4 mb-4 h-28`}>
          <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
            <span>09:00 AM</span> <span className="text-slate-300">to</span> <span>10:30 AM</span>
          </div>
          {daysToDisplay.map(day => (
            <ClassCard
              key={day}
              code={day === 'Monday' || day === 'Wednesday' || day === 'Friday' ? "CS301" : ""}
              title={day === 'Monday' || day === 'Wednesday' || day === 'Friday' ? "Data Structures" : ""}
              room="LH-102"
              type="theory"
            />
          ))}
        </div>

        {/* Break Slot */}
        <div className={`grid ${view === 'Day' ? 'grid-cols-2' : 'grid-cols-6'} gap-4 mb-4`}>
          <div className={`${view === 'Day' ? 'col-start-2 col-span-1' : 'col-start-2 col-span-5'} py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2`}>
            <span className="material-symbols-outlined text-sm text-slate-400">coffee</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {view === 'Day' ? 'Break' : 'Short Break (10:30 - 10:45)'}
            </span>
          </div>
        </div>

        {/* 11:00 AM Slot */}
        <div className={`grid ${view === 'Day' ? 'grid-cols-2' : 'grid-cols-6'} gap-4 mb-4 h-28`}>
          <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
            <span>10:45 AM</span> <span className="text-slate-300">to</span> <span>12:15 PM</span>
          </div>
          {daysToDisplay.map(day => (
            <ClassCard
              key={day}
              code={day === 'Tuesday' || day === 'Thursday' ? "CS402" : ""}
              title={day === 'Tuesday' || day === 'Thursday' ? "Operating Systems" : ""}
              room="LH-201"
              type="theory"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ClassCard = ({ code, title, room, type }: any) => {
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
        <p className="text-xs font-bold text-slate-800 leading-tight">{title}</p>
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