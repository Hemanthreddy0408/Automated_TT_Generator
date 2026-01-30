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
} from 'lucide-react';

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
      <div className="space-y-6">

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-sm">Total Actions</p><p className="text-2xl font-bold">1,284</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm">Automated</p><p className="text-2xl font-bold">452</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm">Manual Edits</p><p className="text-2xl font-bold">832</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm">Rollbacks</p><p className="text-2xl font-bold">24</p></CardContent></Card>
        </div>

        {/* FILTER BAR */}
        <Card>
          <CardContent className="pt-6 flex flex-wrap items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | HistoryType)}
            >
              <option value="ALL">All Action Types</option>
              <option value="MANUAL">Manual</option>
              <option value="SYSTEM">System</option>
              <option value="EXPORT">Export</option>
            </select>

            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={25}>Show 25</option>
            </select>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="pl-9 pr-3 py-2 border rounded-md text-sm w-64"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left py-3">User</th>
                  <th className="text-left py-3">Action</th>
                  <th className="text-left py-3">Type</th>
                  <th className="text-left py-3">Timestamp</th>
                  <th className="text-right py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4">
                      <p className="font-medium">{row.user}</p>
                      <p className="text-xs text-muted-foreground">{row.role}</p>
                    </td>

                    <td className="py-4">
                      <p className="font-medium">{row.action}</p>
                      <p className="text-xs text-muted-foreground">{row.description}</p>
                    </td>

                    <td className="py-4">
                      <Badge variant="outline" className={badgeStyle[row.type]}>
                        {row.type}
                      </Badge>
                    </td>

                    <td className="py-4">
                      <p>{row.timestamp}</p>
                      <p className="text-xs text-muted-foreground">{row.date}</p>
                    </td>

                    <td className="py-4 text-right">
                      {row.rollback ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 hover:text-destructive"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Rollback
                        </Button>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          No rollback
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
              <span>
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, filtered.length)} of{' '}
                {filtered.length} entries
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INFO */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <strong>Important:</strong> Rolling back a system-wide version reverts
          all associated assignments. This action is logged as a new entry.
        </div>
      </div>
    </AdminLayout>
  );
}
