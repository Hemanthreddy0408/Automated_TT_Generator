import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AddFacultyReviewPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Faculty Management" subtitle="Review & Registration">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold">Review & Complete Registration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please verify all details before finalizing the faculty registration.
          </p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-center px-12">
          <div className="flex items-center w-full max-w-3xl">
            {["Basic Info", "Qualifications", "Review"].map((step, i) => (
              <div key={step} className="relative flex-1 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${i < 2 ? "bg-primary text-white" : "bg-primary ring-4 ring-primary/20 text-white"}`}
                >
                  {i < 2 ? "✓" : "3"}
                </div>
                <span
                  className={`absolute top-10 text-[10px] uppercase tracking-wider font-semibold
                  ${i === 2 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {step}
                </span>
                {i < 2 && <div className="absolute right-[-50%] top-4 h-[2px] w-full bg-primary" />}
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* LEFT */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p><b>Name:</b> Dr. Sarah Henderson</p>
                  <p><b>ID:</b> FAC-2024-089</p>
                  <p><b>Email:</b> s.henderson@university.edu</p>
                  <p><b>Department:</b> Computer Science</p>
                  <p><b>Designation:</b> Associate Professor</p>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">
                  Professional Profile
                </h4>
                <div className="space-y-2 text-sm">
                  <p><b>Highest Degree:</b> Ph.D. in AI & Robotics</p>
                  <p><b>Experience:</b> 12 Years</p>
                  <p><b>Specialization:</b> Machine Learning, Computer Vision</p>
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">
                  Mapped Subjects
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="p-3 rounded-lg bg-muted/40">CS401 – Advanced AI</li>
                  <li className="p-3 rounded-lg bg-muted/40">CS302 – DBMS</li>
                  <li className="p-3 rounded-lg bg-muted/40">CS509 – DL Ethics</li>
                </ul>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">
                  Workload Summary
                </h4>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <b>Target:</b> 18 hrs / week
                  </p>
                  <p className="text-sm">
                    <b>Max Daily Slots:</b> 4
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="p-6 border-t bg-muted/40 flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/faculty/add/qualifications")}
            >
              Back to Qualifications
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost">Save Draft</Button>
              <Button
                className="gap-2"
                onClick={() => navigate("/admin/faculty")}
              >
                Complete Registration
              </Button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="flex gap-3 p-4 rounded-lg border bg-primary/5 text-sm">
          <span className="font-bold">ℹ</span>
          By completing registration, this faculty will be included in the next
          automated scheduling cycle.
        </div>
      </div>
    </AdminLayout>
  );
}
