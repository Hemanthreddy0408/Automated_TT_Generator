import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Star,
  Sparkles,
  Users,
  Lightbulb,
} from "lucide-react";

export default function AddSubjectPage() {
  const navigate = useNavigate();

  const [credits, setCredits] = useState(4);
  const [lectures, setLectures] = useState(3);
  const [tutorials, setTutorials] = useState(1);
  const [practicals, setPracticals] = useState(2);
  const [facultyCount, setFacultyCount] = useState(2);
  const [subjectType, setSubjectType] = useState<"core" | "elective">("core");

  return (
    <AdminLayout title="Subject Management" subtitle="Add New Subject">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ================= CARD ================= */}
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">

          {/* -------- BASIC INFO -------- */}
          <div className="p-8 space-y-8">
            <SectionHeader icon={<BookOpen />} title="Basic Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Subject Name" placeholder="e.g. Data Structures & Algorithms" />
              <Input label="Subject Code" placeholder="e.g. CS301" />

              <Select label="Department">
                <option value="">Select Department</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Mechanical</option>
              </Select>

              <Input
                label="Total Credits"
                type="number"
                value={credits}
                onChange={(e) => setCredits(+e.target.value)}
              />
            </div>

            {/* -------- WEEKLY HOURS -------- */}
            <SectionHeader icon={<Clock />} title="Weekly Hours Breakdown" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HourCard label="Lectures (L)" value={lectures} onChange={setLectures} />
              <HourCard label="Tutorials (T)" value={tutorials} onChange={setTutorials} />
              <HourCard label="Practicals (P)" value={practicals} onChange={setPracticals} />
            </div>

            {/* -------- SUBJECT TYPE -------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionHeader icon={<Star />} title="Subject Type" />
                <div className="flex gap-4 mt-4">
                  <TypeCard
                    active={subjectType === "core"}
                    icon={<Star />}
                    label="Core Subject"
                    onClick={() => setSubjectType("core")}
                  />
                  <TypeCard
                    active={subjectType === "elective"}
                    icon={<Sparkles />}
                    label="Elective"
                    onClick={() => setSubjectType("elective")}
                  />
                </div>
              </div>

              {/* -------- FACULTY -------- */}
              <div>
                <SectionHeader icon={<Users />} title="Faculty Allocation" />
                <p className="text-sm text-muted-foreground mt-2">
                  Min. Required Faculty
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <CounterButton onClick={() => setFacultyCount(Math.max(1, facultyCount - 1))}>
                    −
                  </CounterButton>
                  <span className="text-xl font-bold">{facultyCount}</span>
                  <CounterButton onClick={() => setFacultyCount(facultyCount + 1)}>
                    +
                  </CounterButton>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Suggested faculty members for this credit load.
                </p>
              </div>
            </div>
          </div>

          {/* -------- FOOTER -------- */}
          <div className="px-8 py-6 bg-muted/40 border-t flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/subjects")}>
              Cancel
            </Button>
            <Button className="px-6">Save Subject</Button>
          </div>
        </div>

        {/* -------- QUICK TIP -------- */}
        <div className="flex gap-3 p-4 rounded-xl border bg-blue-50 text-blue-700 text-sm">
          <Lightbulb className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">Quick Tip</p>
            Core subjects are prioritized in timetable optimization and usually
            scheduled in morning slots.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= COMPONENTS ================= */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b pb-4">
      <span className="text-primary">{icon}</span>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...rest}
        className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
      />
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const { label, children, ...rest } = props;
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        {...rest}
        className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm"
      >
        {children}
      </select>
    </div>
  );
}

function HourCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

function TypeCard({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border p-4 text-center transition
        ${active ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
    >
      <div className="flex flex-col items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </button>
  );
}

function CounterButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 w-9 rounded-lg border flex items-center justify-center font-bold hover:bg-muted"
    >
      {children}
    </button>
  );
}
