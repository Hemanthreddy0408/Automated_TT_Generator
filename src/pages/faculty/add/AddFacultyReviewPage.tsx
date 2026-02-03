import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { createFaculty, updateFaculty } from "@/lib/api";

export default function AddFacultyReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const finalData = location.state;

  if (!finalData) {
    return (
      <AdminLayout title="Error" subtitle="">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-muted-foreground">No data found. Please start from the beginning.</p>
          <Button onClick={() => navigate("/admin/faculty/add")}>Go to Start</Button>
        </div>
      </AdminLayout>
    );
  }

  const handleConfirmRegistration = async () => {
    try {
      console.log("Submitting Faculty Data:", finalData);

      if (finalData.id) {
        // UPDATE
        console.log("Updating Faculty ID:", finalData.id);
        await updateFaculty(finalData.id, finalData);
      } else {
        // CREATE
        console.log("Creating New Faculty");
        await createFaculty(finalData);
      }

      // ✅ NEW: Clear the draft since we successfully saved!
      localStorage.removeItem("faculty_draft");

      navigate("/admin/faculty");
    } catch (error) {
      console.error("Failed to save faculty:", error);
      alert("Error saving faculty. Check console for details.");
    }
  };

  const handleSaveDraft = () => {
    const payload = {
      ...finalData,
      savedAt: new Date().toLocaleString()
    };
    localStorage.setItem("faculty_draft", JSON.stringify(payload));
    alert("Faculty draft saved!");
    navigate("/admin/faculty");
  };

  return (
    <AdminLayout title="Faculty Management" subtitle="Review & Registration">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold">
            {finalData.id ? "Review Updates" : "Review & Complete Registration"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please verify all details before {finalData.id ? "updating" : "finalizing"} the faculty record.
          </p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-center px-12">
          <div className="flex items-center w-full max-w-3xl">
            {["Basic Info", "Qualifications", "Review"].map((step, i) => (
              <div key={step} className="relative flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold bg-primary text-white`}>
                  {i < 2 ? "✓" : "3"}
                </div>
                <span className="absolute top-10 text-[10px] uppercase tracking-wider font-semibold text-primary">
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

            {/* LEFT COLUMN: Basic Info */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><b>Name:</b> {finalData.name}</p>
                  <p><b>ID:</b> {finalData.employeeId}</p>
                  <p><b>Email:</b> {finalData.email}</p>
                  <p><b>Department:</b> {finalData.department}</p>
                  <p><b>Designation:</b> {finalData.designation}</p>

                  <div className="flex items-center gap-2">
                    <b>Status:</b>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${finalData.isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}>
                      {finalData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">Professional Profile</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><b>Qualifications:</b> {finalData.qualifications?.join(", ") || "None"}</p>
                  <p><b>Specialization:</b> {finalData.specialization || "Not specified"}</p>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Subjects & Workload */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">Mapped Subjects</h4>
                <ul className="space-y-3 text-sm">
                  {finalData.eligibleSubjects && finalData.eligibleSubjects.length > 0 ? (
                    finalData.eligibleSubjects.map((sub: string) => (
                      <li key={sub} className="p-3 rounded-lg bg-muted/40 font-mono">{sub}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No subjects selected</li>
                  )}
                </ul>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase text-primary mb-3">Workload Summary</h4>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm"><b>Max Weekly Hours:</b> {finalData.maxHoursPerWeek}</p>
                  <p className="text-sm"><b>Max Daily Hours:</b> {finalData.maxHoursPerDay}</p>
                </div>
              </section>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="p-6 border-t bg-muted/40 flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Qualifications
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleSaveDraft}>Save as Draft</Button>
              <Button className="gap-2" onClick={handleConfirmRegistration}>
                {finalData.id ? "Update Faculty" : "Complete Registration"}
              </Button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="flex gap-3 p-4 rounded-lg border bg-primary/5 text-sm">
          <span className="font-bold">ℹ</span>
          {finalData.id
            ? "Updating this record will immediately affect upcoming schedule generations."
            : "By completing registration, this faculty will be included in the next automated scheduling cycle."
          }
        </div>
      </div>
    </AdminLayout>
  );
}