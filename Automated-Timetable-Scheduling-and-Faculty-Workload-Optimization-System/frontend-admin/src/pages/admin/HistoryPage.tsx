import { useMemo, useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Search,
  Download,
  Filter,
  List,
  Zap,
  Edit,
  History,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';

import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { getAuditLogs, updateAuditLog, AuditLog } from "@/lib/api";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type HistoryType = 'MANUAL' | 'SYSTEM' | 'EXPORT';

type HistoryEntry = {
  id: string;
  user: string;
  role: string;
  action: string;
  description: string;
  type: HistoryType;
  timestamp: string;
  date: string;
  rollback: boolean;
  avatar?: string;
  dbTimestamp: string; // Store the DB timestamp for conflict detection
};

const badgeStyle: Record<HistoryType, string> = {
  MANUAL: 'bg-amber-100 text-amber-700 border-amber-200',
  SYSTEM: 'bg-purple-100 text-purple-700 border-purple-200',
  EXPORT: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | HistoryType>('ALL');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(2027, 0, 1),
  });

  const [logs, setLogs] = useState<HistoryEntry[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setEditedDescription(entry.description);
    setEditDialogOpen(true);
    setConflictError(null);
  };

  const handleRollback = async (id: string) => {
    try {
      await fetch(`http://localhost:8083/api/audit-logs/rollback/${id}`, {
        method: "POST"
      });

      toast({
        title: "Rollback Successful",
        description: "The action has been reverted"
      });

      loadLogs();
    } catch (error) {
      toast({
        title: "Rollback Failed",
        variant: "destructive"
      });
    }
  };

  const handleUndoRollback = async (id: string) => {
    try {
      await fetch(`http://localhost:8083/api/audit-logs/undo-rollback/${id}`, {
        method: "POST"
      });

      toast({
        title: "Undo Successful",
        description: "The rollback has been undone."
      });

      loadLogs();
    } catch (error) {
      toast({
        title: "Undo Failed",
        variant: "destructive"
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry) return;

    try {
      setIsSubmitting(true);
      setConflictError(null);

      const result = await updateAuditLog({
        id: Number(selectedEntry.id),
        description: editedDescription,
        lastModifiedTimestamp: selectedEntry.dbTimestamp
      });

      if (result.success) {
        toast({
          title: "History Updated",
          description: "Audit log description updated successfully.",
        });
        setEditDialogOpen(false);
        loadLogs(); // Refresh to show the updated entry at the top
      } else if (result.hasConflict) {
        setConflictError(result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to update history entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!editDialogOpen) {
      setEditedDescription("");
      setSelectedEntry(null);
    }
  }, [editDialogOpen]);

  const loadLogs = () => {
    getAuditLogs().then(data => {
      if (!Array.isArray(data)) return;

      const activeLogs = data.filter(log => log.status !== "ROLLED_BACK");

      const mapped: HistoryEntry[] = activeLogs.map(log => {
        const rawTime = log.timestamp || new Date().toISOString();
        const cleanDesc = log.description || "No description provided";
        const cleanUser = log.userEmail || "Unknown User";

        const isoTime = rawTime.includes('T') ? rawTime : rawTime.replace(' ', 'T');
        const dateObj = new Date(isoTime);

        return {
          id: String(log.id),
          user: cleanUser,
          role: cleanUser.includes('System') ? 'System Process' : 'Admin',
          action: `${log.actionType || 'Action'} ${log.entityType || ''}`,
          description: cleanDesc,
          type: cleanUser.includes('System') ? 'SYSTEM' : 'MANUAL',
          timestamp: isNaN(dateObj.getTime()) ? "00:00" : format(dateObj, "HH:mm"),
          date: isNaN(dateObj.getTime()) ? "Long ago" : format(dateObj, "MMM dd, yyyy"),
          rollback: log.actionType !== "ROLLBACK" && log.actionType !== "UNDO_ROLLBACK",
          isRollbackLog: log.actionType === "ROLLBACK",
          avatar: undefined,
          dbTimestamp: isNaN(dateObj.getTime()) ? "" : format(dateObj, "yyyy-MM-dd HH:mm:ss"),
        };
      });
      setLogs(mapped);
    }).catch(err => {
      console.error("Critical: Failed to map audit logs", err);
    });
  };

  /**
   * Fetch audit logs from the backend on component mount.
   */
  useEffect(() => {
    loadLogs();
  }, []);

  /* ---------- FILTER LOGIC ---------- */
  const filtered = useMemo(() => {
    return logs
      .filter((row) => {
        const matchesSearch =
          row.action.toLowerCase().includes(search.toLowerCase()) ||
          row.user.toLowerCase().includes(search.toLowerCase()) ||
          row.description.toLowerCase().includes(search.toLowerCase());

        const matchesType =
          typeFilter === 'ALL' || row.type === typeFilter;

        const logDate = new Date(row.dbTimestamp);
        const matchesDate =
          !dateRange?.from ||
          !dateRange?.to ||
          (logDate >= dateRange.from && logDate <= dateRange.to);

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => new Date(b.dbTimestamp).getTime() - new Date(a.dbTimestamp).getTime());
  }, [search, typeFilter, logs, dateRange]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ---------- EXPORT LOGIC ---------- */
  const getExportData = () => filtered.map(row => ({
    User: row.user,
    Role: row.role,
    Action: row.action,
    Description: row.description,
    Type: row.type,
    Timestamp: row.timestamp,
    Date: row.date,
  }));

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AuditLog_History.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log');
    XLSX.writeFile(wb, 'AuditLog_History.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('History & Audit Log', 14, 15);
    autoTable(doc, {
      head: [['User', 'Role', 'Action', 'Description', 'Type', 'Timestamp', 'Date']],
      body: filtered.map(row => [
        row.user, row.role, row.action, row.description, row.type, row.timestamp, row.date
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save('AuditLog_History.pdf');
  };

  return (
    <AdminLayout
      title="History & Audit Log"
      subtitle="Track all scheduling actions and system changes"
    >
      <div className="space-y-8 p-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Actions */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary border-l-4 border-blue-500">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                <p className="text-3xl font-bold mt-2">{logs.length.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium">Activity Stream</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl shadow-sm">
                <List className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Automated */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">System Actions</p>
                <p className="text-3xl font-bold mt-2">{logs.filter(l => l.type === 'SYSTEM').length.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Automated processes
                </p>
              </div>
              <div className="bg-purple-100 text-purple-600 p-4 rounded-xl shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Manual Edits */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-500">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Admin Actions</p>
                <p className="text-3xl font-bold mt-2">{logs.filter(l => l.type === 'MANUAL').length.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Manual adjustments
                </p>
              </div>
              <div className="bg-amber-100 text-amber-600 p-4 rounded-xl shadow-sm">
                <Edit className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Rollbacks — computed dynamically from audit logs */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rollbacks</p>
                <p className="text-3xl font-bold mt-2">
                  {logs.filter(l => (l as any).isRollbackLog).length.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Changes reverted
                </p>
              </div>
              <div className="bg-red-100 text-red-600 p-4 rounded-xl shadow-sm">
                <History className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTER BAR */}
        <Card className="rounded-xl shadow-sm mb-8">
          <CardContent className="px-8 py-6">
            <div className="flex flex-wrap items-center gap-4">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ width: '220px' }}
                />
              </div>

              {/* Filters label */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ml-2">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              {/* Action Type */}
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as 'ALL' | HistoryType)}
              >
                <SelectTrigger className="w-[190px] rounded-full border bg-background px-5 py-3 text-sm font-medium">
                  <SelectValue placeholder="All Action Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Action Types</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                </SelectContent>
              </Select>

              {/* Users */}
              <Select disabled>
                <SelectTrigger className="w-[150px] rounded-full border bg-background px-5 py-3 text-sm font-medium opacity-70">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-3 rounded-full border bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4 text-foreground/70" />
                    <span>
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[380px] p-0 shadow-xl border rounded-xl bg-background"
                  align="center"
                  side="bottom"
                  sideOffset={4}
                >
                  <div className="flex flex-col divide-y border-b">

                    {/* Quick Presets Menu */}
                    <div className="flex flex-row p-3 justify-center gap-2 bg-muted/30 flex-wrap">
                      {[
                        { label: "Today", days: 0 },
                        { label: "Last 7 Days", days: 7 },
                        { label: "Last 30 Days", days: 30 },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="ghost"
                          size="sm"
                          className="font-normal text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-sm px-4 h-9 rounded-md"
                          onClick={() => {
                            const today = new Date();
                            setDateRange({
                              from: preset.days === 0 ? today : subDays(today, preset.days),
                              to: today
                            });
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>

                    {/* Calendar Area */}
                    <div className="p-4 flex justify-center max-w-[380px]">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        classNames={{
                          day_range_middle: "aria-selected:bg-primary/15 aria-selected:text-primary rounded-none",
                          day_range_start: "aria-selected:bg-primary aria-selected:text-primary-foreground rounded-l-md rounded-r-none",
                          day_range_end: "aria-selected:bg-primary aria-selected:text-primary-foreground rounded-r-md rounded-l-none",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted hover:text-foreground rounded-md transition-colors flex items-center justify-center",
                          cell: "p-0 text-center text-sm focus-within:relative focus-within:z-20",
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 flex items-center justify-end gap-2 bg-muted/10 rounded-b-xl border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange(undefined)}
                      className="text-muted-foreground hover:text-foreground rounded-full"
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Show entries */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] rounded-full border bg-background px-5 py-3 text-sm font-medium">
                  <SelectValue placeholder="Show 5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Show 3</SelectItem>
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="25">Show 25</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(search || typeFilter !== 'ALL' || dateRange) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("ALL");
                    setDateRange(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              )}

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto gap-2 rounded-full px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV} className="gap-2 hover:text-foreground">
                    <FileText className="h-4 w-4" /> CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel} className="gap-2 hover:text-foreground">
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2 hover:text-foreground">
                    <FileText className="h-4 w-4" /> PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </CardContent>
        </Card>


        {/* TABLE */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {filtered.length} results found
          </p>
        </div>

        <Card className="rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">USER</th>
                  <th className="text-left px-6 py-4 font-semibold">ACTION</th>
                  <th className="text-left px-6 py-4 font-semibold">TYPE</th>
                  <th className="text-left px-6 py-4 font-semibold">TIMESTAMP</th>
                  <th className="text-right px-6 py-4 font-semibold">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-muted/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* USER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        {/* Avatar */}
                        {row.avatar ? (
                          <img
                            src={row.avatar}
                            alt={row.user}
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-muted/20"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary shadow-sm ring-2 ring-muted/20">
                            {row.user.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">{row.user}</p>
                          <p className="text-xs text-muted-foreground font-medium">{row.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p
                          className={`font-semibold text-sm ${row.action.toLowerCase().includes("delete")
                            ? "text-red-600"
                            : "text-foreground"
                            }`}
                        >
                          {row.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {row.description}
                        </p>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${badgeStyle[row.type]} rounded-full px-4 py-2 text-xs font-semibold border-0`}
                      >
                        {row.type}
                      </Badge>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold text-sm">{row.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{row.date}</p>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 px-3 py-1.5 hover:bg-primary hover:text-white transition"
                          onClick={() => handleEditClick(row)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        {row.rollback && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 px-3 py-1.5 hover:bg-primary hover:text-white transition"
                            onClick={() => handleRollback(row.id)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Rollback
                          </Button>
                        )}
                        {(row as any).isRollbackLog && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 px-3 py-1.5 hover:bg-primary hover:text-white transition"
                            onClick={() => handleUndoRollback(row.id)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Undo Undo
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* FOOTER */}
            <div className="flex items-center justify-between px-8 py-6 text-sm text-muted-foreground border-t border-muted/30 bg-muted/20">
              <span className="font-medium">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full hover:bg-muted"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ‹
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full h-9 w-9 p-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full hover:bg-muted"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EDIT MODAL DIALOG */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit History Entry</DialogTitle>
              <DialogDescription>
                Modify the description for this audit log entry. Changes will be recorded with a new timestamp.
              </DialogDescription>
            </DialogHeader>

            {selectedEntry && (
              <div className="space-y-6 py-4">
                {/* Display Entry Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">User</p>
                    <p className="font-semibold text-sm">{selectedEntry.user}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Action</p>
                    <p className="font-semibold text-sm">{selectedEntry.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Type</p>
                    <Badge
                      variant="outline"
                      className={`${badgeStyle[selectedEntry.type]} rounded-full px-4 py-1 text-xs font-semibold border-0 w-fit`}
                    >
                      {selectedEntry.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Date</p>
                    <p className="font-semibold text-sm">{selectedEntry.date} {selectedEntry.timestamp}</p>
                  </div>
                </div>

                {/* Conflict Alert */}
                {conflictError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 ml-2">
                      {conflictError}
                      <p className="text-xs mt-2 font-semibold">Please refresh and try again with the latest version.</p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description *</label>
                  <Textarea
                    placeholder="Enter updated description..."
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[120px] resize-none rounded-lg"
                    disabled={!!conflictError || isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedDescription.length} characters
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setConflictError(null);
                }}
                disabled={isSubmitting || !!conflictError}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting || !editedDescription.trim() || !!conflictError}
                className="gap-2"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
