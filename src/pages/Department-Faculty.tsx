import React from 'react';
import Sidebar from '../components/layout/Sidebar';

const Department = () => {
  const facultyMembers = [
    { name: "Dr. Robert Evans", role: "Professor & Head", initial: "RE", color: "bg-blue-100 text-blue-600" },
    { name: "Dr. Sarah Mitchell", role: "Associate Professor", initial: "SM", color: "bg-amber-100 text-amber-600" },
    { name: "Dr. James Reynolds", role: "Assistant Professor", initial: "JR", color: "bg-purple-100 text-purple-600" }
  ];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold">Department Overview</h2>
            <p className="text-xs text-slate-500">Computer Science & Engineering</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">folder_shared</span> Resource Hub
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Timetable Preview */}
            <div className="xl:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-bold mb-6">Departmental Timetable Preview</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Time Slot</th>
                      <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Room 101</th>
                      <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Lab 402</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="py-6 font-bold text-slate-500 text-xs">09:00 - 10:30</td>
                      <td className="py-4">
                        <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                          <p className="text-xs font-bold">Dr. Mitchell</p>
                          <p className="text-[10px] text-sky-600">Data Structures</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs font-bold">Prof. Evans</p>
                          <p className="text-[10px] text-purple-600">Logic Lab</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Faculty Directory */}
            <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold mb-6">Department Faculty</h4>
              <div className="space-y-4">
                {facultyMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl ${member.color} flex items-center justify-center font-bold`}>{member.initial}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">{member.role}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Department;