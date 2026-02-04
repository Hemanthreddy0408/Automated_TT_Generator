import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSection } from "@/lib/api";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddSectionPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(2024);
  const [strength, setStrength] = useState(60);

  const save = async () => {
    await createSection({
      name,
      department,
      semester,
      year,
      strength,
      subjects: [],
    });

    navigate("/admin/sections");
  };

  return (
    <AdminLayout title="Add Section">
      <div className="space-y-4 max-w-md">
        <Input placeholder="Section Name" onChange={e => setName(e.target.value)} />
        <Input placeholder="Department" onChange={e => setDepartment(e.target.value)} />
        <Input type="number" placeholder="Semester" onChange={e => setSemester(+e.target.value)} />
        <Input type="number" placeholder="Year" onChange={e => setYear(+e.target.value)} />
        <Input type="number" placeholder="Strength" onChange={e => setStrength(+e.target.value)} />
        <Button onClick={save}>Save Section</Button>
      </div>
    </AdminLayout>
  );
}
