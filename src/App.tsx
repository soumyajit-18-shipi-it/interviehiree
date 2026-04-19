import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import Dashboard from './components/dashboard/Dashboard';
import Analytics from './components/analytics/Analytics';
import TeamManagement from './components/team/TeamManagement';
import CandidatePipeline from './components/pipeline/CandidatePipeline';
import Screening from './components/candidates/Screening';
import CareerPageSetup from './components/settings/CareerPageSetup';
import SettingsView from './components/settings/SettingsView';

import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, Settings as SettingsIcon, TrendingUp, Globe } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { icon: Briefcase, label: 'Jobs', id: 'jobs' },
  { icon: TrendingUp, label: 'Usage Overview', id: 'analytics' },
  { icon: Users, label: 'Team Access', id: 'team' },
  { icon: Globe, label: 'Career Page', id: 'career' },
  { icon: SettingsIcon, label: 'Settings', id: 'settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'career') {
      setIsCareerModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'team':
        return <TeamManagement />;
      case 'pipeline':
        return <CandidatePipeline />;
      case 'screening':
        return <Screening />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div className="p-8 text-2xl font-bold">Dashboard</div>;
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col md:h-[100dvh] md:flex-row md:overflow-hidden font-sans transition-colors duration-300 bg-background text-foreground">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* Career Modal Component */}
      <CareerPageSetup isOpen={isCareerModalOpen} onClose={() => setIsCareerModalOpen(false)} />

      {/* Mobile Header (mobile only) */}
      <MobileHeader />

      {/* Main Content Area */}
      <motion.main 
        className="flex-1 transition-all duration-300 pt-[calc(4rem+env(safe-area-inset-top))] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 md:h-full overflow-y-auto flex flex-col md:ml-[72px]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full h-full flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden flex fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 justify-between items-center px-1 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] px-1 py-1 transition-all rounded-lg',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                  isActive ? 'bg-primary/10' : 'bg-transparent'
                )}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
              </div>
              <span className={clsx('text-[10px] font-medium leading-none text-center', isActive ? 'text-primary' : '')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
