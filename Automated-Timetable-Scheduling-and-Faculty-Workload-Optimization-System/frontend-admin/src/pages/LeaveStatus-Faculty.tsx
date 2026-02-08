import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import axios from 'axios';
import { toast } from 'sonner';

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  appliedDate: string;
}

const LeaveStatus = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/leaves/faculty/1', { timeout: 5000 });
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await axios.delete(`http://localhost:8083/api/leaves/${id}`);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const takenCount = leaves.filter(l => l.status === 'Approved').length;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200">
          <h2 className="text-xl font-bold">Leave Management</h2>
          <button
            onClick={onApplyLeave}
            className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
          >
            Apply Leave
          </button>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BalanceCard title="Total Leave Balance" value="14" sub="Available for 2024" icon="account_balance_wallet" />
            <BalanceCard title="Leaves Taken" value={takenCount.toString().padStart(2, '0')} sub="Confirmed history" icon="event_busy" />
            <BalanceCard title="Pending Requests" value={pendingCount.toString().padStart(2, '0')} sub="Awaiting approval" icon="pending_actions" color="border-amber-400" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h4 className="text-xl font-bold mb-6">Leave History</h4>
            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading history...</div>
            ) : leaves.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No leave requests found.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase">Leave Type & Duration</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-5">
                        <p className="font-bold text-sm text-slate-800">{leave.leaveType}</p>
                        <p className="text-[10px] text-slate-500">
                          {leave.startDate} to {leave.endDate} • <span className="text-emerald-600">Applied: {leave.appliedDate}</span>
                        </p>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        {leave.status === 'Pending' && (
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="material-symbols-outlined text-slate-300 hover:text-red-500 transition-colors"
                          >
                            delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components for brevity
const BalanceCard = ({ title, value, sub, icon, color = "" }) => (
  <div className={`bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg relative ${color}`}>
    <span className="material-symbols-outlined absolute top-4 right-4 text-6xl opacity-10">{icon}</span>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
    <h3 className="text-4xl font-extrabold mt-1 text-slate-800">{value} <span className="text-sm font-normal text-slate-400">Days</span></h3>
    <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
  </div>
);

export default LeaveStatus;