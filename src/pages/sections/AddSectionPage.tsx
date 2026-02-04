import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { createSection } from "@/lib/api";

export default function AddSectionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(2024);
  const [strength, setStrength] = useState(60);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !department) {
      alert("Section name and department are required");
      return;
    }

    try {
      setSaving(true);
      await createSection({
        name,
        department,
        semester,
        year,
        strength,
        subjects: [],
      });

      navigate("/admin/sections");
    } catch (err) {
      console.error("Failed to create section", err);
      alert("Failed to create section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Section" subtitle="Create a new academic section">
      <div className="max-w-xl">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Input
              placeholder="Section Name (e.g. CSE-A)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="Department (e.g. CSE)"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                placeholder="Semester"
                value={semester}
                onChange={e => setSemester(+e.target.value)}
              />
              <Input
                type="number"
                placeholder="Year"
                value={year}
                onChange={e => setYear(+e.target.value)}
              />
              <Input
                type="number"
                placeholder="Strength"
                value={strength}
                onChange={e => setStrength(+e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => navigate("/admin/sections")}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Section"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
