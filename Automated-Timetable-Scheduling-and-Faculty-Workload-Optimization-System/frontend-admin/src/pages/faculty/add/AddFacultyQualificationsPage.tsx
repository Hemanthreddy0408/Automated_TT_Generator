import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getSubjects } from "@/lib/api";
import { Subject } from "@/types/timetable";

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

  // 4. Load Live Subjects
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setAvailableSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Toggle Logic
  const toggleQualification = (q: string) => {
    setSelectedQualifications((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  const addSubject = (code: string) => {
    if (!assignedSubjects.includes(code)) {
      setAssignedSubjects([...assignedSubjects, code]);
    }
  };

  const removeSubject = (code: string) => {
    setAssignedSubjects(assignedSubjects.filter((s) => s !== code));
  };

  // ✅ Save Draft Logic
  const handleSaveDraft = () => {
    const draftData = {
      ...basicInfo,
      qualifications: selectedQualifications,
      specialization: specialization,
      eligibleSubjects: assignedSubjects,
      savedAt: new Date().toLocaleString()
    };

    localStorage.setItem("faculty_draft", JSON.stringify(draftData));
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
              <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">DYNAMIC D.B</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AVAILABLE */}
              <div className="border rounded-lg p-4 bg-background">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Available Subjects</h4>
                {loadingSubjects ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading subjects from database...</p>
                ) : (
                  <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {availableSubjects.map((sub) => (
                      <li key={sub.code} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded">
                        <span className="truncate pr-2" title={sub.name}><span className="font-mono text-xs text-slate-500 mr-2">{sub.code}</span> {sub.name}</span>
                        <button
                          onClick={() => addSubject(sub.code)}
                          disabled={assignedSubjects.includes(sub.code)}
                          className={`font-semibold text-xs px-2 py-1 rounded ${assignedSubjects.includes(sub.code) ? 'text-slate-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
                        >
                          {assignedSubjects.includes(sub.code) ? 'Added' : 'Add'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ASSIGNED */}
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                <h4 className="text-sm font-semibold mb-3 text-primary">Assigned Subjects</h4>
                <ul className="space-y-2">
                  {assignedSubjects.length === 0 && <span className="text-xs text-muted-foreground italic">No subjects assigned yet. Select from available subjects.</span>}
                  {assignedSubjects.map((code) => {
                    const subjectData = availableSubjects.find(s => s.code === code);
                    return (
                      <li key={code} className="flex justify-between items-center text-sm p-2 bg-background rounded border border-primary/10">
                        <span className="truncate pr-2">
                          <span className="font-mono text-xs text-primary mr-2">{code}</span>
                          {subjectData ? subjectData.name : "Loading..."}
                        </span>
                        <button
                          onClick={() => removeSubject(code)}
                          className="text-destructive font-semibold hover:bg-destructive/10 px-2 py-1 rounded text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
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