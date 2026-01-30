import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AddFacultyPage() {
  const navigate = useNavigate(); // ✅ MUST be inside component
  const [isActive, setIsActive] = useState(true);

  return (
    <AdminLayout title="Faculty Management" subtitle="Add New Faculty">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div>
          <h2 className="text-2xl font-bold">Add New Faculty</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the basic details to register a new faculty member.
          </p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-muted" />
          <div className="absolute top-5 left-0 w-1/3 h-[2px] bg-primary" />

          {["Basic Info", "Workload", "Review"].map((step, i) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${i === 0 ? "bg-primary text-white" : "bg-background border text-muted-foreground"}`}
              >
                {i + 1}
              </div>
              <span className={`text-xs font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* FORM CARD */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">

          <div className="p-6 border-b bg-muted/40">
            <h3 className="font-semibold">Step 1: Basic Information</h3>
          </div>

          <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium">Email Address</label>
              <input type="email" className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium">Department</label>
              <select className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm">
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Designation</label>
              <select className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm">
                <option>Professor</option>
                <option>Associate Professor</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Faculty ID</label>
              <input className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
            </div>

            <div className="flex items-center justify-between md:pt-6">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  Eligible for timetable assignments
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                className="h-5 w-5 accent-primary"
              />
            </div>
          </form>

          {/* ACTIONS */}
          <div className="p-6 border-t bg-muted/40 flex justify-between">
            <Button variant="outline" onClick={() => navigate("/admin/faculty")}>
              Cancel
            </Button>

            <Button onClick={() => navigate("/admin/faculty/add/qualifications")} className="gap-2">
              Next
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Button>
          </div>
        </div>

        {/* INFO */}
        <div className="flex gap-3 p-4 rounded-lg border bg-blue-50 text-blue-700 text-sm">
          <span className="material-symbols-outlined">info</span>
          Faculty details will be used to automatically optimize timetables.
        </div>

      </div>
    </AdminLayout>
  );
}
