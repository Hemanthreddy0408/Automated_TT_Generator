import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Mock Data for Subjects
const AVAILABLE_SUBJECTS = [
  { id: "CS201", name: "Data Structures" },
  { id: "CS302", name: "Operating Systems" },
  { id: "CS401", name: "Computer Networks" },
  { id: "IT101", name: "Web Technology" },
  { id: "CS505", name: "Cloud Computing" },
];

const QUALIFICATIONS = ["PhD", "Master’s", "Bachelor’s"];

const AddFacultyQualificationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve data passed from Step 1
  const basicInfo = location.state;

  // 2. Safety Check
  useEffect(() => {
    if (!basicInfo) {
      alert("Missing form data. Redirecting to start.");
      navigate("/admin/faculty/add");
    }
  }, [basicInfo, navigate]);

  // 3. Initialize State
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(
    basicInfo?.qualifications && basicInfo.qualifications.length > 0 
      ? basicInfo.qualifications 
      : ["Master’s"]
  );

  const [specialization, setSpecialization] = useState(
    basicInfo?.specialization || ""
  );

  const [assignedSubjects, setAssignedSubjects] = useState<string[]>(
    basicInfo?.eligibleSubjects || []
  );

  // Toggle Logic
  const toggleQualification = (q: string) => {
    setSelectedQualifications((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  const addSubject = (id: string) => {
    if (!assignedSubjects.includes(id)) {
      setAssignedSubjects([...assignedSubjects, id]);
    }
  };

  const removeSubject = (id: string) => {
    setAssignedSubjects(assignedSubjects.filter((s) => s !== id));
  };

  // ✅ NEW: Save Draft Logic
  const handleSaveDraft = () => {
    const draftData = {
      ...basicInfo,
      qualifications: selectedQualifications,
      specialization: specialization,
      eligibleSubjects: assignedSubjects,
      savedAt: new Date().toLocaleString() // Add timestamp
    };

    // Save to LocalStorage
    localStorage.setItem("faculty_draft", JSON.stringify(draftData));
    
    // Show confirmation and go back to list
    alert("Draft saved successfully!");
    navigate("/admin/faculty");
  };

  const handleNextStep = () => {
    const combinedData = {
      ...basicInfo,
      qualifications: selectedQualifications,
      specialization: specialization,
      eligibleSubjects: assignedSubjects
    };

    navigate("/admin/faculty/add/review", { state: combinedData });
  };

  if (!basicInfo) return null;

  return (
    <AdminLayout 
      title="Faculty Management" 
      subtitle={basicInfo.id ? "Edit Qualifications" : "Add Qualifications"}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold">
            {basicInfo.id ? "Edit Qualifications" : "Add Qualifications"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define academic eligibility and subject mapping.
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-muted" />
          <div className="absolute top-5 left-0 w-2/3 h-[2px] bg-primary" />

          {["Basic Info", "Qualifications", "Review"].map((step, i) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${i <= 1 ? "bg-primary text-white" : "bg-background border text-muted-foreground"}`}
              >
                {i === 0 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-semibold ${i <= 1 ? "text-primary" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-8 space-y-8">
          
          {/* QUALIFICATIONS */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Academic Qualifications</h3>
            <div className="flex gap-3 flex-wrap">
              {QUALIFICATIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => toggleQualification(q)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition
                    ${selectedQualifications.includes(q)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted border-input text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* SPECIALIZATION */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Area of Specialization
            </label>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Machine Learning, Distributed Systems"
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* SUBJECT MAPPING */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Subject Eligibility Mapping</h3>
              <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">EPIC 1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AVAILABLE */}
              <div className="border rounded-lg p-4 bg-background">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Available Subjects</h4>
                <ul className="space-y-2">
                  {AVAILABLE_SUBJECTS.map((sub) => (
                    <li key={sub.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded">
                      <span>{sub.id}: {sub.name}</span>
                      <button
                        onClick={() => addSubject(sub.id)}
                        className="text-primary font-semibold hover:underline text-xs"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ASSIGNED */}
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                <h4 className="text-sm font-semibold mb-3 text-primary">Assigned Subjects</h4>
                <ul className="space-y-2">
                  {assignedSubjects.length === 0 && <span className="text-xs text-muted-foreground italic">No subjects assigned yet.</span>}
                  {assignedSubjects.map((id) => (
                    <li key={id} className="flex justify-between items-center text-sm p-2 bg-background rounded border border-primary/10">
                      <span>{id}</span>
                      <button
                        onClick={() => removeSubject(id)}
                        className="text-destructive font-semibold hover:underline text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between pt-6 border-t mt-4">
            <button
              onClick={() => navigate(-1)} 
              className="px-6 py-2 rounded-lg border text-muted-foreground font-semibold hover:bg-muted"
            >
              Back
            </button>

            <div className="flex gap-3">
              {/* ✅ Save Draft Button */}
              <button 
                onClick={handleSaveDraft}
                className="px-6 py-2 rounded-lg text-primary border border-primary/20 bg-primary/5 font-semibold hover:bg-primary/10"
              >
                Save Draft
              </button>

              <button
                onClick={handleNextStep}
                className="px-8 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90"
              >
                Continue to Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddFacultyQualificationsPage;