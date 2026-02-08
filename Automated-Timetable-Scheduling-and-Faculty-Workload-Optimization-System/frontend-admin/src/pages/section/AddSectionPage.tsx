import React, { useState, useEffect } from 'react';
import {
    Info,
    UserSquare2,
    Settings2,
    Lightbulb,

    CheckCircle2,
    AlertCircle,
    Archive // Added Archive icon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import { toast } from 'sonner';
import { createSection, getSection, updateSection, getFaculty, FacultyPayload } from '@/lib/api'; // Added getSection, updateSection
import { AdminLayout } from '@/components/layout/AdminLayout';

const AddSectionPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState<FacultyPayload[]>([]);

    const { id } = useParams(); // Get ID from URL
    const isEditing = Boolean(id);

    // Form State
    const [name, setName] = useState("");
    const [batch, setBatch] = useState("1"); // Default to Year 1
    const [department, setDepartment] = useState("");
    const [mentorId, setMentorId] = useState("");
    const [totalStudents, setTotalStudents] = useState("");
    const [capacity, setCapacity] = useState("");


    // Dark mode logic (handled globally, but keeping hook for local state if needed)
    useEffect(() => {
        // Fetch initial data
        const fetchData = async () => {
            try {
                const facultyData = await getFaculty();
                setFaculties(facultyData);

                // If editing, fetch existing section data
                if (isEditing && id) {
                    const sectionData = await getSection(id);
                    if (sectionData) {
                        setName(sectionData.name);
                        setDepartment(sectionData.department);
                        setBatch(sectionData.year.toString());
                        setCapacity(sectionData.capacity.toString());
                        if (sectionData.mentorId) setMentorId(sectionData.mentorId.toString());
                        // Note: totalStudents isn't in Section interface strictly, but if it were:
                        // setTotalStudents(sectionData.totalStudents?.toString() || ""); 
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load data");
            }
        };

        fetchData();
    }, [id, isEditing]);

    const handleSubmit = async (status: 'ACTIVE' | 'DRAFT' = 'ACTIVE') => {
        if (!name || !department || !capacity || !batch) {
            toast.error("Please fill in all required fields (Name, Department, Batch, Capacity)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name,
                department,
                year: parseInt(batch),
                capacity: parseInt(capacity),
                mentorId: mentorId ? parseInt(mentorId) : undefined,
                status: status // Add status to payload
            };

            if (isEditing && id) {
                await updateSection(parseInt(id), payload);
                toast.success(status === 'DRAFT' ? "Draft updated successfully!" : "Section updated successfully!");
            } else {
                await createSection(payload);
                toast.success(status === 'DRAFT' ? "Draft saved successfully!" : "Section created successfully!");
            }

            navigate("/admin/sections");
        } catch (error) {
            console.error("Failed to save section:", error);
            toast.error("Failed to save section. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title={isEditing ? "Edit Section" : "Add New Section"}
            subtitle={isEditing ? "Modify existing section details" : "Configure parameters for a new student group"}
        >
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Column */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <Info className="mr-2 text-teal-600 dark:text-teal-500" size={20} />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Section Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., CS-3A"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Academic Batch <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={batch}
                                                onChange={(e) => setBatch(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                                            >
                                                <option value="1">1st Year (Freshman)</option>
                                                <option value="2">2nd Year (Sophomore)</option>
                                                <option value="3">3rd Year (Junior)</option>
                                                <option value="4">4th Year (Senior)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Department <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                                            >
                                                <option value="" disabled>Select Department</option>
                                                <option value="CSE">Computer Science & Engineering (CSE)</option>
                                                <option value="ECE">Electronics & Communication (ECE)</option>
                                                <option value="MECH">Mechanical Engineering (MECH)</option>
                                                <option value="CIVIL">Civil Engineering</option>
                                                <option value="EEE">Electrical & Electronics (EEE)</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <UserSquare2 className="mr-2 text-teal-600 dark:text-teal-500" size={20} />
                                        Administration
                                    </h3>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Mentor</label>
                                    <select
                                        value={mentorId}
                                        onChange={(e) => setMentorId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                                    >
                                        <option value="">Choose Faculty Member</option>
                                        {faculties.map((f) => (
                                            <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                                        ))}
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        The primary coordinator responsible for this section.
                                    </p>
                                </section>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <Settings2 className="mr-2 text-teal-600 dark:text-teal-500" size={20} />
                                        Capacity & Scheduling
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total Students</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 55"
                                                    value={totalStudents}
                                                    onChange={(e) => setTotalStudents(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                    Max Capacity <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 60"
                                                    value={capacity}
                                                    onChange={(e) => setCapacity(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Tip Box */}
                                <div className="p-5 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-xl">
                                    <div className="flex space-x-3">
                                        <Lightbulb className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="text-sm">
                                            <p className="text-teal-800 dark:text-teal-300 font-bold mb-1">Configuration Tip</p>
                                            <p className="text-teal-700 dark:text-teal-400/90 leading-relaxed">
                                                Ensuring student capacity matches the room preference will reduce scheduling conflicts during the automated optimization process.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-4">
                            <button
                                onClick={() => navigate('/admin/sections')}
                                className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Cancel Changes
                            </button>
                            <button
                                onClick={() => handleSubmit('DRAFT')}
                                disabled={loading}
                                className="px-6 py-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors font-medium flex items-center space-x-2"
                            >
                                <Archive size={20} />
                                <span>Save as Draft</span>
                            </button>
                            <button
                                onClick={() => handleSubmit('ACTIVE')}
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all font-bold flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                <span>{isEditing ? "Save Changes" : "Create Section"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex items-center justify-center text-sm text-slate-400 space-x-4">
                    <a className="hover:text-teal-600 transition-colors cursor-pointer">Documentation</a>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <a className="hover:text-teal-600 transition-colors cursor-pointer">Conflict Guidelines</a>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <a className="hover:text-teal-600 transition-colors cursor-pointer">Contact Support</a>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddSectionPage;