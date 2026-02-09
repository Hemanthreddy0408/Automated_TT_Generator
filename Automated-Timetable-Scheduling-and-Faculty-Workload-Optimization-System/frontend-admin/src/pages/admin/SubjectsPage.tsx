import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SubjectTable } from "@/components/tables/SubjectTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Icons
import {
  Plus, Search, Download, BookOpen, GraduationCap, Star,
  FileSpreadsheet, FileText, FileJson, Trash2
} from "lucide-react";

// Logic
import { getSubjects, deleteSubject } from "@/lib/api";
import { Subject } from "@/types/timetable";

// Export Libs
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SubjectsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "core" | "elective">("all");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Draft State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<any>(null);

  // 1. Fetch Data & Check Draft
  useEffect(() => {
    const fetchSubjects = () => {
      setLoading(true);
      getSubjects()
        .then((data) => {
          if (Array.isArray(data)) setSubjects(data);
          else setSubjects([]);
        })
        .finally(() => setLoading(false));
    };

    const savedDraft = localStorage.getItem("subject_draft");
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Error parsing subject draft:", e);
        localStorage.removeItem("subject_draft");
      }
    }

    fetchSubjects();
    window.addEventListener("focus", fetchSubjects);
    return () => window.removeEventListener("focus", fetchSubjects);
  }, []);

  // 2. Draft Handlers
  const handleResumeDraft = () => navigate("/admin/subjects/add", { state: draft });
  const handleDiscardDraft = () => {
    if (confirm("Discard unsaved draft?")) {
      localStorage.removeItem("subject_draft");
      setDraft(null);
    }
  };

  // 3. CRUD Handlers
  const handleEdit = (subject: Subject) => {
    navigate("/admin/subjects/add", { state: subject });
  };

  const handleDelete = async (subject: Subject) => {
    if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
      try {
        await deleteSubject(subject.id!);
        setSubjects(prev => prev.filter(s => s.id !== subject.id));
      } catch (e) {
        alert("Failed to delete subject");
      }
    }
  };

  // 4. Export Handlers
  const getExportData = () => subjects.map(s => ({
    Code: s.code,
    Name: s.name,
    Dept: s.department,
    Credits: s.credits,
    Type: s.elective ? "Elective" : "Core",
    L: s.lectureHoursPerWeek,
    T: s.tutorialHoursPerWeek,
    P: s.labHoursPerWeek
  }));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "Subjects.xlsx");
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Subjects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Subjects List", 14, 15);
    autoTable(doc, {
      head: [["Code", "Name", "Dept", "Credits", "Type", "L-T-P"]],
      body: subjects.map(s => [
        s.code, s.name, s.department, s.credits,
        s.elective ? "Elective" : "Core",
        `${s.lectureHoursPerWeek}-${s.tutorialHoursPerWeek}-${s.labHoursPerWeek}`
      ]),
      startY: 20,
    });
    doc.save("Subjects.pdf");
  };

  // 5. Filter Logic
  const { filteredSubjects, totalCredits, coreSubjects, electiveSubjects, totalSubjectsCount } = useMemo(() => {
    // Hide edited item if it matches draft
    const displaySubjects = draft ? subjects.filter(s => s.id !== draft.id) : subjects;

    const filtered = displaySubjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "core" && !subject.elective) ||
        (typeFilter === "elective" && subject.elective);

      return matchesSearch && matchesType;
    });

    return {
      filteredSubjects: filtered,
      // ✅ FIX: Use 'displaySubjects' so the stats ignore the hidden draft item
      totalSubjectsCount: displaySubjects.length,
      totalCredits: displaySubjects.reduce((sum, s) => sum + s.credits, 0),
      coreSubjects: displaySubjects.filter((s) => !s.elective).length,
      electiveSubjects: displaySubjects.filter((s) => s.elective).length,
    };
  }, [subjects, searchQuery, typeFilter, draft]);


  return (
    <AdminLayout
      title="Subject Management"
      subtitle="Manage courses and their configurations"
      actions={
        <Button className="gap-2" onClick={() => navigate("/admin/subjects/add")}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      }
    >
      <div className="space-y-6">

        {/* ✅ DRAFT BANNER */}
        {draft && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-4 items-center">
              <div className="bg-white p-2 rounded-full text-blue-600 border border-blue-100">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Unsaved Draft Found</h4>
                <p className="text-sm text-blue-700">for <b>{draft.name || "New Subject"}</b> saved at {draft.savedAt}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDiscardDraft} className="bg-white text-red-600 border-red-200">
                <Trash2 className="h-4 w-4 mr-2" /> Discard
              </Button>
              <Button size="sm" onClick={handleResumeDraft} className="bg-[#0f172a] text-white">
                Resume Editing
              </Button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<BookOpen className="h-6 w-6 text-primary" />} value={totalSubjectsCount} label="Total Subjects" />
          <StatCard icon={<GraduationCap className="h-6 w-6 text-blue-600" />} value={coreSubjects} label="Core Subjects" />
          <StatCard icon={<Star className="h-6 w-6 text-warning" />} value={electiveSubjects} label="Electives" />
          <StatCard icon={<BookOpen className="h-6 w-6 text-success" />} value={totalCredits} label="Total Credits" />
        </div>

        {/* FILTERS & EXPORT */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as never)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="elective">Elective</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}><FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}><FileText className="mr-2 h-4 w-4 text-blue-600" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}><FileJson className="mr-2 h-4 w-4 text-red-600" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <SubjectTable
            subjects={filteredSubjects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}