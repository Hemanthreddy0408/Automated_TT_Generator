import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import axios from 'axios';
import { useUser } from '../context/UserContext';

interface FacultyMember {
  id: number;
  name: string;
  designation: string;
}

const Department = () => {
  const { user } = useUser();
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/faculty', { timeout: 3000 });
        setFacultyMembers(response.data);
      } catch (error) {
        console.error("Error fetching faculty directory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const getInitial = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const getColor = (id: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-amber-100 text-amber-600',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Department Overview</h2>
            <p className="text-xs text-slate-500 font-medium">{user?.department || 'Faculty Department'}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">folder_shared</span> Resource Hub
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Timetable Preview */}
            <div className="xl:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-bold mb-2">Departmental Timetable</h4>
              <p className="text-sm text-slate-500 mb-8 font-medium italic">Shared resources and venue allocation overview</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase tracking-widest text-[10px] font-extrabold text-slate-400">
                      <th className="py-4 pl-2">Time Slot</th>
                      <th className="py-4">Room 101</th>
                      <th className="py-4">Lab 402</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-50">
                      <td className="py-8 font-bold text-slate-500 text-xs pl-2">09:00 - 10:30</td>
                      <td className="py-4">
                        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 shadow-sm">
                          <p className="text-xs font-extrabold text-slate-800">Faculty {facultyMembers[0]?.name || 'Member'}</p>
                          <p className="text-[10px] text-sky-600 font-bold mt-1 uppercase">Core Lecture</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm">
                          <p className="text-xs font-extrabold text-slate-800">Faculty {facultyMembers[1]?.name || 'Member'}</p>
                          <p className="text-[10px] text-purple-600 font-bold mt-1 uppercase">Research Lab</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Faculty Directory */}
            <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981]">group</span> Department Faculty
              </h4>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-400 animate-pulse">Loading directory...</p>
                ) : (
                  facultyMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl ${getColor(member.id)} flex items-center justify-center font-bold text-xs shadow-sm`}>
                        {getInitial(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{member.designation}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 transition-colors">chevron_right</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Department;