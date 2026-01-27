import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SubjectTable } from '@/components/tables/SubjectTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSubjects } from '@/data/mockData';
import { Plus, Search, Filter, Download, BookOpen, GraduationCap, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredSubjects = mockSubjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'core' && !subject.isElective) ||
      (typeFilter === 'elective' && subject.isElective);

    return matchesSearch && matchesType;
  });

  const totalCredits = mockSubjects.reduce((sum, s) => sum + s.credits, 0);
  const coreSubjects = mockSubjects.filter(s => !s.isElective).length;
  const electiveSubjects = mockSubjects.filter(s => s.isElective).length;

  return (
    <AdminLayout
      title="Subject Management"
      subtitle="Manage courses and their configurations"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockSubjects.length}</p>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coreSubjects}</p>
                <p className="text-sm text-muted-foreground">Core Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Star className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{electiveSubjects}</p>
                <p className="text-sm text-muted-foreground">Electives</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCredits}</p>
                <p className="text-sm text-muted-foreground">Total Credits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="core">Core Only</SelectItem>
              <SelectItem value="elective">Electives Only</SelectItem>
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
            {filteredSubjects.length} subjects
          </Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching "{searchQuery}"
            </span>
          )}
        </div>

        {/* Subject Table */}
        <SubjectTable
          subjects={filteredSubjects}
          onEdit={(subject) => console.log('Edit:', subject)}
          onDelete={(subject) => console.log('Delete:', subject)}
        />
      </div>
    </AdminLayout>
  );
}
