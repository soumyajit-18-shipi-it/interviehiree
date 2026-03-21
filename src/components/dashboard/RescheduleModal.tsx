import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight } from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export default function RescheduleModal({ isOpen, onClose, candidateName = 'Candidate' }: RescheduleModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Reschedule Interview</h2>
            <button onClick={onClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm font-medium text-muted-foreground">
              Rescheduling interview for <strong className="text-foreground">{candidateName}</strong>
            </p>

            {/* Previous Schedule */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 flex gap-6 text-muted-foreground opacity-80">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">Previous Date</span>
                <span className="text-sm font-semibold opacity-80 flex items-center gap-1.5"><Calendar size={14} /> Oct 12, 2023</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">Previous Time</span>
                <span className="text-sm font-semibold opacity-80 flex items-center gap-1.5"><Clock size={14} /> 10:00 AM PST</span>
              </div>
            </div>

            <div className="flex justify-center text-border translate-y-[-12px]">
              <ArrowRight size={20} className="rotate-90" />
            </div>

            {/* New Schedule */}
            <div className="space-y-4 translate-y-[-12px]">
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">New Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="date" className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">New Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <select className="px-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary shadow-sm">
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                    <option>01</option>
                    <option>02</option>
                  </select>
                  <select className="px-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary shadow-sm">
                    <option>00</option>
                    <option>15</option>
                    <option>30</option>
                    <option>45</option>
                  </select>
                  <select className="px-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary shadow-sm">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Reason (Optional)</label>
                <textarea 
                  placeholder="Need to move meeting due to conflict..." 
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary shadow-sm resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 bg-transparent border-0 text-muted-foreground rounded-xl text-sm font-bold hover:text-foreground transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Confirm Reschedule
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
