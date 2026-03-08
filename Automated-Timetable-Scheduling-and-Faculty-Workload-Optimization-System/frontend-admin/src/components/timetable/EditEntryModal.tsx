import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TimetableEntry } from "./TimetableGrid";
import { getFaculty, getRooms, getSubjects, FacultyPayload } from "@/lib/api";
import { Subject, Room } from "@/types/timetable";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
    entry: TimetableEntry | null;
    open: boolean;
    onClose: () => void;
    onSave: (updatedEntry: TimetableEntry, force?: boolean) => Promise<{ success: boolean; conflict?: boolean; messages?: string[] }>;
    selectedSection: any;
}

export function EditEntryModal({ entry, open, onClose, onSave, selectedSection }: Props) {
    const [faculty, setFaculty] = useState<FacultyPayload[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [type, setType] = useState<"LECTURE" | "LAB">("LECTURE");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [conflicts, setConflicts] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            loadData();
            if (entry) {
                setSelectedFaculty(entry.facultyName || "");
                setSelectedRoom(entry.roomNumber || "");
                setSelectedSubject(entry.subjectCode || "");
                setSelectedDay(entry.day || "");
                setSelectedTimeSlot(entry.timeSlot || "");
                setType(entry.type === "LAB" ? "LAB" : "LECTURE");
                setConflicts([]);
            }
        }
    }, [open, entry]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [f, r, s] = await Promise.all([getFaculty(), getRooms(), getSubjects()]);
            setFaculty(f);
            setRooms(r);
            setSubjects(s);
        } catch (error) {
            console.error("Failed to load modal data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (force = false) => {
        if (!entry) return;

        setSaving(true);
        const updatedEntry: TimetableEntry = {
            ...entry,
            facultyName: selectedFaculty,
            roomNumber: selectedRoom,
            subjectCode: selectedSubject,
            subjectName: subjects.find(s => s.code === selectedSubject)?.name || entry.subjectName,
            day: selectedDay,
            timeSlot: selectedTimeSlot,
            type: type
        };

        try {
            const result = await onSave(updatedEntry, force);
            if (result.success) {
                onClose();
            } else if (result.conflict) {
                setConflicts(result.messages || []);
            }
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{entry?.id ? "Edit Schedule Slot" : "Allocate New Class"}</DialogTitle>
                    {selectedSection && (
                        <DialogDescription className="text-xs">
                            Modifying schedule for <span className="font-bold text-slate-900">{selectedSection.name} ({selectedSection.department})</span> • Year {selectedSection.year}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="day">Day</Label>
                                <Select value={selectedDay} onValueChange={setSelectedDay}>
                                    <SelectTrigger id="day">
                                        <SelectValue placeholder="Select Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="timeslot">Time Slot</Label>
                                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                                    <SelectTrigger id="timeslot">
                                        <SelectValue placeholder="Select Time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            "09:00-09:40", "09:40-10:30", "10:45-11:35",
                                            "11:35-12:25", "12:25-01:15", "02:05-02:55",
                                            "02:55-03:45", "03:45-04:35"
                                        ].map(slot => (
                                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {conflicts.length > 0 && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Conflict Detected</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-4 mt-2 text-xs space-y-1">
                                        {conflicts.map((m, i) => <li key={i}>{m}</li>)}
                                    </ul>
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setConflicts([])}>Cancel</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleSave(true)}>Override & Save</Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger id="subject">
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects
                                        .filter(s => {
                                            if (!selectedSection) return true;
                                            return s.year === selectedSection.year && s.department === selectedSection.department;
                                        })
                                        .map(s => (
                                            <SelectItem key={s.id} value={s.code}>{s.name} ({s.code})</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="faculty">Faculty</Label>
                            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                                <SelectTrigger id="faculty">
                                    <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faculty.map(f => (
                                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="room">Room</Label>
                            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                <SelectTrigger id="room">
                                    <SelectValue placeholder="Select Room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map(r => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2 text-sm">
                            <Label>Type</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={type === 'LECTURE'}
                                        onChange={() => setType('LECTURE')}
                                    />
                                    Lecture
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={type === 'LAB'}
                                        onChange={() => setType('LAB')}
                                    />
                                    Lab
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={() => handleSave(false)} disabled={saving || loading}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
