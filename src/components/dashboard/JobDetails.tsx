import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ChevronRight, 
  Info, 
  Plus, 
  Sparkles,
  CheckCircle,
  Star,
  PlayCircle,
  X,
  Download,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import CandidateFunnel from './CandidateFunnel';
import FunnelInsights from './FunnelInsights';
import CandidateSidePanel from './CandidateSidePanel';
import ScoreDistributionChart from './ScoreDistributionChart';
import { useToast } from '../ui/Toast';
import { loadJobDetailView, type FunctionalCandidate, type FunnelSource, type FunnelStage, type Insight, type JobLike, type OverviewMetrics, type ResumeCriteria, type ScoreBucket, type ScreeningCandidate } from './jobDetailsData';

interface JobDetailsProps {
  job: JobLike;
  onBack: () => void;
  initialTab?: string;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'resume', label: 'Resume Analysis' },
  { id: 'screening', label: 'Recruiter Screening' },
  { id: 'functional', label: 'Functional Interview' }
] as const;

export default function JobDetails({ job, onBack, initialTab = 'Overview' }: JobDetailsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(
    initialTab.toLowerCase().includes('resume') ? 'resume' : 
    (initialTab.toLowerCase().includes('functional') ? 'functional' :
    (initialTab.toLowerCase().includes('screening') ? 'screening' : 'overview'))
  );
  const [selectedCandidate, setSelectedCandidate] = useState<ScreeningCandidate | FunctionalCandidate | null>(null);
  const [detailView, setDetailView] = useState<Awaited<ReturnType<typeof loadJobDetailView>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const view = await loadJobDetailView(job);
        if (!cancelled) {
          setDetailView(view);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast('Unable to load job detail data from API.', 'error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [job, toast]);

  const viewJob = detailView?.job ?? job;
  const funnelStages = detailView?.funnelStages ?? [];
  const funnelSources = detailView?.funnelSources ?? [];
  const insights = detailView?.insights ?? [];
  const scoreDistribution = detailView?.scoreDistribution ?? [];
  const overview = detailView?.overview;
  const resumeCriteria = detailView?.resumeCriteria;
  const screeningCandidates = detailView?.screeningCandidates ?? [];
  const functionalCandidates = detailView?.functionalCandidates ?? [];

  const statusLabel = useMemo(() => {
    const normalized = (viewJob.status || '').toLowerCase();
    if (normalized === 'published' || normalized === 'active') {
      return 'PUBLISHED';
    }
    if (normalized === 'archived') {
      return 'ARCHIVED';
    }
    return 'DRAFT';
  }, [viewJob.status]);

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-3xl overflow-hidden -m-8">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Jobs</span>
            <ChevronRight size={14} className="text-slate-200" />
            <span className="font-semibold text-slate-900">{viewJob.title}</span>
            <span className={clsx(
              'px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-2 border',
              statusLabel === 'PUBLISHED'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : statusLabel === 'ARCHIVED'
                  ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            )}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-1.5 border border-indigo-500/10 bg-indigo-50/50 text-indigo-500 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all">
             <Plus size={14} />
             Add Collaborator
          </button>
          <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            View Responses
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "py-4 text-xs font-bold transition-all relative",
                activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <JobOverviewContent
                  job={viewJob}
                  overview={overview}
                  funnelStages={funnelStages}
                  funnelSources={funnelSources}
                  insights={insights}
                  scoreDistribution={scoreDistribution}
                />
              )}
              {activeTab === 'resume' && <ResumeAnalysisContent job={viewJob} criteria={resumeCriteria} />}
              {activeTab === 'screening' && <ScreeningContent candidates={screeningCandidates} onCandidateClick={setSelectedCandidate} />}
              {activeTab === 'functional' && <FunctionalInterviewContent candidates={functionalCandidates} onCandidateClick={setSelectedCandidate} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {selectedCandidate && (
        <CandidateSidePanel 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
        />
      )}
    </div>
  );
}

