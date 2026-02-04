import React from 'react';

const ScheduleGrid = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Time</div>
          {days.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</div>
          ))}
        </div>

        {/* 09:00 AM Slot */}
        <div className="grid grid-cols-6 gap-4 mb-4 h-28">
          <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
            <span>09:00 AM</span> <span className="text-slate-300">to</span> <span>10:30 AM</span>
          </div>
          <ClassCard code="CS301" title="Data Structures" room="LH-102" type="theory" />
          <EmptySlot />
          <ClassCard code="CS301" title="Data Structures" room="LH-102" type="theory" />
          <EmptySlot />
          <ClassCard code="CS301L" title="DS Lab - B" room="Lab-402" type="lab" />
        </div>

        {/* Break Slot */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div className="col-start-2 col-span-5 py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400">coffee</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Short Break (10:30 - 10:45)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassCard = ({ code, title, room, type }: any) => {
  const styles = type === 'theory' 
    ? 'bg-sky-50 border-sky-100 text-sky-700' 
    : 'bg-purple-50 border-purple-100 text-purple-700';

  return (
    <div className={`${styles} rounded-2xl p-4 border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
      <div>
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-extrabold tracking-tighter uppercase">{code}</p>
          <span className="material-symbols-outlined text-sm opacity-60">
            {type === 'theory' ? 'auto_stories' : 'biotech'}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-800 leading-tight">{title}</p>
      </div>
      <p className="text-[9px] font-semibold opacity-80">Room {room}</p>
    </div>
  );
};

const EmptySlot = () => <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100"></div>;

export default ScheduleGrid;