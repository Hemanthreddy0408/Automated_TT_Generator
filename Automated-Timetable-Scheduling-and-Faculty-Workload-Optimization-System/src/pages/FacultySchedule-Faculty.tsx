import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import { useUser } from '../context/UserContext';
import { generateICS } from '../lib/icsUtils';
import { toast } from 'sonner';

const FacultySchedule = () => {
    const { user } = useUser();
    const [view, setView] = useState('Weekly'); // 'Weekly' or 'Day'

    const addToOutlook = () => {
        const event = {
            subject: "Data Structures Lecture (CS301)",
            startdt: "2024-10-28T09:00:00Z",
            enddt: "2024-10-28T10:30:00Z",
            location: "Room LH-102",
            body: "Weekly Academic Schedule Sync from AcadSchedule Portal"
        };

        // Outlook Web Deep Link format
        const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.subject)}&startdt=${event.startdt}&enddt=${event.enddt}&body=${encodeURIComponent(event.body)}&location=${encodeURIComponent(event.location)}`;

        window.open(outlookUrl, '_blank');
        toast.success("Opening Outlook Web Calendar...");
    };

    const handleDownloadICS = () => {
        const event = {
            title: "Data Structures Lecture (CS301)",
            startDate: new Date("2024-10-28T09:00:00Z"),
            endDate: new Date("2024-10-28T10:30:00Z"),
            location: "Room LH-102",
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

        toast.success("Schedule downloaded as ICS with Reminder!");
    };

    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {view} Schedule
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            {user?.name || 'Faculty Member'} - {user?.department || 'Department'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={addToOutlook}
                            className="px-4 py-2 text-sm font-bold bg-[#0078d4] text-white rounded-xl flex items-center gap-2 hover:bg-[#005a9e] transition-all shadow-lg shadow-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-lg">calendar_add_on</span> Add to Outlook
                        </button>
                        <button
                            onClick={handleDownloadICS}
                            className="px-4 py-2 text-sm font-bold bg-white text-slate-600 border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">download</span> ICS
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                                {['Weekly', 'Day'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setView(tab)}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${view === tab ? 'bg-white text-[#111827] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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

                        {/* Pass 'view' to ScheduleGrid to filter columns */}
                        <ScheduleGrid view={view as any} />
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
                                    Busiest day: <strong>Monday</strong> (4 sessions)
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                    Assigned Room: <strong>LH-102, Lab-402</strong>
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
        </div>
    );
};

export default FacultySchedule;
