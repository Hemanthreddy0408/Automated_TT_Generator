import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { FacultyTable } from '@/components/tables/FacultyTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { getFaculty } from '@/lib/api';
import { Faculty } from '@/types/timetable';

import { Plus, Search, Filter, Download, Users, CheckCircle } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FacultyPage() {
  // ---------------- STATE ----------------
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await getFaculty();
        setFaculty(data);
      } catch (err) {
        console.error('Failed to fetch faculty', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <AdminLayout title="Faculty Management">
        <p className="p-6 text-muted-foreground">Loading faculty...</p>
      </AdminLayout>
    );
  }

  // ---------------- FILTER ----------------
  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive);

    return matchesSearch && matchesStatus;
  });

  // ---------------- STATS ----------------
  const activeFaculty = faculty.filter((f) => f.isActive).length;
  const avgSessionsPerFaculty =
    activeFaculty === 0 ? '0.0' : (0 / activeFaculty).toFixed(1);

  // ---------------- UI ----------------
  return (
    <AdminLayout
      title="Faculty Management"
      subtitle="Manage teaching staff and their assignments"
      actions={
        <Button className="gap-2" onClick={() => navigate('/admin/faculty/add')}>
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{faculty.length}</p>
                <p className="text-sm text-muted-foreground">Total Faculty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <p className="text-2xl font-bold">{activeFaculty}</p>
                <p className="text-sm text-muted-foreground">Active Faculty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-6 w-6 text-info" />
              <div>
                <p className="text-2xl font-bold">{avgSessionsPerFaculty}</p>
                <p className="text-sm text-muted-foreground">
                  Avg Sessions / Faculty
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <Badge variant="secondary">
          {filteredFaculty.length} faculty members
        </Badge>

        <FacultyTable
          faculty={filteredFaculty}
          onEdit={(f) => console.log('Edit', f)}
          onDelete={(f) => console.log('Delete', f)}
          onViewSchedule={(f) => console.log('Schedule', f)}
        />
      </div>
    </AdminLayout>
  );
}
