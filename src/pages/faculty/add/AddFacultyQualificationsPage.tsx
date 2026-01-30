import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([
    "PhD",
    "Master’s",
  ]);

  const [specialization, setSpecialization] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([
    "CS201",
    "CS401",
  ]);

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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Add Faculty – Qualifications & Subjects
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Define academic eligibility and subject mapping for this faculty member.
        </p>
      </div>

      {/* PROGRESS */}
      <div className="flex items-center justify-between max-w-xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="text-xs mt-1">Basic Info</span>
        </div>

        <div className="flex-1 h-[2px] bg-primary mx-2" />

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            2
          </div>
          <span className="text-xs mt-1 text-primary font-semibold">
            Qualifications
          </span>
        </div>

        <div className="flex-1 h-[2px] bg-slate-300 mx-2" />

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">
            3
          </div>
          <span className="text-xs mt-1 text-slate-400">Review</span>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
        {/* QUALIFICATIONS */}
        <div>
          <h2 className="font-semibold text-slate-800 mb-2">
            Academic Qualifications
          </h2>

          <div className="flex gap-3 flex-wrap">
            {QUALIFICATIONS.map((q) => (
              <button
                key={q}
                onClick={() => toggleQualification(q)}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition
                  ${
                    selectedQualifications.includes(q)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-100 border-slate-300 text-slate-600"
                  }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* SPECIALIZATION */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Area of Specialization
          </label>
          <input
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Machine Learning, Distributed Systems"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* SUBJECT MAPPING */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-800">
              Subject Eligibility Mapping
            </h2>
            <span className="text-xs px-2 py-1 bg-slate-100 rounded">
              EPIC 1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AVAILABLE */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 text-slate-600">
                Available Subjects
              </h3>

              <ul className="space-y-2">
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{sub.id}: {sub.name}</span>
                    <button
                      onClick={() => addSubject(sub.id)}
                      className="text-primary font-semibold"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ASSIGNED */}
            <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
              <h3 className="text-sm font-semibold mb-3 text-primary">
                Assigned Subjects
              </h3>

              <ul className="space-y-2">
                {assignedSubjects.map((id) => (
                  <li
                    key={id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{id}</span>
                    <button
                      onClick={() => removeSubject(id)}
                      className="text-red-500 font-semibold"
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
        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => navigate("/admin/faculty/add")}
            className="px-6 py-2 rounded-lg border text-slate-600 font-semibold"
          >
            Back
          </button>

          <div className="flex gap-3">
            <button className="px-6 py-2 rounded-lg text-slate-500 font-semibold">
              Save Draft
            </button>

            <button
              onClick={() => navigate("/admin/faculty/add/review")}
              className="px-8 py-2 rounded-lg bg-primary text-white font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <span className="font-bold">ℹ</span>
        Subjects mapped here determine automatic timetable assignment.
      </div>
    </div>
  );
};

export default AddFacultyQualificationsPage;
