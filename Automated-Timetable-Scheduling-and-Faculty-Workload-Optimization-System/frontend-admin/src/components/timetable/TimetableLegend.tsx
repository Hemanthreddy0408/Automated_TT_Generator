import { TimetableEntry } from "./TimetableGrid";

interface TimetableLegendProps {
    entries: TimetableEntry[];
}

export function TimetableLegend({ entries }: TimetableLegendProps) {
    if (!entries || entries.length === 0) return null;

    // Aggregate unique subjects
    const subjectsMap: Record<string, { code: string; name: string; room: string }> = {};

    entries.forEach((entry) => {
        if (entry.subjectCode && !subjectsMap[entry.subjectCode]) {
            subjectsMap[entry.subjectCode] = {
                code: entry.subjectCode,
                name: entry.subjectName || entry.subjectCode,
                room: entry.roomNumber || "TBA",
            };
        }
    });

    const uniqueSubjects = Object.values(subjectsMap);

    return (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 border-b pb-4">
                <div className="h-8 w-8 rounded-xl bg-[#0F1B2D] flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-sm font-bold">menu_book</span>
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Course Reference</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Academic Details</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-[#0F1B2D] text-white">
                        <tr>
                            <th className="px-6 py-3 border border-slate-700/30 text-xs font-black uppercase tracking-widest text-left first:rounded-tl-xl">Course Code</th>
                            <th className="px-6 py-3 border border-slate-700/30 text-xs font-black uppercase tracking-widest text-left">Course Name</th>
                            <th className="px-6 py-3 border border-slate-700/30 text-xs font-black uppercase tracking-widest text-left text-center last:rounded-tr-xl">Venue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {uniqueSubjects.map((subject, index) => (
                            <tr
                                key={subject.code}
                                className={`hover:bg-slate-50/80 transition-colors ${index !== uniqueSubjects.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <td className="px-6 py-4 border-r border-slate-100 font-black text-slate-500 tracking-tighter whitespace-nowrap">
                                    {subject.code}
                                </td>
                                <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-800">
                                    {subject.name}
                                </td>
                                <td className="px-6 py-4 font-black text-[#0F1B2D] text-xs tracking-widest uppercase text-center bg-slate-50/30">
                                    {subject.room}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
