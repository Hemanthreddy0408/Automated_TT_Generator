import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { icon: 'dashboard', label: 'My Dashboard', path: '/faculty/dashboard' },
    { icon: 'event_available', label: 'My Schedule', path: '/faculty/schedule' },
    { icon: 'history_edu', label: 'Leave Status', path: '/faculty/leave' },
    { icon: 'group', label: 'Department', path: '/faculty/department' },
    { icon: 'campaign', label: 'Announcements', path: '/faculty/announcements' },
  ];

  return (
    <aside className="w-64 bg-[#111827] text-white flex flex-shrink-0 flex-col border-r border-slate-800 hidden lg:flex sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#10b981] p-2 rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-white">calendar_today</span>
        </div>
        <h1 className="font-bold text-xl tracking-tight">AcadSchedule</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Portal</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${isActive
                ? 'bg-gradient-to-r from-[#10b981]/20 to-transparent text-[#10b981] border-l-4 border-[#10b981] font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold">SM</div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Dr. Sarah Mitchell</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tight">Associate Professor</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;