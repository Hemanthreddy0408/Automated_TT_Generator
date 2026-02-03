/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// UI Components
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FacultyTable } from '@/components/tables/FacultyTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Plus, Search, Filter, Download, Users, CheckCircle,
  FileText, Trash2, FileSpreadsheet, FileJson
} from 'lucide-react';

// API & Types
import { getFaculty, deleteFaculty } from '@/lib/api';
import { Faculty } from '@/types/timetable';

// Export Libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// ✅ FIX: Import autoTable directly
import autoTable from 'jspdf-autotable';

export default function FacultyPage() {
  // ---------------- STATE ----------------
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<any>(null);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await getFaculty();
        setFaculty(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch faculty', err);
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    };

    const savedDraft = localStorage.getItem("faculty_draft");
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Error parsing faculty draft:", e);
        localStorage.removeItem("faculty_draft");
      }
    }

    fetchFaculty();
  }, []);

  // ---------------- EXPORT LOGIC (FIXED) ----------------

  const getExportData = () => {
    return faculty.map(f => ({
      ID: f.employeeId,
      Name: f.name,
      Email: f.email,
      Department: f.department,
      Designation: f.designation,
      "Max Hours/Day": f.maxHoursPerDay,
      "Max Hours/Week": f.maxHoursPerWeek,
      Status: (f.isActive || (f as any).active) ? "Active" : "Inactive"
    }));
  };

  const exportToExcel = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");
    XLSX.writeFile(workbook, "Faculty_List.xlsx");
  };

  const exportToCSV = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Faculty_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Name", "Dept", "Designation", "Email", "Status"];
    const tableRows: any[] = [];

    faculty.forEach(f => {
      const facultyData = [
        f.employeeId,
        f.name,
        f.department,
        f.designation,
        f.email,
        (f.isActive || (f as any).active) ? "Active" : "Inactive"
      ];
      tableRows.push(facultyData);
    });

    // Add Title
    doc.text("Faculty List", 14, 15);

    // ✅ FIX: Use autoTable(doc, options) syntax
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Faculty_List.pdf");
  };


  // ---------------- HANDLERS ----------------

  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this unsaved draft?")) {
      localStorage.removeItem("faculty_draft");
      setDraft(null);
    }
  };

  const handleResumeDraft = () => {
    // Navigate to Add Page with draft data
    // ✅ Must match the Route path defined in App.tsx
    navigate("/admin/faculty/add", { state: draft });
  };

  const handleEdit = (facultyMember: Faculty) => {
    // ✅ Must match the Route path defined in App.tsx
    navigate('/admin/faculty/add', { state: facultyMember });
  };

  const handleDelete = async (facultyMember: Faculty) => {
    if (confirm(`Are you sure you want to delete ${facultyMember.name}?`)) {
      try {
        await deleteFaculty(facultyMember.id);
        setFaculty((prev) => prev.filter((f) => f.id !== facultyMember.id));
      } catch (error) {
        alert("Failed to delete faculty member.");
      }
    }
  };

  if (loading) return <AdminLayout title="Faculty"><p>Loading...</p></AdminLayout>;

  // ---------------- FILTER ----------------
  const filteredFaculty = faculty.filter((member) => {
    if (draft && draft.id === member.id) return false;

    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const isActiveMember = member.isActive || (member as any).active;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActiveMember) ||
      (statusFilter === 'inactive' && !isActiveMember);

    return matchesSearch && matchesStatus;
  });

  const activeFacultyCount = faculty.filter((f) => f.isActive || (f as any).active).length;
  const avgSessionsPerFaculty = activeFacultyCount === 0 ? '0.0' : (0 / activeFacultyCount).toFixed(1);

  // ---------------- UI ----------------
  return (
    <AdminLayout
      title="Faculty Management"
      subtitle="Manage teaching staff and their assignments"
      actions={
        <div className="flex items-center gap-2">
          {draft && (
            <Button
              variant="secondary"
              className="gap-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
              onClick={handleResumeDraft}
            >
              <FileText className="h-4 w-4" />
              Resume Draft
            </Button>
          )}
          <Button className="gap-2" onClick={() => navigate('/admin/faculty/add')}>
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* DRAFT BANNER */}
        {draft && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-full border border-blue-100 text-blue-600 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Unsaved Draft Found</h4>
                <p className="text-sm text-blue-700 mt-0.5">
                  You have an unsaved record for <span className="font-medium">{draft.name || "New Faculty"}</span>.
                  <span className="opacity-70 ml-2 text-xs">Last saved: {draft.savedAt}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleDiscardDraft} className="text-red-600 border-red-200 bg-white">
                <Trash2 className="h-4 w-4 mr-2" /> Discard
              </Button>
              <Button size="sm" onClick={handleResumeDraft} className="bg-[#0f172a] text-white">
                Resume Editing
              </Button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-8 w-8 text-primary/80" />
              <div>
                <p className="text-2xl font-bold">{faculty.length}</p>
                <p className="text-sm text-muted-foreground">Total Faculty</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle className="h-8 w-8 text-green-600/80" />
              <div>
                <p className="text-2xl font-bold">{activeFacultyCount}</p>
                <p className="text-sm text-muted-foreground">Active Faculty</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-8 w-8 text-blue-500/80" />
              <div>
                <p className="text-2xl font-bold">{avgSessionsPerFaculty}</p>
                <p className="text-sm text-muted-foreground">Avg Sessions / Faculty</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTERS & EXPORT */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileJson className="mr-2 h-4 w-4 text-red-600" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Faculty Members</h3>
            <Badge variant="secondary" className="bg-white border">
              {filteredFaculty.length} Results
            </Badge>
          </div>

          <FacultyTable
            faculty={filteredFaculty}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewSchedule={(f) => console.log('View Schedule', f)}
          />
        </div>

      </div>
    </AdminLayout>
  );
}