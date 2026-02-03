import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { createConstraint } from "@/lib/api";
import { Plus } from "lucide-react"; // Add this line

export default function AddConstraintPage() {
  const priorities = [
    {
      key: "mandatory",
      title: "Mandatory",
      desc: "Must always be satisfied.",
    },
    {
      key: "preferred",
      title: "Preferred",
      desc: "Applied when possible.",
    },
    {
      key: "optional",
      title: "Optional",
      desc: "Nice-to-have rule.",
    },
  ];

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "institutional",
    priority: "mandatory",
    description: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Inside AddConstraintPage()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.category, // Backend uses 'type'
        priority: formData.priority,
        description: formData.description,
        isActive: formData.isActive,
        parameters: "{}" // Default empty JSON for now
      };

      setIsSubmitting(true);
      await createConstraint(payload);
      navigate("/admin/constraints");
    } catch (error) {
      console.error("Error creating constraint:", error);
      alert("Failed to create constraint. Please check if the backend is running.\n\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="New Scheduling Rule"
      subtitle="Constraint Configuration / Add New Constraint"
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

        {/* INFO */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Defining Rules:</strong> New constraints will be applied to the
            next timetable generation.
          </p>
        </div>

        {/* BASIC INFO */}
        <section className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Constraint Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Friday Early Finish"
                className="w-full mt-1 px-4 py-2 rounded-xl border"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Constraint Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 rounded-xl border"
              >
                <option value="institutional">Institutional</option>
                <option value="faculty">Faculty</option>
                <option value="room">Room</option>
                <option value="section">Section</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-xl border-dashed border">
            <div>
              <p className="font-medium">Active Status</p>
              <p className="text-xs text-slate-500">
                Enable this constraint for scheduling
              </p>
            </div>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5"
            />
          </div>
        </section>

        {/* PRIORITY */}
        <section className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold mb-6">
            Constraint Logic & Priority
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {priorities.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, priority: p.key }))
                }
                className={`p-4 rounded-xl border text-left transition-all ${formData.priority === p.key
                  ? "border-teal-500 bg-teal-50 ring-2 ring-teal-400"
                  : "border-slate-200 hover:border-slate-400"
                  }`}
              >
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Rule Definition</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full mt-1 px-4 py-3 rounded-xl border"
              placeholder="Describe the constraint logic..."
            />
          </div>
        </section>


        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6 pb-10">
          <button
            type="button"
            onClick={() => navigate("/admin/constraints")}
            className="px-6 py-2 border rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B294B] text-[#F8FAFC] rounded-lg hover:bg-[#1B294B]/90 transition-all font-medium text-[15px] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Constraint"}
          </button>
        </div>
      </form>
    </AdminLayout>

  );
}
