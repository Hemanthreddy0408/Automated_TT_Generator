import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { TimetableEntry } from "@/components/timetable/TimetableGrid";
import { TimetableView } from "@/components/timetable/TimetableView";
import { generateTimetable, generateAllTimetables, getTimetable, getSections, updateTimetableEntry } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { Loader2, Users, School, Calendar, Coffee, Utensils, Sparkles, MapPin, GraduationCap, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/types/timetable";
import { EditEntryModal } from "@/components/timetable/EditEntryModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timetableRef = useRef<HTMLDivElement>(null);

  // ✅ MUST MATCH DB UUID (COPY FROM pgAdmin)
  const sectionId = searchParams.get("sectionId") || "583cb115-a010-4ce9-bb42-83092a820e";

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
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

  // Fetch All Sections on Mount
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
    if (!sectionId) return;
    try {
      const data = await getTimetable(sectionId);
      setEntries(data);
    } catch (e) {
      console.error("Failed to fetch timetable", e);
    }
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

  const exportToPDF = async () => {
    if (!timetableRef.current) return;

    setLoading(true);
    const element = timetableRef.current;

    // Save original styles
    const originalStyle = element.style.cssText;

    try {
      // Force the entire container to be visible and expanded
      element.style.width = 'max-content';
      element.style.maxWidth = 'none';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 3, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Important: set capture dimensions to the full scrollable area
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth + 100, // Extra padding
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[ref]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = 'max-content';
            clonedElement.style.maxWidth = 'none';
            clonedElement.style.overflow = 'visible';
          }

          // CRITICAL: Find the horizontal scroll container and force it to be wide
          const scrollContainer = clonedDoc.getElementById('timetable-scroll-container');
          if (scrollContainer instanceof HTMLElement) {
            scrollContainer.style.overflow = 'visible';
            scrollContainer.style.width = 'max-content';
            scrollContainer.style.maxWidth = 'none';
            // Also ensure the grid itself inside isn't constrained
            const grid = scrollContainer.firstElementChild as HTMLElement;
            if (grid) {
              grid.style.width = 'max-content';
              grid.style.minWidth = '1600px'; // Ensure 10 slots * 160px min
            }
          }
        }
      });

      // Restore original style
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with orientation based on dimensions
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Timetable_Full_View_${selectedSection?.name || 'Section'}.pdf`);
      toast.success("High-definition complete timetable exported!");
    } catch (error) {
      console.error("PDF Export failed", error);
      element.style.cssText = originalStyle;
      toast.error("Failed to export PDF");
    } finally {
      setLoading(false);
    }
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
              <DropdownMenuItem onClick={exportToExcel}>Excel (Data)</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>CSV (Data)</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className="font-bold text-blue-600">High-Fidelity PDF</DropdownMenuItem>
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
          <div ref={timetableRef} className="space-y-6 bg-slate-50 p-6 rounded-3xl">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-700">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Class Strength</p>
                    <h3 className="text-xl font-black text-slate-800">{selectedSection?.capacity || "--"} <span className="text-xs font-bold text-slate-400">Students</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-purple-100 p-3 rounded-2xl text-purple-700">
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Class Details</p>
                    <h3 className="text-xl font-black text-slate-800">{selectedSection?.name} <span className="text-sm font-bold text-slate-400">Year {selectedSection?.year}</span></h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-green-100 p-3 rounded-2xl text-green-700">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status</p>
                    <h3 className="text-xl font-black text-slate-800">{entries.length > 0 ? "Generated" : "Not Generated"}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* VIEW TOGGLE */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-4">
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                {(['weekly', 'day'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDay === day ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
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
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <h3 className="font-bold text-slate-800 uppercase tracking-tight">
                    {selectedDay} Schedule
                  </h3>
                  <span className="ml-auto text-[10px] font-black bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-400">
                    {entries.filter(e => e.day === selectedDay && e.type !== 'BREAK' && e.type !== 'LUNCH').length} CLASSES
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {TIME_SLOTS.map(slot => {
                    const entry = entries.find(e => e.day === selectedDay && e.timeSlot === slot);
                    const isBreak = slot === '10:30-10:45' || slot === 'LUNCH_BREAK';
                    const breakLabel = slot === '10:30-10:45' ? 'Morning Break' : 'Lunch Break';
                    if (isBreak) return (
                      <div key={slot} className="px-6 py-3 flex items-center gap-4 bg-slate-50/30">
                        <div className="w-28 text-[10px] font-black text-slate-300 uppercase tracking-widest">{slot === 'LUNCH_BREAK' ? '12:25 - 02:05' : slot}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase italic">
                          {slot === 'LUNCH_BREAK' ? <Utensils className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                          {breakLabel}
                        </div>
                      </div>
                    );
                    if (!entry) return (
                      <div key={slot} className="px-6 py-5 flex items-center gap-4 opacity-30">
                        <div className="w-28 text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot}</div>
                        <div className="text-[10px] font-bold text-slate-300 uppercase italic">Free slot</div>
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
                        <div className={`w-1.5 h-12 rounded-full shrink-0 ${isLab ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]'}`} />
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
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <GraduationCap className="h-3.5 w-3.5 opacity-50" />
                            {entry.facultyName || 'TBA'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
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
          </div>
        )}

        <EditEntryModal
          entry={editingEntry}
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEntry}
          selectedSection={selectedSection}
        />
      </div>
    </AdminLayout>
  );
}
