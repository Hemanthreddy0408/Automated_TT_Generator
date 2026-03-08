import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import { getFacultySchedule } from "@/lib/api";
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const FacultySchedule = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [facultyName, setFacultyName] = useState(user?.name || "Loading...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Real app: from auth context
                const name = user.name;
                setFacultyName(name);

                // Get schedule for this faculty
                const scheduleData = await getFacultySchedule(name);
                setSessions(scheduleData);
            } catch (err) {
                console.error("Failed to load faculty schedule:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">My Weekly Schedule</h2>
                        <p className="text-xs text-slate-500 font-medium">Personalized academic calendar for {facultyName}</p>
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
                            <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm"></span> Theory
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm"></span> Lab
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 shadow-sm"></div>
                            </div>
                        ) : sessions.length > 0 ? (
                            <ScheduleGrid sessions={sessions} />
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                                <span className="material-symbols-outlined text-6xl opacity-20">calendar_today</span>
                                <div className="text-center">
                                    <p className="font-bold text-slate-500">No classes found in the timetable</p>
                                    <p className="text-xs">The admin hasn't generated your schedule yet, or you have no duties assigned.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- COMPREHENSIVE LEGEND (Matching Admin View) --- */}
                    <div className="mt-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Legend:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-md bg-sky-400 shadow-sm" />
                                <span className="text-sm font-bold text-slate-600">Lecture</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-md bg-purple-400 shadow-sm" />
                                <span className="text-sm font-bold text-slate-600">Laboratory</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-md bg-teal-400 shadow-sm" />
                                <span className="text-sm font-bold text-slate-600">Tutorial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-md bg-slate-100 border border-slate-200 shadow-sm" />
                                <span className="text-sm font-bold text-slate-600">Break</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-md border-2 border-dashed border-red-400 bg-red-50" />
                                <span className="text-sm font-bold text-slate-600">Conflict</span>
                            </div>
                        </div>
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
