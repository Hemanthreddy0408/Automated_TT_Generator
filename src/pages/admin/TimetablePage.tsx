import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { TimetableGrid, TimetableEntry } from "@/components/timetable/TimetableGrid";
import { generateTimetable, getTimetable } from "@/lib/api";

export default function TimetablePage() {

  const sectionId = "583cb115-a010-4ce9-bb42-83092a820e";

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimetable = async () => {
    const data = await getTimetable(sectionId);
    setEntries(data);
  };

  const handleGenerate = async () => {
    setLoading(true);
    await generateTimetable(sectionId);
    await fetchTimetable();
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <AdminLayout
      title="Timetable"
      subtitle="Auto-generated schedule for section"
      actions={
        <Button onClick={handleGenerate} disabled={loading}>
          Generate Timetable
        </Button>
      }
    >
      <TimetableGrid entries={entries} />
    </AdminLayout>
  );
}
