import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subText: string;
  icon: string;
  trendColor?: string; // Optional: for the border-l-4 accent seen in "Pending Requests"
}

const StatCard = ({ label, value, subText, icon, trendColor }: StatCardProps) => {
  return (
    <div className={`glass-card p-6 rounded-3xl relative overflow-hidden group border-l-4 ${trendColor ? trendColor : 'border-transparent'}`}>
      {/* Decorative Background Icon */}
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
      </div>

      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        {label}
      </p>

      <div className="flex items-end gap-2">
        <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">
          {value}
        </h3>
      </div>

      <p className="text-xs text-slate-400 mt-2 font-medium">
        {subText}
      </p>
    </div>
  );
};

export default StatCard;