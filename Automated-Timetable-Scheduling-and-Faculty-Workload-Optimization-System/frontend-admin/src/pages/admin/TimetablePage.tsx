import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { TimetableGrid, TimetableEntry } from "@/components/timetable/TimetableGrid";
import { generateTimetable, generateAllTimetables, getTimetable, getSections } from "@/lib/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Users, School, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/types/timetable";
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
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // ✅ MUST MATCH DB UUID (COPY FROM pgAdmin)
  const sectionId = searchParams.get("sectionId") || "583cb115-a010-4ce9-bb42-83092a820e";

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch All Sections on Mount
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
  };

  useEffect(() => {
    fetchTimetable();
  }, [sectionId]);

  const handleSectionChange = (newId: string) => {
    setSearchParams({ sectionId: newId });
  };

  const handleGenerate = async () => {
    setLoading(true);
    await generateTimetable(sectionId);
    await fetchTimetable();
    setLoading(false);
  };

  const handleGenerateAll = async () => {
    if (!confirm("This will clear all existing timetables and regenerate for ALL sections. Continue?")) return;
    setLoading(true);
    await generateAllTimetables();
    await fetchTimetable();
    setLoading(false);
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
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name} ({s.department})
                </SelectItem>
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

          <Button onClick={handleGenerateAll} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            Generate All
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

            {/* TIMETABLE GRID */}
            <TimetableGrid entries={entries} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
