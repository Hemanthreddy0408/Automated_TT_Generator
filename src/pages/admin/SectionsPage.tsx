import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { Trash2, Plus, Search, Layers, Users, Calendar } from "lucide-react";

import { getSections, deleteSection } from "@/lib/api";
import { Section } from "@/types/timetable";

export default function SectionsPage() {
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch sections
  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const data = await getSections();
        if (Array.isArray(data)) {
          setSections(data);
        } else {
          console.error("Sections API did not return an array:", data);
          setSections([]);
        }
      } catch (err) {
        console.error("Failed to fetch sections", err);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Delete section (✅ FIXED ID TYPE)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this section?")) return;

    try {
      await deleteSection(id);
      setSections(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete section", err);
    }
  };

  // Filtering
  const filteredSections = useMemo(() => {
    return sections.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [sections, search]);

  // Stats
  const stats = useMemo(() => ({
    total: sections.length,
    totalStudents: sections.reduce((sum, s) => sum + s.strength, 0),
    semesters: new Set(sections.map(s => s.semester)).size,
  }), [sections]);

  return (
    <AdminLayout
      title="Section Management"
      subtitle="Manage academic sections and student batches"
      actions={
        <Button onClick={() => navigate("/admin/sections/add")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      }
    >
      <div className="space-y-6">

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Layers />} label="Total Sections" value={stats.total} />
          <StatCard icon={<Users />} label="Total Students" value={stats.totalStudents} />
          <StatCard icon={<Calendar />} label="Active Semesters" value={stats.semesters} />
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by section or department..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Dept</th>
                <th className="px-4 py-3 text-left">Sem</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Strength</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Loading sections...
                  </td>
                </tr>
              )}

              {!loading && filteredSections.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No sections found
                  </td>
                </tr>
              )}

              {filteredSections.map(section => (
                <tr key={section.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{section.name}</td>
                  <td className="px-4 py-3">{section.department}</td>
                  <td className="px-4 py-3">{section.semester}</td>
                  <td className="px-4 py-3">{section.year}</td>
                  <td className="px-4 py-3">{section.strength}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ---------- STAT CARD ---------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
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
