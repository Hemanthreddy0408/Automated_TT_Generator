import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { TimetableEntry } from "@/components/timetable/TimetableGrid";
import { TimetableView } from "@/components/timetable/TimetableView";
import { generateTimetable, generateAllTimetables, getTimetable, getSections, updateTimetableEntry } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { Loader2, Users, School, Calendar, Coffee, Utensils, Sparkles, MapPin, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/types/timetable";
import { EditEntryModal } from "@/components/timetable/EditEntryModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ✅ MUST MATCH DB UUID (COPY FROM pgAdmin)
  const sectionId = searchParams.get("sectionId") || "583cb115-a010-4ce9-bb42-83092a820e";

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timetable, setTimetable] = useState<any>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'day'>('weekly');
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const DAYS_LIST = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const TIME_SLOTS = [
    '09:00-09:40', '09:40-10:30', '10:30-10:45',
    '10:45-11:35', '11:35-12:25', '12:25-01:15',
    'LUNCH_BREAK', '02:05-02:55', '02:55-03:45', '03:45-04:35'
  ];

  // 1. Helper to transform flat array to Day -> TimeSlot matrix
  const transformTimetable = (data: any[]) => {
    const table: any = {};
    data.forEach((entry) => {
      if (!table[entry.day]) table[entry.day] = {};
      table[entry.day][entry.timeSlot] = entry;
    });
    return table;
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setEditModalOpen(true);
  };

  const handleSaveEntry = async (updatedEntry: TimetableEntry, force = false) => {
    const result = await updateTimetableEntry(updatedEntry, force);
    if (result.success) {
      toast.success("Timetable entry updated successfully!");
      await fetchTimetable(); // Refresh data
    }
    return result;
  };

  // 2. Fetch All Sections on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getSections();
        setSections(Array.isArray(data) ? data : []);

        if (!searchParams.get("sectionId") && data.length > 0) {
          handleSectionChange(String(data[0].id));
        }
        else if (sectionId) {
          const found = data.find((s: Section) => String(s.id) === sectionId);
          if (found) setSelectedSection(found);
        }
      } catch (e) {
        console.error("Failed to load sections", e);
      }
    };
    init();
  }, [sectionId, searchParams]);

  const fetchTimetable = async () => {
    const data = await getTimetable(sectionId);
    setEntries(data);
    const matrix = transformTimetable(data);
    setTimetable(matrix);
  };

  useEffect(() => {
    fetchTimetable();
  }, [sectionId]);

  const handleSectionChange = (newId: string) => {
    setSearchParams({ sectionId: newId });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateTimetable(sectionId);
      await fetchTimetable();
      toast.success("Timetable generated and saved successfully!");
    } catch (error) {
      toast.error("Failed to generate timetable.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!confirm("This will clear all existing timetables and regenerate for ALL sections. Continue?")) return;
    setLoading(true);
    try {
      await generateAllTimetables();
      await fetchTimetable();
      toast.success("All timetables regenerated and saved!");
    } catch (error) {
      toast.error("Failed to generate timetables.");
    } finally {
      setLoading(false);
    }
  };

  // --- Export Logic ---
  const getExportData = () => entries.map(e => ({
    Day: e.day,
    Time: e.timeSlot,
    Type: e.type,
    Subject: e.subjectCode || '-',
    Faculty: e.facultyName || '-',
    Room: e.roomNumber || '-'
  }));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, `Timetable_${selectedSection?.name || 'Section'}.xlsx`);
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Timetable_${selectedSection?.name || 'Section'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Timetable: ${selectedSection?.name || 'Section'}`, 14, 15);
    autoTable(doc, {
      head: [["Day", "Time", "Type", "Subject", "Faculty", "Room"]],
      body: entries.map(e => [
        e.day, e.timeSlot, e.type, e.subjectCode || '-', e.facultyName || '-', e.roomNumber || '-'
      ]),
      startY: 20,
    });
    doc.save(`Timetable_${selectedSection?.name || 'Section'}.pdf`);
  };

  return (
    <AdminLayout
      title="Class Timetable"
      subtitle="View and manage weekly schedules"
      actions={
        <div className="flex items-center gap-2">
          <Select value={sectionId || ""} onValueChange={handleSectionChange}>
            <SelectTrigger className="w-[300px] bg-white">
              <SelectValue placeholder="Select Section">
                {selectedSection ? (
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{selectedSection.name} ({selectedSection.department})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase">Year {selectedSection.year}</span>
                  </span>
                ) : "Select Section"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                sections.reduce((acc: any, s) => {
                  const key = `Year ${s.year}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(s);
                  return acc;
                }, {})
              ).sort().map(([year, yearSections]: [any, any]) => (
                <SelectGroup key={year}>
                  <SelectLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 py-1.5">
                    {year}
                  </SelectLabel>
                  {yearSections.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <div className="flex justify-between w-full items-center gap-8">
                        <span className="font-medium">{s.name} ({s.department})</span>
                        <span className="text-[9px] bg-slate-50 text-slate-400 border px-1.5 py-0.5 rounded font-bold uppercase group-hover:bg-white transition-colors">
                          Y{s.year}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleGenerate} disabled={loading || !sectionId} variant="outline">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            Generate Section
          </Button>

          <Button
            onClick={handleGenerateAll}
            disabled={loading}
            className="gap-2 bg-[#0F1B2D] hover:bg-[#1B2A41] text-white shadow-md"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate All Sections
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {!sectionId ? (
          <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50">
            <School className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No Section Selected</p>
            <p className="text-sm">Please select a class section from the dropdown above.</p>
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-700">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Class Strength</p>
                    <h3 className="text-2xl font-bold">{selectedSection?.capacity || "--"} <span className="text-sm font-normal text-muted-foreground">Students</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-700">
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Class Details</p>
                    <h3 className="text-2xl font-bold">{selectedSection?.name} <span className="text-base font-normal text-muted-foreground">Year {selectedSection?.year}</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-green-100 p-3 rounded-full text-green-700">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Status</p>
                    <h3 className="text-xl font-bold">{entries.length > 0 ? "Generated" : "Not Generated"}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* VIEW TOGGLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {(['weekly', 'day'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? 'bg-white shadow-sm text-slate-900 scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {mode === 'weekly' ? 'Weekly View' : 'Day View'}
                  </button>
                ))}
              </div>
              {viewMode === 'day' && (
                <div className="flex gap-1.5">
                  {DAYS_LIST.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDay === day ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                      {day.charAt(0) + day.slice(1).toLowerCase().substring(0, 2)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TIMETABLE VIEW */}
            {viewMode === 'weekly' ? (
              <TimetableView entries={entries} onEdit={handleEdit} sectionId={sectionId} />
            ) : (
              /* DAY VIEW */
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <h3 className="font-bold text-slate-800">
                    {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule
                  </h3>
                  <span className="ml-auto text-xs text-slate-400 font-medium">
                    {entries.filter(e => e.day === selectedDay && e.type !== 'BREAK' && e.type !== 'LUNCH').length} classes
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {TIME_SLOTS.map(slot => {
                    const entry = entries.find(e => e.day === selectedDay && e.timeSlot === slot);
                    const isBreak = slot === '10:30-10:45' || slot === 'LUNCH_BREAK';
                    const breakLabel = slot === '10:30-10:45' ? 'Morning Break' : 'Lunch Break';
                    if (isBreak) return (
                      <div key={slot} className="px-6 py-3 flex items-center gap-4 bg-slate-50/70">
                        <div className="w-28 text-[10px] font-black text-slate-300 uppercase tracking-widest">{slot === 'LUNCH_BREAK' ? '12:25 - 02:05' : slot}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold italic">
                          {slot === 'LUNCH_BREAK' ? <Utensils className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                          {breakLabel}
                        </div>
                      </div>
                    );
                    if (!entry) return (
                      <div key={slot} className="px-6 py-5 flex items-center gap-4 opacity-30">
                        <div className="w-28 text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot}</div>
                        <div className="text-xs text-slate-300 italic">Free slot</div>
                      </div>
                    );
                    const isLab = entry.type === 'LAB';
                    return (
                      <div
                        key={slot}
                        onClick={() => handleEdit(entry)}
                        className="px-6 py-5 flex items-center gap-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="w-28 text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{slot}</div>
                        <div className={`w-1.5 h-12 rounded-full shrink-0 ${isLab ? 'bg-purple-500' : 'bg-sky-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{entry.subjectCode}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isLab ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'}`}>
                              {entry.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 truncate">{entry.subjectName}</h4>
                        </div>
                        <div className="flex items-center gap-5 ml-auto">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <GraduationCap className="h-3.5 w-3.5 opacity-50" />
                            {entry.facultyName || 'TBA'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 opacity-50" />
                            {entry.roomNumber || 'TBA'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <EditEntryModal
              entry={editingEntry}
              open={isEditModalOpen}
              onClose={() => setEditModalOpen(false)}
              onSave={handleSaveEntry}
              selectedSection={selectedSection}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