function EditJDModal({ job, onClose }: { job: any; onClose: () => void }) {
  const [title, setTitle] = useState(job.title);
  const [location, setLocation] = useState('Delhi, India');
  const [type, setType] = useState('Full Time');
  const [overview, setOverview] = useState('We are seeking a talented individual to join our growing team. You will be responsible for end-to-end delivery of the assigned role.');
  const [mustHave, setMustHave] = useState('5+ years Product Design experience\nProficiency in Figma & Framer\nExperience with Design Systems');
  const [goodToHave, setGoodToHave] = useState('React/Frontend knowledge\nAgency background');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-card rounded-3xl w-full max-w-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Job Description</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Job Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Employment Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary">
              {['Full Time','Part Time','Contract','Internship'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Job Overview</label>
            <textarea rows={3} value={overview} onChange={e => setOverview(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Must Haves (one per line)</label>
            <textarea rows={4} value={mustHave} onChange={e => setMustHave(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Good to Have (one per line)</label>
            <textarea rows={3} value={goodToHave} onChange={e => setGoodToHave(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary resize-none" />
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/10 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors">Cancel</button>
          <button onClick={handleSave} className={clsx(
            'px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved ? 'bg-success text-white' : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
          )}>{saved ? '✓ Saved!' : 'Save Changes'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function JobOverviewContent({
  job,
  overview,
  funnelStages,
  funnelSources,
  insights,
  scoreDistribution,
}: {
  job: JobLike;
  overview?: OverviewMetrics;
  funnelStages: FunnelStage[];
  funnelSources: FunnelSource[];
  insights: Insight[];
  scoreDistribution: ScoreBucket[];
}) {
  const [isEditJDOpen, setIsEditJDOpen] = useState(false);
  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isEditJDOpen && <EditJDModal job={job} onClose={() => setIsEditJDOpen(false)} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Funnel View */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Candidate Funnel</h2>
              <p className="text-slate-500 text-xs mt-1">Real-time conversion across all stages</p>
            </div>
            <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
               <span className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-md text-[10px] font-bold text-slate-900">Weekly View</span>
               <span className="px-3 py-1 text-[10px] font-bold text-slate-400">Monthly</span>
            </div>
          </div>
          <CandidateFunnel stages={funnelStages} sources={funnelSources} />
        </div>

        {/* AI Insights & Stats */}
        <div className="space-y-6">
          <FunnelInsights insights={insights} />
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
               <Sparkles size={48} className="text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Hiring Velocity</h3>
            <div className="space-y-4">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900">{overview?.velocityDays.toFixed(1) ?? '0.0'}</span>
                <span className="text-slate-400 text-xs mb-1">days / stage</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(20, (overview?.velocityDays ?? 0) * 15))}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                <span className="text-success font-bold">{overview?.velocityDeltaLabel ?? 'Pipeline metrics are loading.'}</span>
              </p>
            </div>
          </div>
          <ScoreDistributionChart data={scoreDistribution} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900">Role Requirements</h3>
          <button
            onClick={() => setIsEditJDOpen(true)}
            className="text-primary text-xs font-bold hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            ✏ Edit JD
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600">
           <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Must Haves</h4>
              <ul className="space-y-2">
                {(overview?.requirements ?? [
                  'Job description will populate once the API returns live role details.',
                ]).map((requirement) => (
                  <li key={requirement} className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> {requirement}</li>
                ))}
              </ul>
           </div>
           <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Job Summary</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-300 rounded-full" /> {overview?.descriptionSummary || job.description || 'Description is loading.'}</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-300 rounded-full" /> {job.location || 'Location not set'}</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function ResumeAnalysisContent({ job, criteria }: { job: JobLike; criteria?: ResumeCriteria }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 min-h-full">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Resume Analysis</h2>
        <Info size={18} className="text-slate-400" />
        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[11px] font-medium border border-slate-100 ml-2">
          AI screens applications and shortlists the best-fit candidates for {job.title}
        </span>
      </div>

      <div className="space-y-6">
        <CriteriaGroup 
          title="Must Have" 
          subtitle="Live criteria derived from the current job description"
          icon={CheckCircle}
          color="emerald"
          items={criteria?.mustHave ?? ['Criteria will appear once the job description loads.']}
        />
        
        <div className="flex justify-center py-2 opacity-50">
          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">AND</span>
        </div>

        <CriteriaGroup 
          title="Should Not Have (Red Flags)" 
          subtitle="Signals that often indicate the candidate is not a fit"
          icon={Star}
          color="rose"
          items={criteria?.redFlags ?? ['Red flags will appear once the job description loads.']}
        />

        <CriteriaGroup 
          title="Good to Have" 
          subtitle="Signals that improve candidate fit but are not required"
          icon={Sparkles}
          color="indigo"
          items={criteria?.goodToHave ?? ['Optional criteria will appear once the job description loads.']}
        />
      </div>
    </div>
  );
}

function CriteriaGroup({ title, subtitle, icon: Icon, color, items }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };

  const itemBgs: Record<string, string> = {
    emerald: "bg-emerald-500/5 border-emerald-500/10",
    rose: "bg-rose-500/5 border-rose-500/10",
    indigo: "bg-indigo-500/5 border-indigo-500/10",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className={clsx("p-2.5 rounded-xl border-2 shrink-0", colors[color])}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className={clsx("font-bold text-sm mb-1", color === 'rose' ? 'text-rose-500' : (color === 'indigo' ? 'text-indigo-500' : 'text-slate-900'))}>
            {title}
          </h4>
          <p className="text-[11px] font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2 pl-14">
        {items.map((item: string, i: number) => (
          <div key={i} className={clsx("p-3 px-4 rounded-xl border flex items-center gap-3", itemBgs[color])}>
            <span className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-emerald-600 shrink-0">
              {i + 1}
            </span>
            <p className="text-xs font-semibold text-slate-700 opacity-80">{item}</p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="h-1 bg-slate-100 rounded-full w-full opacity-30 mt-4" />
        )}
      </div>
    </div>
  );
}

import { Mail } from 'lucide-react';

function ScreeningContent({
  candidates,
  onCandidateClick,
}: {
  candidates: ScreeningCandidate[];
  onCandidateClick?: (candidate: ScreeningCandidate) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchScore = scoreFilter === 'All' || (scoreFilter === '> 80' ? c.score > 80 : c.score > 60);
    return matchSearch && matchStatus && matchScore;
  });

  const handleExport = () => {
    const csv = ['Name,Email,Status,Score', ...filtered.map(c => `${c.name},${c.email},${c.status},${c.score}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'screening_candidates.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-8 min-h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recruiter Screening</h2>
        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[11px] font-medium border border-border ml-2">
          {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-56 focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all">
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>
        <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}
          className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all">
          <option value="All">All Scores</option>
          <option value="> 80">&gt; 80</option>
          <option value="> 60">&gt; 60</option>
        </select>
        <button onClick={handleExport}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold ml-auto hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold text-muted-foreground">Candidate Info</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Screening</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Insight</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Score</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">No candidates match your filters.</td></tr>
            ) : filtered.map(candidate => (
              <tr key={candidate.id} className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => onCandidateClick?.(candidate)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{candidate.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('px-2.5 py-1 rounded-full text-xs font-bold border', candidate.status === 'Completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20')}>{candidate.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {candidate.screening.map((s, i) => (<span key={i} className="px-2 py-1 bg-muted rounded-md border border-border text-xs text-muted-foreground"><span className="font-bold">{s.label}:</span> {s.value}</span>))}
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-xs text-muted-foreground italic">{candidate.insight}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={clsx('font-black text-lg', candidate.score >= 80 ? 'text-success' : 'text-warning')}>{candidate.score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={e => e.stopPropagation()} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><Mail size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function FunctionalInterviewContent({
  candidates,
  onCandidateClick,
}: {
  candidates: FunctionalCandidate[];
  onCandidateClick?: (candidate: FunctionalCandidate) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expertiseFilter, setExpertiseFilter] = useState('All');

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchExpertise = expertiseFilter === 'All' || c.domainExpertise === expertiseFilter;
    return matchSearch && matchStatus && matchExpertise;
  });

  const handleExport = () => {
    const csv = ['Name,Email,Status,Domain Expertise,Tech Score,Notes',
      ...filtered.map(c => `${c.name},${c.email},${c.status},${c.domainExpertise},${c.techScore ?? 'N/A'},"${c.notes}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'functional_interview_candidates.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-8 min-h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Functional Interview</h2>
        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[11px] font-medium border border-border ml-2">
          {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-56 focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all">
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Scheduled">Scheduled</option>
        </select>
        <select value={expertiseFilter} onChange={e => setExpertiseFilter(e.target.value)}
          className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all">
          <option value="All">All Expertise</option>
          <option value="Advanced">Advanced</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Pending">Pending</option>
        </select>
        <button onClick={handleExport}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold ml-auto hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold text-muted-foreground">Candidate Info</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Domain Expertise</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Technical Score</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Evaluator Notes</th>
              <th className="px-6 py-4 font-bold text-muted-foreground text-center">Playback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">No candidates match your filters.</td></tr>
            ) : filtered.map(candidate => (
              <tr key={candidate.id} className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => onCandidateClick?.(candidate)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{candidate.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('px-2.5 py-1 rounded-full text-xs font-bold border', candidate.status === 'Completed' ? 'bg-success/10 text-success border-success/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20')}>{candidate.status}</span>
                </td>
                <td className="px-6 py-4"><span className="font-semibold text-foreground">{candidate.domainExpertise}</span></td>
                <td className="px-6 py-4">
                  {candidate.techScore !== null ? (
                    <div className="flex items-center gap-2">
                      <span className={clsx('font-black text-lg', candidate.techScore >= 80 ? 'text-success' : 'text-warning')}>{candidate.techScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  ) : <span className="text-muted-foreground text-xs italic">Pending</span>}
                </td>
                <td className="px-6 py-4"><span className="text-xs text-muted-foreground italic truncate max-w-[200px] block">{candidate.notes}</span></td>
                <td className="px-6 py-4 text-center">
                  <button onClick={e => e.stopPropagation()} className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors mx-auto block disabled:opacity-40" disabled={candidate.status !== 'Completed'}>
                    <PlayCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

