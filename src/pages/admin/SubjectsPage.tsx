import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { SubjectTable } from "@/components/tables/SubjectTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { mockSubjects } from "@/data/mockData";

import {
  Plus,
  Search,
  Filter,
  Download,
  BookOpen,
  GraduationCap,
  Star,
} from "lucide-react";


export default function SubjectsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "core" | "elective">("all");

  /* ----------------------------------
     Derived Data (clean & efficient)
  ----------------------------------- */
  const {
    filteredSubjects,
    totalCredits,
    coreSubjects,
    electiveSubjects,
  } = useMemo(() => {
    const filtered = mockSubjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "core" && !subject.isElective) ||
        (typeFilter === "elective" && subject.isElective);

      return matchesSearch && matchesType;
    });

    return {
      filteredSubjects: filtered,
      totalCredits: mockSubjects.reduce((sum, s) => sum + s.credits, 0),
      coreSubjects: mockSubjects.filter((s) => !s.isElective).length,
      electiveSubjects: mockSubjects.filter((s) => s.isElective).length,
    };
  }, [searchQuery, typeFilter]);

  return (
    <AdminLayout
      title="Subject Management"
      subtitle="Manage courses and their configurations"
      actions={
        <Button className="gap-2" onClick={() => navigate("/admin/subjects/add")}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      }
    >
      <div className="space-y-6">

        {/* ------------------ QUICK STATS ------------------ */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            value={mockSubjects.length}
            label="Total Subjects"
          />
          <StatCard
            icon={<GraduationCap className="h-6 w-6 text-blue-600" />}
            value={coreSubjects}
            label="Core Subjects"
          />
          <StatCard
            icon={<Star className="h-6 w-6 text-warning" />}
            value={electiveSubjects}
            label="Electives"
          />
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-success" />}
            value={totalCredits}
            label="Total Credits"
          />
        </div>

        {/* ------------------ FILTERS ------------------ */}
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

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as never)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="elective">Elective</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* ------------------ RESULT INFO ------------------ */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filteredSubjects.length} subjects</Badge>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              matching “{searchQuery}”
            </span>
          )}
        </div>

        {/* ------------------ TABLE ------------------ */}
        <SubjectTable
          subjects={filteredSubjects}
          onEdit={(subject) => console.log("Edit:", subject)}
          onDelete={(subject) => console.log("Delete:", subject)}
        />
      </div>
    </AdminLayout>
  );
}

/* ----------------------------------
   Small reusable stat card
----------------------------------- */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
