import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddFacultyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check for Edit Data
  const editData = location.state;

  useEffect(() => {
    if (!editData) {
      const draft = localStorage.getItem("faculty_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (confirm(`Unsaved draft for "${parsed.name || "New Faculty"}" found. Load it?`)) {
            // Re-navigate with the draft state to trigger initialization
            navigate("/admin/faculty/add", { state: parsed, replace: true });
          }
        } catch (e) {
          console.error("Error parsing faculty draft:", e);
          localStorage.removeItem("faculty_draft");
        }
      }
    }
  }, [editData, navigate]);

  // 2. Initialize State (Now including Setters for Workload)
  const [isActive, setIsActive] = useState(editData?.isActive ?? true);
  const [name, setName] = useState(editData?.name || "");
  const [email, setEmail] = useState(editData?.email || "");
  const [department, setDepartment] = useState(editData?.department || "");
  const [designation, setDesignation] = useState(editData?.designation || "");
  const [employeeId, setEmployeeId] = useState(editData?.employeeId || "");

  // ✅ ADDED INPUT STATE FOR WORKLOAD
  const [maxHoursPerDay, setMaxHoursPerDay] = useState<number>(
    editData?.maxHoursPerDay ? Number(editData.maxHoursPerDay) : 6
  );
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState<number>(
    editData?.maxHoursPerWeek ? Number(editData.maxHoursPerWeek) : 30
  );
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    const stepOneData = {
      id: editData?.id,
      name,
      email,
      department,
      designation,
      employeeId,
      isActive,
      maxHoursPerDay: Number(maxHoursPerDay), // Ensure number type
      maxHoursPerWeek: Number(maxHoursPerWeek), // Ensure number type

      // Preserve other data if editing
      qualifications: editData?.qualifications || [],
      specialization: editData?.specialization || "",
      eligibleSubjects: editData?.eligibleSubjects || [],
      avatarUrl: editData?.avatarUrl || ""
    };

    navigate("/admin/faculty/add/qualifications", { state: stepOneData });
  };

  return (
    <AdminLayout
      title="Faculty Management"
      subtitle={editData ? "Edit Faculty Details" : "Add New Faculty"}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div>
          <h2 className="text-2xl font-bold">
            {editData ? "Edit Faculty" : "Add New Faculty"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {editData ? "Update the details below." : "Fill in the basic details to register a new faculty member."}
          </p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-muted" />
          <div className="absolute top-5 left-0 w-1/3 h-[2px] bg-primary" />
          {["Basic Info", "Qualifications", "Review"].map((step, i) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? "bg-primary text-white" : "bg-background border text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{step}</span>
            </div>
          ))}
        </div>

        {/* FORM CARD */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/40">
            <h3 className="font-semibold">Faculty Information</h3>
          </div>

          <form id="step1-form" onSubmit={handleNextStep} className="p-8 space-y-8">

            {/* SECTION 1: PERSONAL DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium">Department</label>
                <select className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                  <option value="">Select Department</option>
                  <option>CSE</option>
                  <option>ECE</option>
                  <option>EEE</option>
                  <option>MECH</option>
                  <option>CIVIL</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Designation</label>
                <select className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" value={designation} onChange={(e) => setDesignation(e.target.value)} required>
                  <option value="">Select Designation</option>
                  <option>Professor</option>
                  <option>Associate Professor</option>
                  <option>Assistant Professor</option>
                  <option>Lecturer</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Faculty ID</label>
                <input className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
              </div>

              <div className="flex items-center justify-between md:pt-6">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">Eligible for timetable assignments</p>
                </div>
                <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="h-5 w-5 accent-primary" />
              </div>
            </div>

            {/* ✅ SECTION 2: WORKLOAD LIMITS (NEW) */}
            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold text-primary mb-4 uppercase">Workload Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-sm font-medium">Max Hours Per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm"
                    value={maxHoursPerDay}
                    onChange={(e) => setMaxHoursPerDay(Number(e.target.value))}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Recommended: 4-6 hours</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Hours Per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm"
                    value={maxHoursPerWeek}
                    onChange={(e) => setMaxHoursPerWeek(Number(e.target.value))}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Standard: 30-40 hours</p>
                </div>
              </div>
            </div>

          </form>

          {/* ACTIONS */}
          <div className="p-6 border-t bg-muted/40 flex justify-between">
            <Button variant="outline" onClick={() => navigate("/admin/faculty")}>
              Cancel
            </Button>
            <Button type="submit" form="step1-form" className="gap-2">
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}