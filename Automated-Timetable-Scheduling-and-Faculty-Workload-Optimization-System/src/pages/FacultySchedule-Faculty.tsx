import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';

const FacultySchedule = () => {
    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">My Weekly Schedule</h2>
                        <p className="text-xs text-slate-500 font-medium">Personalized academic calendar for current semester</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 text-sm font-bold bg-white text-slate-600 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">download</span> Export PDF
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-2">
                                {['Overview', 'Conflicts', 'Preferences'].map((tab) => (
                                    <button key={tab} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'Overview' ? 'bg-[#111827] text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <span className="w-3 h-3 rounded-full bg-sky-400"></span> Theory
                                <span className="w-3 h-3 rounded-full bg-purple-400 ml-4"></span> Lab
                            </div>
                        </div>

                        <ScheduleGrid />
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sky-500">info</span> Schedule Highlights
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    Busiest day: <strong>Monday</strong> (4 sessions)
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    Free slots: <strong>Tuesday Afternoon</strong>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">warning</span> Room Notices
                            </h4>
                            <p className="text-sm text-slate-500 italic">No room changes or maintenance notices for your assigned venues this week.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultySchedule;
