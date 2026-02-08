import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
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
    user: 'System Admin',
    role: 'Super Admin',
    action: 'Admin: Timetable CRUD Update',
    description: 'Updated Room LH-101 availability and faculty constraints',
    type: 'MANUAL',
    timestamp: 'Today, 2:45 PM',
    date: 'Feb 1, 2026',
    rollback: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    user: 'Faculty Member',
    role: 'Professor',
    action: 'Sick Leave Request',
    description: 'Requested leave: Feeling unwell / Fever',
    type: 'SYSTEM',
    timestamp: 'Today, 11:20 AM',
    date: 'Feb 1, 2026',
    rollback: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    user: 'Admin User',
    role: 'Super Admin',
    action: 'Exported Timetable CS-3A',
    description: 'Format: PDF / Semester Fall 2026',
    type: 'EXPORT',
    timestamp: 'Yesterday, 09:30 AM',
    date: 'Jan 31, 2026',
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
  const [search] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | HistoryType>('ALL');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 1),
    to: new Date(2026, 1, 28),
  });

  const filtered = useMemo(() => {
    return DATA.filter((row) => {
      const matchesSearch =
        row.action.toLowerCase().includes(search.toLowerCase()) ||
        row.user.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || row.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout
      title="History & Audit Log"
      subtitle="Track all scheduling actions and system changes"
    >
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                <p className="text-3xl font-bold mt-2">1,284</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
                <List className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Automated</p>
                <p className="text-3xl font-bold mt-2">452</p>
              </div>
              <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
                <Zap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Manual Edits</p>
                <p className="text-3xl font-bold mt-2">832</p>
              </div>
              <div className="bg-amber-100 text-amber-600 p-4 rounded-xl">
                <Edit className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rollbacks</p>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <div className="bg-red-100 text-red-600 p-4 rounded-xl">
                <History className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-sm mb-8">
          <CardContent className="px-8 py-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'ALL' | HistoryType)}>
                <SelectTrigger className="w-[190px] rounded-full">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    {dateRange?.from ? format(dateRange.from, "LLL dd, y") : "Date Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" className="ml-auto gap-2 rounded-full">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  <tr key={row.id} className="border-b border-muted/30 hover:bg-muted/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary ring-2 ring-muted/20 overflow-hidden">
                          {row.avatar ? <img src={row.avatar} /> : row.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{row.user}</p>
                          <p className="text-xs text-muted-foreground">{row.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-semibold">{row.action}</p>
                      <p className="text-xs text-muted-foreground">{row.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`${badgeStyle[row.type]} rounded-full border-0`}>{row.type}</Badge>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-semibold">{row.timestamp}</p>
                      <p className="text-xs text-muted-foreground">{row.date}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {row.rollback ? (
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                          <RotateCcw className="h-4 w-4" /> Rollback
                        </Button>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">No rollback</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}