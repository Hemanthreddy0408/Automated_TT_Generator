import React from 'react';

interface TimetableEntry {
  id: number;
  sectionId: string;
  day: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
  type: string;
}

const ScheduleGrid = ({ sessions = [] }: { sessions?: TimetableEntry[] }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:45 AM - 12:15 PM',
    '01:15 PM - 02:45 PM',
    '03:00 PM - 04:30 PM'
  ];

  const getSessionForSlot = (day: string, slot: string) => {
    return sessions.find(s => s.day === day && s.timeSlot === slot);
  };

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

        {/* Time Slots */}
        {timeSlots.map((slot, index) => (
          <React.Fragment key={slot}>
            <div className="grid grid-cols-6 gap-4 mb-4 h-28">
              <div className="flex flex-col justify-center text-[10px] font-bold text-slate-500 pl-2">
                <span>{slot.split(' - ')[0]}</span>
                <span className="text-slate-300">to</span>
                <span>{slot.split(' - ')[1]}</span>
              </div>
              {days.map(day => {
                const session = getSessionForSlot(day, slot);
                if (session) {
                  return (
                    <ClassCard
                      key={`${day}-${slot}`}
                      code={session.subjectCode}
                      title={session.subjectName}
                      room={session.roomNumber}
                      type={session.type?.toLowerCase()}
                      section={session.sectionId}
                    />
                  );
                }
                return <EmptySlot key={`${day}-${slot}`} />;
              })}
            </div>

            {/* In-between Breaks */}
            {index === 0 && (
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="col-start-2 col-span-5 py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">coffee</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Short Break (10:30 - 10:45)</span>
                </div>
              </div>
            )}
            {index === 1 && (
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="col-start-2 col-span-5 py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">restaurant</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lunch Break (12:15 - 01:15)</span>
                </div>
              </div>
            )}
            {index === 2 && (
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="col-start-2 col-span-5 py-2 bg-slate-50 rounded-xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">coffee</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Short Break (02:45 - 03:00)</span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ClassCard = ({ code, title, room, type, section }: any) => {
  const isLab = type?.includes('lab');
  const styles = !isLab
    ? 'bg-sky-50 border-sky-100 text-sky-700'
    : 'bg-purple-50 border-purple-100 text-purple-700';

  return (
    <div className={`${styles} rounded-2xl p-4 border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
      <div>
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-extrabold tracking-tighter uppercase">{code}</p>
          <span className="material-symbols-outlined text-sm opacity-60">
            {!isLab ? 'auto_stories' : 'biotech'}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{title}</p>
      </div>
      <div className="flex justify-between items-end mt-1">
        <p className="text-[9px] font-semibold opacity-80">Room {room}</p>
        <p className="text-[9px] font-bold px-1.5 py-0.5 bg-white/50 rounded-md">{section}</p>
      </div>
    </div>
  );
};

const EmptySlot = () => <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100/50"></div>;

export default ScheduleGrid;