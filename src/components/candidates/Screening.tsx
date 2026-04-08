import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Award, ExternalLink, MoreVertical, Video } from 'lucide-react';
import { clsx } from 'clsx';
import { ensureOrganizationId, listApplications } from '../../lib/api';
import { useToast } from '../ui/Toast';

type ScreeningCandidate = {
  id: string;
  name: string;
  email: string;
  status: string;
  score: number;
  source: string;
  schedule: string;
};

export default function Screening() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<ScreeningCandidate[]>([]);
  const [search, setSearch] = useState('');
  const [scoreRange, setScoreRange] = useState(70);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const organization = await ensureOrganizationId();
        const applications = await listApplications({ organization, page_size: 100 });
        const mapped = applications.results.map((application) => {
          const interview = application.interviews?.[0];
          return {
            id: application.id,
            name: application.candidate_name ?? 'Unknown Candidate',
            email: 'Candidate email unavailable',
            status: application.current_stage,
            score: application.resume_analysis?.score ?? 0,
            source: application.source,
            schedule: interview?.scheduled_for
              ? new Date(interview.scheduled_for).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'Not Scheduled',
          };
        });
        setCandidates(mapped);
      } catch (error) {
        console.error(error);
        toast('Unable to load screening candidates.', 'error');
      }
    };

    loadCandidates();
  }, [toast]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesScore = c.score >= scoreRange;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesScore && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Recruiter Screening</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and manage candidate screening processes.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all">
          <span>Bulk Actions</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900/40 border border-zinc-800/60 rounded-xl glass focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Score Slider */}
          <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/60 p-2 rounded-xl glass">
            <Award size={16} className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Score ≥ {scoreRange}</span>
            <input 
              type="range" 
              min="0" max="100" step="5"
              value={scoreRange} 
              onChange={(e) => setScoreRange(Number(e.target.value))}
              className="w-24 accent-violet-500 h-1 rounded-full bg-zinc-800"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900/40 border border-zinc-800/60 rounded-xl glass text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Statuses</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/20"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
                <th className="p-4 text-xs font-medium text-zinc-400">CANDIDATE</th>
                <th className="p-4 text-xs font-medium text-zinc-400">SCORE</th>
                <th className="p-4 text-xs font-medium text-zinc-400">SOURCE</th>
                <th className="p-4 text-xs font-medium text-zinc-400">SCHEDULE</th>
                <th className="p-4 text-xs font-medium text-zinc-400">STATUS</th>
                <th className="p-4 text-xs font-medium text-zinc-400"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <motion.tr key={c.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-zinc-200">{c.name}</div>
                      <div className="text-xs text-zinc-500">{c.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                      <span className={clsx(
                        "w-2 h-2 rounded-full",
                        c.score >= 90 ? "bg-emerald-400" : c.score >= 80 ? "bg-amber-400" : "bg-red-400"
                      )} />
                      {c.score}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-zinc-400">{c.source}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar size={14} className="text-zinc-500" />
                      <span className={clsx(c.schedule === 'Reschedule' && "text-amber-400")}>
                        {c.schedule}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      c.status === 'Offer' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      c.status === 'Interview' ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`Interview link sent to ${c.name}!`)}
                        className="px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-lg text-xs font-medium text-violet-400 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        <span>Send Link</span>
                      </button>
                      <button className="p-1 hover:bg-zinc-800/20 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-1 hover:bg-zinc-800/20 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
