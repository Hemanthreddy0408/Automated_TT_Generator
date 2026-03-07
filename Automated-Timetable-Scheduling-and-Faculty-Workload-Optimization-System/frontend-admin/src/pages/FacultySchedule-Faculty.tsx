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

    useEffect(() => {
        const fetchSchedule = async () => {
            if (user?.name) {
                setLoading(true);
                try {
                    console.log("DEBUG [FacultySchedule]: Fetching for", user.name);
                    const data = await getFacultyTimetable(user.name);
                    console.log("DEBUG [FacultySchedule]: Fetched entries", data);
                    setEntries(data);
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

    const addToOutlook = () => {
        const event = {
            subject: "Academic Schedule Sync",
            startdt: new Date().toISOString(),
            enddt: new Date().toISOString(),
            location: "Academic Block",
            body: "Weekly Academic Schedule Sync from AcadSchedule Portal"
        };
        const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.subject)}&startdt=${event.startdt}&enddt=${event.enddt}&body=${encodeURIComponent(event.body)}&location=${encodeURIComponent(event.location)}`;
        window.open(outlookUrl, '_blank');
        toast.success("Opening Outlook Web Calendar...");
    };

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

    const busiestDay = React.useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            counts[e.day] = (counts[e.day] || 0) + 1;
        });
        const maxDay = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");
        return { day: maxDay, count: counts[maxDay] || 0 };
    }, [entries]);

    const commonRoom = React.useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            if (e.roomNumber) counts[e.roomNumber] = (counts[e.roomNumber] || 0) + 1;
        });
        const maxRoom = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "TBA");
        return maxRoom;
    }, [entries]);

    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10 text-slate-900 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Schedule</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">
                            Class timetable for <span className="text-[#10b981] font-bold">{user?.name}</span>
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
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                                {['Weekly', 'Day'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setView(tab)}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${view === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab} View
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <span className="w-3 h-3 rounded-full bg-sky-400"></span> Theory
                                <span className="w-3 h-3 rounded-full bg-purple-400 ml-4"></span> Lab
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                                <p className="font-medium">Syncing with timetable database...</p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4 border-2 border-dashed rounded-3xl">
                                <span className="material-symbols-outlined text-6xl opacity-20">calendar_today</span>
                                <p className="font-bold text-lg">No classes found in the timetable</p>
                                <p className="text-sm">The admin hasn't generated your schedule yet, or you have no duties assigned.</p>
                            </div>
                        ) : (
                            <TimetableGrid timetable={timetableMatrix} />
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
