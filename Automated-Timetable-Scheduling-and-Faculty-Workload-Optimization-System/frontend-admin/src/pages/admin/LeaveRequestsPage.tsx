import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { optimizeForLeave } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, ArrowRight } from 'lucide-react';
import { getOptimizationChanges, clearOptimizationChanges, OptimizationChange } from '@/lib/api';

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

interface ReassignmentResult {
    message: string;
    reassigned: Array<{
        day: string;
        timeSlot: string;
        subjectCode: string;
        oldFaculty: string;
        newFaculty: string;
        room: string;
    }>;
}

const StatusBadge = ({ status }: { status: string }) => {
    const cls =
        status === 'Approved' ? 'bg-green-100 text-green-700' :
            status === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700';
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${cls}`}>
            {status}
        </span>
    );
};

const LeaveRequestsPage = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizingId, setOptimizingId] = useState<number | null>(null);
    const [optimizeResult, setOptimizeResult] = useState<ReassignmentResult | null>(null);
    const [optimizationChanges, setOptimizationChanges] = useState<OptimizationChange[]>([]);
    const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8083/api/leaves', { timeout: 5000 });
            // Sort: Pending first
            const sortedData = [...response.data].sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return 0;
            });
            setRequests(sortedData);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const fetchChanges = async () => {
            try {
                const changes = await getOptimizationChanges();
                setOptimizationChanges(changes);
            } catch (err) {
                console.error('Error fetching optimization changes:', err);
            }
        };
        fetchChanges();
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

    const handleOptimize = async (request: LeaveRequest) => {
        setOptimizingId(request.id);
        try {
            toast.info('Optimizing timetable for leave coverage...');
            const result = await optimizeForLeave(request.id);
            setOptimizeResult(result);
            // Refresh optimization history
            const changes = await getOptimizationChanges();
            setOptimizationChanges(changes);
            toast.success(`Timetable optimized! ${result.reassigned?.length || 0} session(s) reassigned.`);
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Failed to optimize timetable.';
            toast.error(msg);
        } finally {
            setOptimizingId(null);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const approvedCount = requests.filter(r => r.status === 'Approved').length;

    return (
        <AdminLayout
            title="Faculty Leave Management"
            subtitle="Review and approve faculty leave applications"
            actions={
                <div className="flex items-center gap-2">
                    {optimizationChanges.length > 0 && (
                        <Button
                            variant="outline"
                            className="gap-2 border-primary/50 text-primary hover:bg-primary/5"
                            onClick={() => setIsChangesModalOpen(true)}
                        >
                            <Users className="h-4 w-4" />
                            View Changes
                        </Button>
                    )}
                </div>
            }
        >
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Pending</p>
                        <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    <div>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Approved</p>
                        <p className="text-2xl font-black text-green-700">{approvedCount}</p>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                    <div>
                        <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Rejected</p>
                        <p className="text-2xl font-black text-red-700">{requests.filter(r => r.status === 'Rejected').length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">All Leave Requests</h3>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        {pendingCount} Pending
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
                                            <p className="text-[10px] text-slate-500">{request.startDate} → {request.endDate}</p>
                                        </td>
                                        <td className="px-6 py-5 max-w-xs">
                                            <p className="text-xs text-slate-600 line-clamp-2 italic">"{request.reason}"</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end items-center gap-2 flex-wrap">
                                                {request.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(request.id, 'Approved')}
                                                            className="px-3 py-1.5 bg-[#16a34a] text-white text-[10px] font-bold rounded-lg hover:bg-[#15803d] shadow-sm transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                                                            className="px-3 py-1.5 bg-[#dc2626] text-white text-[10px] font-bold rounded-lg hover:bg-[#b91c1c] shadow-sm transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'Approved' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOptimize(request)}
                                                        disabled={optimizingId === request.id}
                                                        className="gap-1.5 bg-[#0F1B2D] hover:bg-[#1B2A41] text-white text-[10px] h-8 px-3"
                                                    >
                                                        {optimizingId === request.id ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-3 w-3" />
                                                        )}
                                                        {optimizingId === request.id ? 'Optimizing...' : 'Optimize Timetable'}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Optimization Result Dialog */}
            <Dialog open={!!optimizeResult} onOpenChange={() => setOptimizeResult(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Timetable Optimized
                        </DialogTitle>
                        <DialogDescription>
                            {optimizeResult?.message}
                        </DialogDescription>
                    </DialogHeader>
                    {optimizeResult?.reassigned && optimizeResult.reassigned.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border mt-2">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Day</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Time</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Subject</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Was</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Now</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {optimizeResult.reassigned.map((r, i) => (
                                        <tr key={i} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{r.day}</td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">{r.timeSlot}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-primary text-xs">{r.subjectCode}</td>
                                            <td className="px-4 py-3 text-red-600 text-xs line-through">{r.oldFaculty}</td>
                                            <td className="px-4 py-3 text-green-600 text-xs font-bold">{r.newFaculty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-muted-foreground text-sm">
                            No sessions needed reassignment during the leave period.
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setOptimizeResult(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Optimization Changes Modal */}
            <Dialog open={isChangesModalOpen} onOpenChange={setIsChangesModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Optimization Changes
                                </DialogTitle>
                                <DialogDescription>
                                    Review faculty reassignments made during timetable optimization.
                                </DialogDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={async () => {
                                    if (confirm("Clear all optimization history?")) {
                                        await clearOptimizationChanges();
                                        setOptimizationChanges([]);
                                        setIsChangesModalOpen(false);
                                    }
                                }}
                            >
                                Clear History
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Section</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Day/Time</TableHead>
                                    <TableHead>Previous Faculty</TableHead>
                                    <TableHead className="text-primary font-bold">New Faculty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {optimizationChanges.map((change) => (
                                    <TableRow key={change.id}>
                                        <TableCell className="font-medium">{change.sectionId}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{change.subjectCode}</span>
                                                <span className="text-xs text-muted-foreground">{change.subjectName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm capitalize">{change.day.toLowerCase()}</span>
                                                <span className="text-xs text-muted-foreground">{change.timeSlot}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground line-through decoration-destructive/30">
                                            {change.previousFaculty}
                                        </TableCell>
                                        <TableCell className="text-primary font-bold">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                {change.newFaculty}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {optimizationChanges.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No optimization changes recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default LeaveRequestsPage;
