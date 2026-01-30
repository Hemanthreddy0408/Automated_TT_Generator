import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FacultyTable } from '@/components/tables/FacultyTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockFaculty, mockSessions } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Users, CheckCircle, XCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';



export default function FacultyPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFaculty = mockFaculty.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && faculty.isActive) ||
      (statusFilter === 'inactive' && !faculty.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeFaculty = mockFaculty.filter(f => f.isActive).length;
  const totalSessions = mockSessions.length;
  const avgSessionsPerFaculty = (totalSessions / activeFaculty).toFixed(1);

  return (
    <AdminLayout
      title="Faculty Management"
      subtitle="Manage teaching staff and their assignments"
      actions={
        <Button
          className="gap-2"
          onClick={() => navigate('/admin/faculty/add')}
        >
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      }

    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockFaculty.length}</p>
                <p className="text-sm text-muted-foreground">Total Faculty</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeFaculty}</p>
                <p className="text-sm text-muted-foreground">Active Faculty</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Users className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgSessionsPerFaculty}</p>
                <p className="text-sm text-muted-foreground">Avg Sessions/Faculty</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Results Info */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredFaculty.length} faculty members
          </Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching "{searchQuery}"
            </span>
          )}
        </div>

        {/* Faculty Table */}
        <FacultyTable
          faculty={filteredFaculty}
          onEdit={(faculty) => console.log('Edit:', faculty)}
          onDelete={(faculty) => console.log('Delete:', faculty)}
          onViewSchedule={(faculty) => console.log('View schedule:', faculty)}
        />
      </div>
    </AdminLayout>
  );
}
