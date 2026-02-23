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
  AlertTriangle,
  X,
} from 'lucide-react';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { getAuditLogs, updateAuditLog, AuditLog } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

  /**
   * Fetch audit logs from the backend on component mount.
   */
  useEffect(() => {
    getAuditLogs().then(data => {
      if (!Array.isArray(data)) return;

      const mapped: HistoryEntry[] = data.map(log => {
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
          description: cleanDesc.length > 50 ? cleanDesc.substring(0, 50) + '...' : cleanDesc,
          type: cleanUser.includes('System') ? 'SYSTEM' : 'MANUAL',
          timestamp: isNaN(dateObj.getTime()) ? "00:00" : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: isNaN(dateObj.getTime()) ? "Long ago" : dateObj.toLocaleDateString(),
          rollback: false,
          avatar: undefined,
          dbTimestamp: isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
        };
      });
      setLogs(mapped);
    }).catch(err => {
      console.error("Critical: Failed to map audit logs", err);
    });
  }, []);

  /* ---------- FILTER LOGIC ---------- */
  const filtered = useMemo(() => {
    return logs.filter((row) => {
      const matchesSearch =
        row.action.toLowerCase().includes(search.toLowerCase()) ||
        row.user.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === 'ALL' || row.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter, logs]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ---------- EDIT HANDLERS ---------- */
  const handleEditClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setEditedDescription(entry.description);
    setConflictError(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry) return;

    if (!editedDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Description cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateAuditLog({
        id: parseInt(selectedEntry.id),
        description: editedDescription,
        lastModifiedTimestamp: selectedEntry.dbTimestamp,
      });

      if (result.hasConflict) {
        // Conflict detected
        setConflictError(result.message);
        toast({
          title: "Conflict Detected! ⚠️",
          description: result.message,
          variant: "destructive",
        });
      } else if (result.success) {
        // Success - update the local state
        setLogs(prevLogs =>
          prevLogs.map(log =>
            log.id === selectedEntry.id
              ? {
                ...log,
                description: editedDescription.length > 50 ? editedDescription.substring(0, 50) + '...' : editedDescription,
                dbTimestamp: new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
              }
              : log
          )
        );

        toast({
          title: "Success ✓",
          description: "Audit log entry updated successfully",
          variant: "default",
        });

        setEditDialogOpen(false);
        setSelectedEntry(null);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update audit log",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating audit log:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary">
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
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
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
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
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

          {/* Rollbacks (Currently hardcoded as backend doesn't support them yet) */}
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rollbacks</p>
                <p className="text-3xl font-bold mt-2">0</p>
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

              {/* Filters label */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
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
                  <button className="flex items-center gap-3 rounded-full border bg-background px-5 py-3 text-sm font-medium">
                    <span className="material-icons text-base text-muted-foreground">
                      calendar_today
                    </span>
                    <span>
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                          dateRange.to,
                          "MMM d, yyyy"
                        )}`
                        : "Select date range"}
                    </span>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-2" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
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

              {/* Export */}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto gap-2 rounded-full px-4 py-3 text-muted-foreground hover:bg-muted/50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>

            </div>
          </CardContent>
        </Card>


        {/* TABLE */}
        <Card className="rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left px-8 py-5 font-semibold">USER</th>
                  <th className="text-left px-8 py-5 font-semibold">ACTION</th>
                  <th className="text-left px-8 py-5 font-semibold">TYPE</th>
                  <th className="text-left px-8 py-5 font-semibold">TIMESTAMP</th>
                  <th className="text-right px-8 py-5 font-semibold">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-muted/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* USER */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {row.avatar ? (
                          <img
                            src={row.avatar}
                            alt={row.user}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-muted/20"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary ring-2 ring-muted/20">
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
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-semibold">{row.action}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {row.description}
                        </p>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-8 py-6">
                      <Badge
                        variant="outline"
                        className={`${badgeStyle[row.type]} rounded-full px-4 py-2 text-xs font-semibold border-0`}
                      >
                        {row.type}
                      </Badge>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-semibold">{row.timestamp}</p>
                        <p className="text-xs text-muted-foreground font-medium">{row.date}</p>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 px-4 py-2 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleEditClick(row)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        {row.rollback && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 px-4 py-2 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Rollback
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
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
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
                {totalPages > 3 && <span className="px-2">…</span>}
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
