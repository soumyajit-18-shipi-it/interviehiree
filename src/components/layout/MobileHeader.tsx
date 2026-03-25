import React from 'react';

export default function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border z-50 h-16 flex items-center px-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
        <span className="text-white font-black text-sm">iH</span>
      </div>

      <div className="ml-3 overflow-hidden">
        <span className="font-black text-[15px] text-foreground whitespace-nowrap tracking-tight">
          intervie<span className="text-primary">Hire</span>
        </span>
      </div>
    </header>
  );
}
