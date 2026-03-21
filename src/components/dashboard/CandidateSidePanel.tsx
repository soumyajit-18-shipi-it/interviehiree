import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import RescheduleModal from './RescheduleModal';

export default function CandidateSidePanel({ candidate, onClose }: any) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const tabs = ['Profile', 'Resume Match', 'Screening', 'Interview Summary', 'Emails'];

  if (!candidate) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end"
      >
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-[600px] h-full bg-card border-l border-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/20">
                {candidate?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {candidate.name}
                  <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    85/100
                  </span>
                </h2>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Mail size={14} /> {candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> +1 234 567 890</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button onClick={onClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
                <X size={18} />
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors" title="Download Resume">
                  <Download size={16} />
                </button>
                <button className="p-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors" title="LinkedIn Profile">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-border flex items-center gap-6 bg-card sticky top-0">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx("py-4 text-sm font-bold transition-colors relative", activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="sidePanelTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {activeTab === 'Profile' && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Experienced professional with a strong background in their field. Displays excellent communication skills and a solid track record of successful project deliveries. Looking to relocate and available to start within 30 days.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Experience</span>
                    <span className="text-sm font-bold text-foreground">4 Years</span>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Location</span>
                    <span className="text-sm font-bold text-foreground">New York, NY</span>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Notice Period</span>
                    <span className="text-sm font-bold text-foreground">30 Days</span>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Expected CTC</span>
                    <span className="text-sm font-bold text-foreground">$120,000</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab !== 'Profile' && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <CheckCircle size={48} className="mb-4" />
                <p className="font-bold">Content for {activeTab}</p>
              </div>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-card flex items-center justify-between">
            <button className="px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-colors">
              Reject
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsRescheduleOpen(true)}
                className="px-5 py-2.5 border border-primary/20 bg-primary/5 text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
              >
                Reschedule
              </button>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Move to Next Round
              </button>
            </div>
          </div>

        </motion.div>
      </motion.div>
      <RescheduleModal 
        isOpen={isRescheduleOpen} 
        onClose={() => setIsRescheduleOpen(false)} 
        candidateName={candidate.name} 
      />
    </AnimatePresence>
  );
}
