import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { TimetableGrid } from '../components/timetable/TimetableGrid';
import { useUser } from '../context/UserContext';
import { generateICS } from '../lib/icsUtils';
import { toast } from 'sonner';
import { getFacultyTimetable } from '../lib/api';
import { TimetableEntry } from '../components/timetable/TimetableGrid';
import { buildTimetableMatrix } from '../utils/timetableMapper';
import PasswordModal from '../components/auth/PasswordModal';
import { TimetableLegend } from '../components/timetable/TimetableLegend';

/**
 * Faculty Schedule Page
 * Allows faculty members to view their full weekly timetable in a grid format,
 * export their schedule to Outlook, or download it as an ICS file.
 */
const FacultySchedule = () => {
    const { user } = useUser();
    const [view, setView] = useState('Weekly'); // 'Weekly' or 'Day'
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase());

    const DAYS_LIST = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const TIME_SLOTS = [
        "09:00-09:40",
        "09:40-10:30",
        "10:30-10:45", // BREAK
        "10:45-11:35",
        "11:35-12:25",
        "12:25-01:15",
        "LUNCH_BREAK",
        "02:05-02:55",
        "02:55-03:45",
        "03:45-04:35"
    ];

    useEffect(() => {
        const fetchSchedule = async () => {
            if (user?.name) {
                setLoading(true);
                try {
                    console.log("DEBUG [FacultySchedule]: Fetching for", user.name);
                    const data = await getFacultyTimetable(user.name);
                    console.log("DEBUG [FacultySchedule]: Fetched entries", data);
                    setEntries(data || []);
                } catch (error) {
                    console.error("Failed to fetch faculty schedule", error);
                    toast.error("Failed to load schedule.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchSchedule();
    }, [user?.name]);

    const timetableMatrix = useMemo(() => {
        if (!entries || entries.length === 0) return {};

        const mappedEntries = entries.map(e => ({
            ...e,
            type: (e.type === 'LECTURE' || e.type === 'LAB') ? e.type : 'LECTURE'
        })) as TimetableEntry[];

        const matrix = buildTimetableMatrix(mappedEntries);
        console.log("DEBUG [FacultySchedule]: Matrix built", matrix);
        return matrix;
    }, [entries]);

    const handleDownloadICS = () => {
        if (entries.length === 0) {
            toast.error("No schedule entries to download.");
            return;
        }

        const firstEntry = entries[0];
        const event = {
            title: `${firstEntry.subjectCode} - ${firstEntry.subjectName}`,
            startDate: new Date(),
            endDate: new Date(),
            location: firstEntry.roomNumber || "TBA",
            description: "Weekly Academic Schedule"
        };

        const icsContent = generateICS(event);

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'my_schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Schedule downloaded as ICS!");
    };

    const busiestDay = useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            counts[e.day] = (counts[e.day] || 0) + 1;
        });
        const maxDay = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");
        return { day: maxDay, count: counts[maxDay] || 0 };
    }, [entries]);

    const commonRoom = useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            if (e.roomNumber) counts[e.roomNumber] = (counts[e.roomNumber] || 0) + 1;
        });
        const maxRoom = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "TBA");
        return maxRoom;
    }, [entries]);

    const renderDayView = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select Day:</span>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {DAYS_LIST.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDay === day ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                {day.charAt(0) + day.slice(1).toLowerCase().substring(0, 2)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {TIME_SLOTS.map(slot => {
                        const entry = entries.find(e => e.day.toUpperCase() === selectedDay && e.timeSlot === slot);
                        const isSpecial = slot === "10:30-10:45" || slot === "LUNCH_BREAK";
                        const label = slot === "10:30-10:45" ? "Morning Break" : "Lunch Break";

                        if (isSpecial) {
                            return (
                                <div key={slot} className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 opacity-60">
                                    <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot}</div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                                        <span className="material-symbols-outlined text-sm">{label === "Lunch Break" ? 'restaurant' : 'coffee'}</span>
                                        {label}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={slot} className={`flex items-center gap-6 p-5 rounded-2xl border transition-all ${entry ? 'bg-white border-slate-200 shadow-md translate-x-1' : 'bg-slate-50/30 border-transparent opacity-40'}`}>
                                <div className="w-24 text-[10px] font-black text-slate-500 uppercase tracking-widest">{slot}</div>
                                {entry ? (
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1 h-10 rounded-full ${entry.type === 'LAB' ? 'bg-purple-500' : 'bg-sky-500'}`}></div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{entry.subjectCode}</span>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${entry.type === 'LAB' ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'}`}>{entry.type}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800">{entry.subjectName}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1 justify-end">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                                    {entry.roomNumber}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Section {entry.sectionId || 'A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs font-medium text-slate-300 italic tracking-wide">No session scheduled</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10 text-slate-900 shadow-sm transition-all">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Schedule</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">
                            Viewing <span className="text-[#10b981] font-bold">{view}</span> schedule for <span className="text-slate-800 font-bold">{user?.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        Change Password
                    </button>
                </header>

                <div className="p-8 space-y-8 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                                {['Weekly', 'Day'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setView(tab)}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${view === tab ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab} View
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDownloadICS}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:bg-white hover:shadow-md transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Sync Calendar
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
                                <div className="animate-spin w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full font-black"></div>
                                <p className="font-bold text-sm tracking-tight">Accessing timetable database...</p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4 border-2 border-dashed border-slate-100 rounded-3xl">
                                <span className="material-symbols-outlined text-6xl opacity-10">calendar_today</span>
                                <p className="font-bold text-lg text-slate-300">No classes found in the record</p>
                                <p className="text-xs max-w-xs text-center leading-relaxed">The admin hasn't finalized your schedule yet. Please coordinate with the department coordinator.</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {view === 'Weekly' ? (
                                    <>
                                        <TimetableGrid timetable={timetableMatrix} />
                                        <TimetableLegend entries={entries} />
                                    </>
                                ) : renderDayView()}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl">info</span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sky-500">campaign</span> Faculty Insights
                            </h4>
                            <ul className="space-y-3 relative z-10">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                    Busiest day: <strong>{busiestDay.day || 'N/A'}</strong> ({busiestDay.count} sessions)
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                    Assigned Room: <strong>{commonRoom}</strong>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl">warning</span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">notifications</span> Sync Status
                            </h4>
                            <p className="text-sm text-slate-500 italic relative z-10">
                                Your schedule is synced with the central timetable database. Any changes by the admin will reflect here in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </div>
    );
};

export default FacultySchedule;
