import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ShieldCheck, Palette, LayoutTemplate, Eye, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface CareerPageSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CareerPageSetup({ isOpen, onClose }: CareerPageSetupProps) {
  const [activeTab, setActiveTab] = useState('Theme');

  const tabs = [
    { id: 'Theme', icon: Palette },
    { id: 'Content', icon: LayoutTemplate },
    { id: 'Preview', icon: Eye },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="bg-card rounded-3xl w-full max-w-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Career Page Setup</h3>
                  <p className="text-muted-foreground text-xs font-medium mt-0.5">Customize your public-facing AI job board.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
                  <LinkIcon size={14} /> Copy Embed
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                  <ExternalLink size={14} /> View Live
                </button>
                <div className="w-px h-6 bg-border mx-1"></div>
                <button 
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-border bg-card">
              <div className="flex items-center gap-6">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        "flex items-center gap-2 py-4 border-b-2 transition-colors",
                        activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-bold">{tab.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-card/50">
              {activeTab === 'Theme' && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-3xl bg-muted/30 hover:border-primary/40 transition-colors cursor-pointer group">
                    <div className="p-4 bg-background rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Upload Company Logo</span>
                    <span className="text-xs font-medium text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">BRAND COLORS</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 p-2 border border-border rounded-xl bg-background flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary shadow-sm border border-black/10"></div>
                        <input type="text" defaultValue="#6B46FF" className="bg-transparent border-none text-sm font-medium focus:outline-none uppercase w-full" />
                      </div>
                      <button className="px-4 py-3 bg-muted rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Content' && (
                <div className="space-y-5 max-w-lg mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">COMPANY NAME</label>
                    <input
                      type="text"
                      defaultValue="Acme Corporation"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary shadow-sm transition-colors text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">HERO TITLE</label>
                    <input
                      type="text"
                      defaultValue="Join us in building the future."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary shadow-sm transition-colors text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">ABOUT US</label>
                    <textarea
                      rows={4}
                      defaultValue="We are a fast-growing tech startup dedicated to solving hard problems."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary shadow-sm transition-colors text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'Preview' && (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="w-full max-w-sm aspect-[9/16] bg-background border-4 border-border rounded-[2rem] shadow-xl overflow-hidden relative">
                    {/* Fake Mobile Status Bar */}
                    <div className="h-6 bg-background flex items-center justify-between px-4">
                      <span className="text-[10px] font-bold">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-2 bg-foreground rounded-full"></div>
                        <div className="w-1 h-2 bg-foreground rounded-full"></div>
                        <div className="w-1 h-2 bg-foreground rounded-full"></div>
                      </div>
                    </div>
                    {/* Preview Content */}
                    <div className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mx-auto font-black text-2xl">A</div>
                      <h4 className="font-black text-xl leading-tight">Join us in building the future.</h4>
                      <p className="text-xs text-muted-foreground">We are a fast-growing tech startup dedicated to solving hard problems.</p>
                      
                      <div className="mt-8 space-y-3">
                        <div className="w-full h-12 bg-muted rounded-xl"></div>
                        <div className="w-full h-12 bg-muted rounded-xl"></div>
                        <div className="w-full h-12 bg-muted rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
