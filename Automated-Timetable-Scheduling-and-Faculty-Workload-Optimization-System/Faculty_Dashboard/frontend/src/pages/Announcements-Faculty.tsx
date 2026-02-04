import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import axios from 'axios';

interface Announcement {
  id: number;
  title: string;
  description: string;
  tag: string;
  tagClass: string;
  createdAt: string;
}

const Announcements = ({ onApplyLeave }: { onApplyLeave: () => void }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/announcements', { timeout: 5000 });
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Fallback data if backend is empty
  const displayData = announcements.length > 0 ? announcements : [
    {
      id: 1,
      tag: "Urgent",
      tagClass: "bg-red-100 text-red-800",
      createdAt: "2024-10-24T10:00:00",
      title: "Emergency Server Maintenance & Portal Downtime",
      description: "Please be advised that the academic portal will be inaccessible this Sunday for critical security patches."
    },
    {
      id: 2,
      tag: "Holiday",
      tagClass: "bg-green-100 text-green-700",
      createdAt: "2024-10-22T09:00:00",
      title: "Upcoming Mid-Semester Break Schedule",
      description: "The institution will remain closed from November 1st to November 5th for the mid-semester break."
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Institutional Announcements</h2>
            <p className="text-xs text-slate-500 font-medium">Updates, notices, and scheduling changes</p>
          </div>
          <button
            onClick={onApplyLeave}
            className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span> Apply Leave
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Latest Updates</span>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading announcements...</div>
            ) : (
              displayData.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-all">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${item.tagClass}`}>{item.tag}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_month</span> {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="md:border-l border-slate-100 md:pl-6 flex items-center">
                      <button className="px-6 py-3 bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Announcements;