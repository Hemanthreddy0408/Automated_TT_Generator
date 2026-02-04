import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getSections, deleteSection } from "@/lib/api";
import { Section } from "@/types/timetable";
import { Button } from "@/components/ui/button";

export default function SectionsPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSections = async () => {
    try {
      const data = await getSections();

      // IMPORTANT SAFETY CHECK
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


  return (
    <AdminLayout
      title="Section Management"
      subtitle="Manage academic sections and student batches"
      actions={
        <Button onClick={() => navigate("/admin/sections/add")}>
          + Add Section
        </Button>
      }
    >
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Dept</th>
            <th>Sem</th>
            <th>Year</th>
            <th>Strength</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.department}</td>
              <td>{s.semester}</td>
              <td>{s.year}</td>
              <td>{s.strength}</td>
              <td>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteSection(s.id);
                    setSections(sections.filter(sec => sec.id !== s.id));
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
