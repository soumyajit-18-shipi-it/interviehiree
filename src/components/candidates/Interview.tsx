import { motion } from 'framer-motion';
import { Users, Sparkles, ClipboardCheck } from 'lucide-react';

export default function Interview() {
  const mockCandidates = [
    { name: 'Sarah Jenkins', role: 'Product Designer', status: 'In Evaluation', score: '85%' },
    { name: 'Alex Rivera', role: 'Frontend Engineer', status: 'Slightly Behind', score: '72%' },
    { name: 'Michael Chen', role: 'Data Scientist', status: 'Highly Recommended', score: '93%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Functional Interview</h1>
          <p className="text-zinc-400 text-sm mt-1">Track candidates in the final technical evaluation phase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <h3 className="font-semibold text-lg text-zinc-100 mb-2 flex items-center gap-2">
            <Users size={18} className="text-violet-400" />
            <span>Active Candidates</span>
          </h3>

          <div className="space-y-3">
            {mockCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-4 bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="font-medium text-zinc-100 group-hover:text-violet-400 transition-colors">{candidate.name}</h4>
                  <p className="text-zinc-500 text-xs mt-0.5">{candidate.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-zinc-200">{candidate.score}</span>
                    <span className="text-[10px] text-zinc-500">{candidate.status}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50 text-zinc-400 group-hover:text-violet-400 transition-colors">
                    <ClipboardCheck size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info Card / Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 bg-zinc-900/20 border border-zinc-800/60 h-fit space-y-4 relative overflow-hidden group"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-10 bg-gradient-to-r from-violet-500/10 to-transparent blur-2xl opacity-50" />

          <div className="relative z-10">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 w-fit mb-3">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <h3 className="font-semibold text-zinc-100 mb-1">Stage Overview</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Candidates in this phase are undergoing structured technical and functional assessments.
            </p>

            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Total in Interview</span>
                <span className="font-bold text-zinc-200">12</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Wait Time (Avg)</span>
                <span className="font-bold text-zinc-200">2 days</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

