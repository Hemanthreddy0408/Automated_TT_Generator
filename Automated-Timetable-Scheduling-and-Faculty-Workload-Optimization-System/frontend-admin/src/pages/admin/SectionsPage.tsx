import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { getSections, updateSection, deleteSection, getFaculty, FacultyPayload } from "@/lib/api";
import { Section } from "@/types/timetable";
import {
    Plus, Edit, Trash2, Calendar, Download,
    Search, Filter, MoreHorizontal, Archive, Save,
    CheckCircle2, AlertCircle, FileSpreadsheet, FileText,
    LayoutGrid, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SectionsPage() {
    const navigate = useNavigate();
    const [sections, setSections] = useState<Section[]>([]);
    const [faculties, setFaculties] = useState<FacultyPayload[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("ALL");
    const [yearFilter, setYearFilter] = useState("ALL");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState(1);
    const [capacity, setCapacity] = useState(60);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const [sectionsData, facultyData] = await Promise.all([
                getSections(),
                getFaculty()
            ]);
            setSections(Array.isArray(sectionsData) ? sectionsData : []);
            setFaculties(Array.isArray(facultyData) ? facultyData : []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch data");
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    // Filter Logic
    const filteredSections = sections.filter(sec => {
        const matchesSearch = sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sec.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === "ALL" || sec.department === deptFilter;
        const matchesYear = yearFilter === "ALL" || sec.year.toString() === yearFilter;
        return matchesSearch && matchesDept && matchesYear;
    });

    const resetForm = () => {
        setName("");
        setDepartment("");
        setYear(1);
        setCapacity(60);
        setEditingSection(null);
    };

    const handleEdit = (section: Section) => {
        navigate(`/admin/sections/edit/${section.id}`);
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSection(deleteId);
            toast.success("Section deleted successfully");
            fetchSections();
        } catch (e) {
            toast.error("Failed to delete section");
        } finally {
            setDeleteId(null);
        }
    };

    const handleSubmit = async (status: 'ACTIVE' | 'DRAFT' = 'ACTIVE') => {
        if (!name || !department) {
            toast.error("Name and Department are required");
            return;
        }

        const payload = { name, department, year, capacity, status };
        try {
            if (editingSection) {
                await updateSection(editingSection.id, payload);
                toast.success("Section updated successfully");
            }
            // Create is handled in separate page now, but keep logic in case we want to support quick add later

            setIsDialogOpen(false);
            resetForm();
            fetchSections();
        } catch (e) {
            toast.error("Failed to save section");
        }
    };

    const handleRowClick = (sectionId: number) => {
        navigate(`/admin/timetable?sectionId=${sectionId}`);
    };

    // --- Export Logic ---
    const getExportData = () => filteredSections.map(s => ({
        ID: s.id,
        Name: s.name,
        Department: s.department,
        Year: s.year,
        Capacity: s.capacity,
        Status: s.status || 'ACTIVE'
    }));

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(getExportData());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sections");
        XLSX.writeFile(wb, "Sections.xlsx");
        toast.success("Exported to Excel");
    };

    const exportToCSV = () => {
        const ws = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Sections.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported to CSV");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Sections List", 14, 15);
        autoTable(doc, {
            head: [["ID", "Name", "Department", "Year", "Capacity", "Status"]],
            body: filteredSections.map(s => [
                s.id, s.name, s.department, s.year, s.capacity, s.status || 'ACTIVE'
            ]),
            startY: 20,
        });
        doc.save("Sections.pdf");
        toast.success("Exported to PDF");
    };

    return (
        <AdminLayout
            title="Section Management"
            subtitle="Manage academic sections and their configurations"
        >
            <div className="space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center transition-all hover:shadow-md">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Sections</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{sections.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center transition-all hover:shadow-md">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Sections</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {sections.filter(s => s.status !== 'DRAFT').length}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center transition-all hover:shadow-md">
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg mr-4">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Capacity</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {sections.reduce((acc, curr) => acc + curr.capacity, 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search sections or departments..."
                            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
                                <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Depts</SelectItem>
                                <SelectItem value="CSE">CSE</SelectItem>
                                <SelectItem value="ECE">ECE</SelectItem>
                                <SelectItem value="MECH">MECH</SelectItem>
                                <SelectItem value="CIVIL">CIVIL</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={yearFilter} onValueChange={setYearFilter}>
                            <SelectTrigger className="w-[120px] bg-white dark:bg-slate-950">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Years</SelectItem>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Separator orientation="vertical" className="h-9 hidden md:block" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" /> Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                                    <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" /> CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                                    <FileText className="w-4 h-4 mr-2 text-red-600" /> PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20" onClick={() => navigate('/admin/sections/add')}>
                            <Plus className="h-4 w-4" /> Add Section
                        </Button>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">All Sections</CardTitle>
                                <CardDescription>Managing {filteredSections.length} active class sections</CardDescription>
                            </div>
                            <div className="text-sm text-slate-500">
                                Total Capacity: <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredSections.reduce((acc, curr) => acc + curr.capacity, 0)}</span> students
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-slate-50/50">
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Section Info</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Mentor</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex justify-center items-center gap-2 text-slate-500">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                                                Loading sections...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Search className="h-6 w-6 text-slate-300" />
                                                </div>
                                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No sections found</p>
                                                <p className="text-sm max-w-sm mx-auto">
                                                    We couldn't find any sections matching your search. Try adjusting filters or add a new section.
                                                </p>
                                                <Button variant="outline" onClick={() => { setSearchQuery(""); setDeptFilter("ALL"); setYearFilter("ALL") }} className="mt-2">
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSections.map((sec) => (
                                        <TableRow
                                            key={sec.id}
                                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                            onClick={() => handleRowClick(sec.id)}
                                        >
                                            <TableCell className="font-mono text-xs text-slate-500">#{sec.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                                        <AvatarFallback className="bg-teal-50 text-teal-700 font-bold text-sm">
                                                            {sec.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{sec.name}</div>
                                                        <div className="text-xs text-slate-500">Class of {new Date().getFullYear() + (4 - sec.year)}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                    {sec.department}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                                {sec.mentorId ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                                            {faculties.find(f => f.id === sec.mentorId)?.name.substring(0, 2).toUpperCase() || "??"}
                                                        </div>
                                                        <span className="truncate max-w-[120px]" title={faculties.find(f => f.id === sec.mentorId)?.name}>
                                                            {faculties.find(f => f.id === sec.mentorId)?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">Year {sec.year}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{sec.capacity}</span>
                                                    <span className="text-xs text-slate-400">students</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    sec.status === 'DRAFT'
                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-none font-normal"
                                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none font-normal"
                                                }>
                                                    {sec.status === 'DRAFT' ? (
                                                        <div className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Draft</div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Active</div>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleRowClick(sec.id)} className="cursor-pointer">
                                                                <Calendar className="mr-2 h-4 w-4" /> View Timetable
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleEdit(sec)} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => confirmDelete(sec.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Section
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Section Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Section Name</label>
                            <Input placeholder="e.g. A, B, Alpha" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Department</label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSE">CSE</SelectItem>
                                    <SelectItem value="ECE">ECE</SelectItem>
                                    <SelectItem value="MECH">MECH</SelectItem>
                                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                                    <SelectItem value="EEE">EEE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Year</label>
                                <Input type="number" value={year} onChange={e => setYear(+e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Capacity</label>
                                <Input type="number" value={capacity} onChange={e => setCapacity(+e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="ghost" className="text-amber-600 bg-amber-50 hover:bg-amber-100" onClick={() => handleSubmit('DRAFT')}>
                            <Archive className="h-4 w-4 mr-2" /> Save Draft
                        </Button>
                        <Button onClick={() => handleSubmit('ACTIVE')} className="bg-teal-600 hover:bg-teal-700">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the section and all associated scheduling data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Section
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
