import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Star, GraduationCap, User } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    slotKey: string; // e.g. "THURSDAY|03:45-04:35"
    electives: any[];
}

export function ElectiveDetailsModal({ open, onClose, slotKey, electives }: Props) {
    if (!slotKey || !electives) return null;
    const [day, time] = slotKey.split("|");

    // Deduplicate electives by subjectCode
    const uniqueElectives = Array.from(
        new Map(electives.map((e) => [e.subjectCode, e])).values()
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 border-amber-200">
                <div className="bg-amber-50/50">
                    <DialogHeader className="px-6 py-4 border-b border-amber-200 bg-amber-100/60">
                        <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-amber-600 fill-amber-400" />
                            <DialogTitle className="font-bold text-amber-900 text-lg tracking-tight">
                                Elective Options Available
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-amber-700/80 font-medium">
                            These electives are offered simultaneously across all sections for the slot
                            <span className="font-bold text-amber-800 ml-1">{day} · {time}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {uniqueElectives.map((e: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="bg-white border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-800 text-sm mb-1 leading-tight">
                                            {e.subjectName || e.subjectCode}
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-600 flex items-center">
                                                <User className="inline h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                                <span className="font-medium">{e.facultyName || "TBA"}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 ring-1 ring-inset ring-purple-600/20">
                                                    Open to all sections
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                    Room {e.roomNumber || "TBA"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
