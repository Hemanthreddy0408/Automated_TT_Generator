import { TimetableGrid, TimetableEntry, getColorForSubject } from "./TimetableGrid";
import { User, Star, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { getElectives } from "@/lib/api";
import { ElectiveDetailsModal } from "./ElectiveDetailsModal";

type Props = {
    entries: TimetableEntry[];
    onEdit?: (entry: TimetableEntry) => void;
    sectionId?: string;
};

const transformTimetable = (data: TimetableEntry[]) => {
    const table: any = {};
    data.forEach((entry) => {
        if (!table[entry.day]) table[entry.day] = {};
        table[entry.day][entry.timeSlot] = entry;
    });
    return table;
};

export function TimetableView({ entries, onEdit, sectionId }: Props) {
    const timetable = transformTimetable(entries);
    const [electiveMap, setElectiveMap] = useState<Record<string, any[]>>({});
    const [isElectiveModalOpen, setElectiveModalOpen] = useState(false);
    const [selectedElectiveSlot, setSelectedElectiveSlot] = useState<string>("");

    useEffect(() => {
        getElectives().then(setElectiveMap);
    }, []);

    // Compute Subject Legend
    const subjectLegend = [
        { code: 'LEC', name: 'Standard Theory/Lecture', type: 'LECTURE' },
        { code: 'LAB', name: 'Practical Laboratory', type: 'LAB' },
        { code: 'ELE', name: 'Open Elective Subjects', type: 'ELECTIVE' },
        { code: 'BRK', name: 'Short Break Hour', type: 'BREAK' },
        { code: 'LUN', name: 'Lunch Break Hour', type: 'LUNCH' },
    ];

    // Compute Course Details (faculty per subject)
    const courseFaculty = Array.from(
        new Map(
            entries
                .filter((e) => e.subjectCode)
                .map((e) => [
                    e.subjectCode,
                    {
                        code: e.subjectCode,
                        name: e.subjectName || e.subjectCode,
                        faculty: e.facultyName || "TBA",
                        type: e.type,
                        weeklyHours: entries.filter((x) => x.subjectCode === e.subjectCode).length
                    },
                ])
        ).values()
    );

    // Type legend items
    const typeItems = [
        { label: 'Lecture', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
        { label: 'Lab / Practical', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
        { label: 'Elective', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
        { label: 'Break / Lunch', bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', dot: 'bg-slate-300' },
        { label: 'Free Slot', bg: 'bg-white', text: 'text-slate-300', border: 'border-dashed border-slate-200', dot: 'bg-white border border-slate-300' },
    ];

    // Build elective slot display
    const electiveSlots = Object.entries(electiveMap);

    return (
        <div className="space-y-6">
            {/* TYPE LEGEND BAND */}
            <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Legend:</span>
                {typeItems.map(item => (
                    <div
                        key={item.label}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${item.bg} ${item.text} ${item.border}`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                        {item.label}
                    </div>
                ))}
                {entries.some(e => e.hasConflict) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold bg-red-50 text-red-600 border-red-200 ml-auto">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        Scheduling Conflict
                    </div>
                )}
            </div>

            {/* MAIN TIMETABLE GRID */}
            <TimetableGrid
                timetable={timetable}
                onEdit={onEdit}
                onElectiveClick={(slotKey) => {
                    setSelectedElectiveSlot(slotKey);
                    setElectiveModalOpen(true);
                }}
                sectionId={sectionId}
            />

            {/* ELECTIVE MODAL */}
            <ElectiveDetailsModal
                open={isElectiveModalOpen}
                onClose={() => setElectiveModalOpen(false)}
                slotKey={selectedElectiveSlot}
                electives={electiveMap[selectedElectiveSlot] || []}
            />

            {/* SUBJECT DETAILS TABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Color Legend */}
                {subjectLegend.length > 0 && (
                    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-sm">Subject Legend</h3>
                        </div>
                        <div className="p-4 flex-1">
                            <div className="flex flex-col gap-2 text-sm">
                                {subjectLegend.map((s) => {
                                    const colorClass = getColorForSubject(s.code);
                                    const isElective = s.type === 'ELECTIVE';
                                    return (
                                        <div
                                            key={s.code}
                                            className={`px-3 py-1.5 rounded-md border shadow-sm font-bold flex items-center gap-2 ${isElective ? 'bg-amber-50 border-amber-200 text-amber-800' : colorClass}`}
                                        >
                                            <span className="opacity-70">[{s.code}]</span>
                                            <span className="flex-1">{s.name}</span>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${isElective ? 'bg-amber-100 text-amber-600' :
                                                s.type === 'LAB' ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'
                                                }`}>{s.type}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Details Table */}
                {courseFaculty.length > 0 && (
                    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-sm">Course Details</h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 font-semibold">
                                    <tr>
                                        <th className="p-3 text-left text-slate-600 border-b">Code</th>
                                        <th className="p-3 text-left text-slate-600 border-b">Name</th>
                                        <th className="p-3 text-left text-slate-600 border-b">Faculty</th>
                                        <th className="p-3 text-center text-slate-600 border-b">Hrs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courseFaculty.map((c) => {
                                        const isElective = c.type === 'ELECTIVE';
                                        const colorClass = isElective ? 'border-l-amber-500' : getColorForSubject(c.code);
                                        const dotColorMap: Record<string, string> = {
                                            "border-l-red-500": "bg-red-500", "border-l-orange-500": "bg-orange-500",
                                            "border-l-amber-500": "bg-amber-500", "border-l-green-500": "bg-green-500",
                                            "border-l-emerald-500": "bg-emerald-500", "border-l-teal-500": "bg-teal-500",
                                            "border-l-cyan-500": "bg-cyan-500", "border-l-sky-500": "bg-sky-500",
                                            "border-l-blue-500": "bg-blue-500", "border-l-indigo-500": "bg-indigo-500",
                                            "border-l-violet-500": "bg-violet-500", "border-l-purple-500": "bg-purple-500",
                                            "border-l-fuchsia-500": "bg-fuchsia-500", "border-l-pink-500": "bg-pink-500",
                                            "border-l-rose-500": "bg-rose-500",
                                        };
                                        const borderClass = colorClass.split(' ').find(cls => cls.startsWith('border-l-')) || '';
                                        const dotColor = dotColorMap[borderClass] || "bg-slate-400";

                                        return (
                                            <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-mono font-medium flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${dotColor}`} />
                                                    {c.code}
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {c.name}
                                                    {isElective && <Star className="inline h-3 w-3 ml-1 text-amber-500 fill-amber-400" />}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        {c.faculty}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center font-medium text-slate-700">{c.weeklyHours}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
