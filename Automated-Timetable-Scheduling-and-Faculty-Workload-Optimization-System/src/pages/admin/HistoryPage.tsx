import { useMemo, useState } from 'react';
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

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

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
};

const DATA: HistoryEntry[] = [
  {
    id: '1',
    user: 'Admin User',
    role: 'Super Admin',
    action: 'Manually edited CS301 slot',
    description: 'Moved from Mon 09:00 to Tue 10:00 (LH-101)',
    type: 'MANUAL',
    timestamp: 'Today, 2:45 PM',
    date: 'Aug 27, 2024',
    rollback: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    user: 'System Engine',
    role: 'Auto-scheduler v2.4',
    action: 'Generated Fall 2024 Version 3',
    description: 'Optimization score: 94.2%',
    type: 'SYSTEM',
    timestamp: 'Aug 26, 11:20 AM',
    date: '24 hours ago',
    rollback: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    user: 'Admin User',
    role: 'Super Admin',
    action: 'Exported Timetable CS-3A',
    description: 'Format: PDF',
    type: 'EXPORT',
    timestamp: 'Aug 25, 09:30 AM',
    date: '2 days ago',
    rollback: false,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

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
  from: new Date(2024, 7, 1),
  to: new Date(2024, 7, 30),
});


  /* ---------- FILTER LOGIC ---------- */
  const filtered = useMemo(() => {
    return DATA.filter((row) => {
      const matchesSearch =
        row.action.toLowerCase().includes(search.toLowerCase()) ||
        row.user.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === 'ALL' || row.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <AdminLayout
      title="History & Audit Log"
      subtitle="Track all scheduling actions and system changes"
    >
      <div className="space-y-8 p-6">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Actions */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-8 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
              <p className="text-3xl font-bold mt-2">1,284</p>
              <p className="text-xs text-green-600 font-medium">↗ +12% this week</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
              <List className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Automated */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-8 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Automated</p>
              <p className="text-3xl font-bold mt-2">452</p>
              <p className="text-xs text-muted-foreground font-medium">
                Generated versions
              </p>
            </div>
            <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Manual Edits */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-8 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Manual Edits</p>
              <p className="text-3xl font-bold mt-2">832</p>
              <p className="text-xs text-muted-foreground font-medium">
                Direct adjustments
              </p>
            </div>
            <div className="bg-amber-100 text-amber-600 p-4 rounded-xl">
              <Edit className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Rollbacks */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-8 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rollbacks</p>
              <p className="text-3xl font-bold mt-2">24</p>
              <p className="text-xs text-muted-foreground font-medium">
                Changes reverted
              </p>
            </div>
            <div className="bg-red-100 text-red-600 p-4 rounded-xl">
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
                      {row.rollback ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 px-4 py-2 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Rollback
                        </Button>
                      ) : (
                        <span className="text-xs italic text-muted-foreground font-medium">
                          No rollback available
                        </span>
                      )}
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
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-muted">‹</Button>
                <Button className="rounded-full h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90">1</Button>
                <Button variant="ghost" className="rounded-full h-9 w-9 p-0 hover:bg-muted">2</Button>
                <Button variant="ghost" className="rounded-full h-9 w-9 p-0 hover:bg-muted">3</Button>
                <span className="px-2">…</span>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-muted">›</Button>
              </div>
            </div>
          </CardContent>
        </Card>


        </div>
    </AdminLayout>
  );
}
