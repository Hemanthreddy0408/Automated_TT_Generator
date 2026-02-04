import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

const Header = ({ title, subtitle, actions }: HeaderProps) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  );
};

export default Header;