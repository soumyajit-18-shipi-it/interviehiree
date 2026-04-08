import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { ensureOrganizationId, listApplications } from '../../lib/api';
import { useToast } from '../ui/Toast';

type PipelineCounts = {
  total: number;
  resume: number;
  screening: number;
  interview: number;
  selected: number;
};

export default function CandidatePipeline() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<PipelineCounts>({
    total: 0,
    resume: 0,
    screening: 0,
    interview: 0,
    selected: 0,
  });

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const organization = await ensureOrganizationId();
        const applications = await listApplications({ organization, page_size: 200 });
        const total = applications.results.length;
        const resume = applications.results.filter((a) => a.current_stage.toLowerCase().includes('resume')).length;
        const screening = applications.results.filter((a) => a.current_stage.toLowerCase().includes('screen')).length;
        const interview = applications.results.filter((a) => a.current_stage.toLowerCase().includes('interview') || a.current_stage.toLowerCase().includes('functional')).length;
        const selected = applications.results.filter((a) => {
          const stage = a.current_stage.toLowerCase();
          return stage.includes('offer') || stage.includes('selected') || stage.includes('qualified');
        }).length;
        setCounts({ total, resume, screening, interview, selected });
      } catch (error) {
        console.error(error);
        toast('Unable to load candidate pipeline.', 'error');
      }
    };

    loadPipeline();
  }, [toast]);

  const funnelStages = useMemo(
    () => [
      { id: 'total', label: 'Total Applicants', count: counts.total, color: 'bg-zinc-500/20' },
      { id: 'resume', label: 'Resume Screened', count: counts.resume, color: 'bg-blue-500/20' },
      { id: 'screening', label: 'Recruiter Screen', count: counts.screening, color: 'bg-amber-500/20' },
      { id: 'interview', label: 'Functional Interview', count: counts.interview, color: 'bg-violet-500/20' },
      { id: 'selected', label: 'Offer Extended', count: counts.selected, color: 'bg-emerald-500/20' },
    ],
    [counts],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Candidate Pipeline</h1>
          <p className="text-[var(--color-text-sub)] text-sm mt-1">Visualize your recruitment funnel and conversion rates.</p>
        </div>
      </div>

      {/* Funnel Visual Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8 bg-[var(--color-secondary)]/20 border border-[var(--color-border)]"
      >
        <h3 className="font-semibold text-lg text-[var(--color-text-title)] mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-violet-400" />
          <span>Conversion Funnel</span>
        </h3>

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 h-[180px]">
          {funnelStages.map((stage, index) => {
            const nextStage = funnelStages[index + 1];
            const conversion = nextStage ? Math.round((nextStage.count / stage.count) * 100) : null;

            return (
              <div key={stage.id} className="flex-1 flex items-center">
                {/* Stage Node */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className={clsx(
                    "flex-1 flex flex-col justify-center items-center rounded-2xl p-4 border border-[var(--color-border)] relative",
                    "hover:border-[var(--color-glass-border)] transition-all duration-300 group cursor-pointer",
                    stage.id === 'selected' ? "bg-emerald-500/5" : "bg-[var(--color-secondary)]/40"
                  )}
                >
                  <span className="text-xs text-[var(--color-text-sub)] group-hover:text-[var(--color-text-title)]">{stage.label}</span>
                  <span className={clsx(
                    "text-3xl font-bold mt-2",
                    stage.id === 'selected' ? "text-emerald-400" : "text-[var(--color-text-title)]"
                  )}>
                    {stage.count}
                  </span>
                </motion.div>

                {/* Connecting Arrow & Conversion */}
                {conversion !== null && (
                  <div className="flex flex-col items-center justify-center px-2">
                    <ArrowRight className="text-[var(--color-text-sub)]" size={20} />
                    <span className="text-[10px] font-bold text-violet-400 mt-1">{conversion}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass rounded-2xl p-6 bg-violet-950/10 border border-violet-500/20 flex flex-col md:flex-row items-start gap-4"
      >
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
          <Sparkles size={24} className="animate-pulse" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--color-text-title)] flex items-center gap-1.5">
            AI Pipeline Insight
          </h4>
          <p className="text-[var(--color-text-sub)] text-sm mt-1">
            We noticed a <span className="text-violet-400 font-medium">17% drop</span> between "Resume Screened" and "Recruiter Screen". 
            Candidates with <span className="text-violet-400 font-medium">+3 years experience</span> are converting 2x faster. 
            We recommend prioritizing the screening backlog.
          </p>
          
          <div className="flex gap-2 mt-4">
            <button className="text-xs px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 hover:bg-violet-600/30 transition-colors">
              Optimize Screening
            </button>
            <button className="text-xs px-3 py-1.5 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-sub)] hover:bg-[var(--color-card-hover)]">
              View Analytics
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
