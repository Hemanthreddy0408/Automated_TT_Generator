import { TimetableGrid, TimetableEntry, getColorForSubject } from "./TimetableGrid";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

    // Compute Legend
    const subjectLegend = Array.from(
        new Map(
            entries
                .filter((e) => e.subjectCode) // exclude pure breaks without subject code
                .map((e) => [
                    e.subjectCode,
                    {
                        code: e.subjectCode,
                        name: e.subjectName || e.subjectCode,
                        type: e.type,
                    },
                ])
        ).values()
    );

    // Compute Faculty Mapping
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
                        room: e.roomNumber || "TBA",
                        weeklyHours: entries.filter((x) => x.subjectCode === e.subjectCode).length
                    },
                ])
        ).values()
    );

    return (
        <div className="space-y-6">
            <TimetableGrid timetable={timetable} onEdit={onEdit} sectionId={sectionId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dynamic Subject Overview */}
                {subjectLegend.length > 0 && (
                    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-sm">Subject Legend</h3>
                        </div>
                        <div className="p-4 flex-1">
                            <div className="flex flex-col gap-2 text-sm">
                                {subjectLegend.map((s) => {
                                    const colorClass = getColorForSubject(s.code);
                                    return (
                                        <div
                                            key={s.code}
                                            className={`px-3 py-1.5 rounded-md border shadow-sm font-bold flex items-center gap-2 ${colorClass}`}
                                        >
                                            <span className="opacity-70">[{s.code}]</span> {s.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic Course Details */}
                {courseFaculty.length > 0 && (
                    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-sm">Course Details</h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 font-semibold">
                                    <tr>
                                        <th className="p-3 text-left text-slate-600 border-b">Course Code</th>
                                        <th className="p-3 text-left text-slate-600 border-b">Course Name</th>
                                        <th className="p-3 text-left text-slate-600 border-b">Faculty</th>
                                        <th className="p-3 text-left text-slate-600 border-b">Room</th>
                                        <th className="p-3 text-center text-slate-600 border-b">Weekly Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courseFaculty.map((c) => {
                                        const colorClass = getColorForSubject(c.code);
                                        const borderClass = colorClass.split(' ').find(cls => cls.startsWith('border-l-')) || '';
                                        const dotColorMap: Record<string, string> = {
                                            "border-l-red-500": "bg-red-500",
                                            "border-l-orange-500": "bg-orange-500",
                                            "border-l-amber-500": "bg-amber-500",
                                            "border-l-green-500": "bg-green-500",
                                            "border-l-emerald-500": "bg-emerald-500",
                                            "border-l-teal-500": "bg-teal-500",
                                            "border-l-cyan-500": "bg-cyan-500",
                                            "border-l-sky-500": "bg-sky-500",
                                            "border-l-blue-500": "bg-blue-500",
                                            "border-l-indigo-500": "bg-indigo-500",
                                            "border-l-violet-500": "bg-violet-500",
                                            "border-l-purple-500": "bg-purple-500",
                                            "border-l-fuchsia-500": "bg-fuchsia-500",
                                            "border-l-pink-500": "bg-pink-500",
                                            "border-l-rose-500": "bg-rose-500",
                                        };
                                        const dotColor = dotColorMap[borderClass] || "bg-slate-400";

                                        return (
                                            <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-mono font-medium flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${dotColor}`}></span>
                                                    {c.code}
                                                </td>
                                                <td className="p-3 font-medium">{c.name}</td>
                                                <td className="p-3 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        {c.faculty}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-600">{c.room}</td>
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
