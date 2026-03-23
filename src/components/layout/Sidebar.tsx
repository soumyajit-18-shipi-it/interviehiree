import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, Settings, TrendingUp, Globe, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { clsx } from 'clsx';

const menuItems = [
  { icon: Briefcase, label: 'Jobs', id: 'jobs' },
  { icon: TrendingUp, label: 'Usage Overview', id: 'analytics' },
  { icon: Users, label: 'Team Access', id: 'team' },
  { icon: Globe, label: 'Career Page', id: 'career' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => setIsExpanded(false), 200);
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ width: 72 }}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="h-screen fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border z-[100] flex flex-col overflow-hidden shadow-lg shadow-primary/5"
    >
      {/* Logo Header */}
      <div className="flex items-center h-20 px-4 gap-3 border-b border-sidebar-border/50">
        {/* Logo mark — always visible */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
          <span className="text-white font-black text-sm">iH</span>
        </div>

        {/* Brand name — shown when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <span className="font-black text-[15px] text-foreground whitespace-nowrap tracking-tight">
                intervie<span className="text-primary">Hire</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 mt-3 py-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-sm relative',
                isExpanded ? 'justify-start gap-3' : 'justify-center',
                isActive
                  ? 'bg-primary text-white font-semibold shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={19} className="flex-shrink-0" />

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap overflow-hidden flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isExpanded && isActive && (
                <ChevronRight size={13} className="flex-shrink-0 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom watermark */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-4 border-t border-sidebar-border/50"
          >
            <p className="text-[10px] text-muted-foreground font-medium">© 2026 IntervieHire</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
