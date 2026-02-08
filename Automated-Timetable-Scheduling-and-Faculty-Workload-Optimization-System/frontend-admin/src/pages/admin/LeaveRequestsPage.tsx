import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface LeaveRequest {
    id: number;
    facultyId: number;
    facultyName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    appliedDate: string;
}

const LeaveRequestsPage = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8083/api/leaves', { timeout: 5000 });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await axios.patch(`http://localhost:8083/api/leaves/${id}/status?status=${status}`);
            toast.success(`Leave request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} request`);
        }
    };

    const handleGenerateSchedule = async () => {
        try {
            toast.info("Initiating schedule optimization...");
            await axios.post('http://localhost:8083/api/schedule/generate');
            toast.success("Schedule optimization started successfully!");
        } catch (error) {
            console.error("Error generating schedule:", error);
            toast.error("Failed to trigger schedule generation. Backend may be offline.");
        }
    };

    return (
        <AdminLayout
            title="Faculty Leave Management"
            subtitle="Review and approve faculty leave applications"
            actions={
                <Button onClick={handleGenerateSchedule} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Sparkles className="h-4 w-4" />
                    Optimize Timetable
                </Button>
            }
        >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Pending Requests</h3>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        {requests.filter(r => r.status === 'Pending').length} Pending
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No leave requests found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type & Duration</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] font-bold text-xs">
                                                    {request.facultyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{request.facultyName}</p>
                                                    <p className="text-[10px] text-slate-400">Applied: {request.appliedDate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-700">{request.leaveType}</p>
                                            <p className="text-[10px] text-slate-500">{request.startDate} to {request.endDate}</p>
                                        </td>
                                        <td className="px-6 py-5 max-w-xs">
                                            <p className="text-xs text-slate-600 line-clamp-2 italic">"{request.reason}"</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {request.status === 'Pending' && (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleUpdateStatus(request.id, 'Approved')}
                                                        className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                                                        className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default LeaveRequestsPage;
