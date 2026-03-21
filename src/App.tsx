import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Analytics from './components/analytics/Analytics';
import TeamManagement from './components/team/TeamManagement';
import CandidatePipeline from './components/pipeline/CandidatePipeline';
import Screening from './components/candidates/Screening';
import CareerPageSetup from './components/settings/CareerPageSetup';
import SettingsView from './components/settings/SettingsView';

import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Career Modal Component */}
      <CareerPageSetup isOpen={isCareerModalOpen} onClose={() => setIsCareerModalOpen(false)} />

      {/* Main Content Area */}
      <motion.main 
        className="flex-1 transition-all duration-300 p-4 h-full overflow-y-auto flex flex-col ml-[72px]"
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
    </div>
  );
}
