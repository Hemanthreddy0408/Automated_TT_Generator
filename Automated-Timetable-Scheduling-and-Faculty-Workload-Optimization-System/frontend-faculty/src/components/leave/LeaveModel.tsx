import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaveModal = ({ isOpen, onClose }: LeaveModalProps) => {
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        facultyId: 1, // Hardcoded for now until session management is added
        facultyName: "Dr. Sarah Mitchell",
        leaveType,
        startDate,
        endDate,
        reason,
        status: "Pending",
        appliedDate: new Date().toISOString().split('T')[0]
      };

      await axios.post("http://localhost:8082/api/leaves", payload);

      toast.success("Leave application submitted successfully!");
      // Reset form
      setLeaveType("Casual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("Failed to submit leave request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981]">event_note</span>
            Apply for Leave
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-[#10b981] focus:border-[#10b981]"
            >
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>On Duty (OD)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm"
                type="date"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm"
                type="date"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm"
              placeholder="Briefly explain..."
              rows={3}
              required
            ></textarea>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-bold text-white bg-[#10b981] rounded-xl hover:opacity-90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;