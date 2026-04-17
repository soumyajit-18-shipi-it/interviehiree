import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Award, ExternalLink, MoreVertical, Trash2, Video } from 'lucide-react';
import { clsx } from 'clsx';
import {
  createInterview,
  createResumeAnalysis,
  deleteApplication,
  deleteCandidate,
  ensureOrganizationId,
  getApplication,
  getCandidate,
  listApplications,
  listCandidates,
  updateApplication,
  updateCandidate,
} from '../../lib/api';
import { useToast } from '../ui/Toast';

type ScreeningCandidate = {
  id: string;
  applicationId: string;
  candidateId: string | null;
  hasResumeAnalysis: boolean;
  name: string;
  email: string;
  status: string;
  score: number;
  source: string;
  schedule: string;
};

function formatStageLabel(stage: string) {
  const normalized = stage.toLowerCase();

  if (normalized.includes('qualified') || normalized.includes('offer') || normalized.includes('selected')) {
    return 'Qualified';
  }
  if (normalized.includes('functional') || normalized.includes('interview')) {
    return 'Functional Interview';
  }
  if (normalized.includes('screen')) {
    return 'Recruiter Screening';
  }
  if (normalized.includes('resume')) {
    return 'Resume Analysis';
  }

  return 'Resume Analysis';
}

function formatSourceLabel(source: string) {
  return source
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Screening() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<ScreeningCandidate[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [sendingLinkFor, setSendingLinkFor] = useState<string | null>(null);
  const [updatingStageFor, setUpdatingStageFor] = useState<string | null>(null);
  const [analyzingFor, setAnalyzingFor] = useState<string | null>(null);
  const [deletingApplicationFor, setDeletingApplicationFor] = useState<string | null>(null);
  const [deletingCandidateFor, setDeletingCandidateFor] = useState<string | null>(null);
  const [loadingDetailsFor, setLoadingDetailsFor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scoreRange, setScoreRange] = useState(70);
  const [statusFilter, setStatusFilter] = useState('All');

  const loadCandidates = useCallback(async (explicitOrganizationId?: string) => {
    try {
      const orgId = await ensureOrganizationId(explicitOrganizationId || organizationId || undefined);
      setOrganizationId(orgId);

      const [applications, candidatesResponse] = await Promise.all([
        listApplications({ organization: orgId, page_size: 100 }),
        listCandidates({ organization: orgId, page_size: 200 }),
      ]);

      const candidateById = new Map(candidatesResponse.results.map((candidate) => [candidate.id, candidate]));

      const mapped = applications.results.map((application) => {
        const candidate = candidateById.get(application.candidate);
        const interview =
          application.interviews?.find((item) => item.interview_type.toLowerCase().includes('recruiter')) ??
          application.interviews?.[0];

        return {
          id: application.id,
          applicationId: application.id,
          candidateId: candidate?.id ?? null,
          hasResumeAnalysis: Boolean(application.resume_analysis),
          name: candidate?.full_name ?? application.candidate_name ?? 'Unknown Candidate',
          email: candidate?.email ?? 'Candidate email unavailable',
          status: formatStageLabel(application.current_stage),
          score: application.resume_analysis?.score ?? 0,
          source: formatSourceLabel(application.source || 'direct_link'),
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
  }, [organizationId, toast]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

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
            <option value="Resume Analysis">Resume Analysis</option>
            <option value="Recruiter Screening">Recruiter Screening</option>
            <option value="Functional Interview">Functional Interview</option>
            <option value="Qualified">Qualified</option>
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
                      c.status === 'Qualified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      c.status === 'Functional Interview' ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                      c.status === 'Recruiter Screening' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          if (!organizationId || sendingLinkFor) {
                            return;
                          }

                          setSendingLinkFor(c.applicationId);
                          try {
                            const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                            await createInterview({
                              application: c.applicationId,
                              interview_type: 'recruiter_screening',
                              scheduled_for: scheduledFor,
                              status: 'scheduled',
                              link: `https://meet.interviehire.local/recruiter-screening/${c.applicationId}`,
                              notes: 'Scheduled from recruiter screening dashboard.',
                            });

                            await updateApplication(c.applicationId, {
                              current_stage: 'recruiter_screening',
                              notes: 'Recruiter screening interview scheduled from dashboard.',
                            });

                            toast(`Interview link created for ${c.name}.`, 'success');
                            await loadCandidates(organizationId);
                          } catch (error) {
                            console.error(error);
                            toast(`Unable to create interview link for ${c.name}.`, 'error');
                          } finally {
                            setSendingLinkFor(null);
                          }
                        }}
                        disabled={sendingLinkFor === c.applicationId}
                        className="px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-lg text-xs font-medium text-violet-400 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        <span>{sendingLinkFor === c.applicationId ? 'Sending...' : 'Send Link'}</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (updatingStageFor) {
                            return;
                          }

                          setUpdatingStageFor(c.applicationId);
                          try {
                            await updateApplication(c.applicationId, {
                              current_stage: 'functional_interview',
                              notes: 'Advanced to functional interview from recruiter screening dashboard.',
                            });
                            toast(`${c.name} moved to Functional Interview.`, 'success');
                            await loadCandidates(organizationId);
                          } catch (error) {
                            console.error(error);
                            toast(`Unable to move ${c.name} to Functional Interview.`, 'error');
                          } finally {
                            setUpdatingStageFor(null);
                          }
                        }}
                        disabled={updatingStageFor === c.applicationId}
                        className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {updatingStageFor === c.applicationId ? 'Moving...' : 'Move Stage'}
                      </button>

                      {!c.hasResumeAnalysis ? (
                        <button
                          onClick={async () => {
                            if (analyzingFor) {
                              return;
                            }

                            setAnalyzingFor(c.applicationId);
                            try {
                              const score = Math.max(75, c.score || 0);
                              await createResumeAnalysis({
                                application: c.applicationId,
                                score,
                                summary: `Auto-generated screening analysis for ${c.name}.`,
                                shortlisted: score >= 80,
                                waitlisted: score < 80,
                              });
                              toast(`Resume analysis created for ${c.name}.`, 'success');
                              await loadCandidates(organizationId);
                            } catch (error) {
                              console.error(error);
                              toast(`Unable to create resume analysis for ${c.name}.`, 'error');
                            } finally {
                              setAnalyzingFor(null);
                            }
                          }}
                          disabled={analyzingFor === c.applicationId}
                          className="px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-600 hover:text-white transition-all"
                        >
                          {analyzingFor === c.applicationId ? 'Analyzing...' : 'Analyze'}
                        </button>
                      ) : null}

                      <button
                        onClick={async () => {
                          if (!c.candidateId || loadingDetailsFor) {
                            return;
                          }

                          setLoadingDetailsFor(c.applicationId);
                          try {
                            const [application, candidate] = await Promise.all([
                              getApplication(c.applicationId),
                              getCandidate(c.candidateId),
                            ]);

                            if (!candidate.current_title?.trim()) {
                              await updateCandidate(candidate.id, { current_title: 'Candidate' });
                            }

                            toast(
                              `Loaded ${candidate.full_name}. Stage: ${formatStageLabel(application.current_stage)}.`,
                              'success'
                            );
                          } catch (error) {
                            console.error(error);
                            toast(`Unable to load profile details for ${c.name}.`, 'error');
                          } finally {
                            setLoadingDetailsFor(null);
                          }
                        }}
                        disabled={!c.candidateId || loadingDetailsFor === c.applicationId}
                        className="p-1 hover:bg-zinc-800/20 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </button>

                      <button
                        onClick={async () => {
                          if (deletingApplicationFor) {
                            return;
                          }

                          setDeletingApplicationFor(c.applicationId);
                          try {
                            await deleteApplication(c.applicationId);
                            toast(`Application removed for ${c.name}.`, 'success');
                            await loadCandidates(organizationId);
                          } catch (error) {
                            console.error(error);
                            toast(`Unable to remove application for ${c.name}.`, 'error');
                          } finally {
                            setDeletingApplicationFor(null);
                          }
                        }}
                        disabled={deletingApplicationFor === c.applicationId}
                        className="p-1 hover:bg-zinc-800/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={async () => {
                          if (!c.candidateId || deletingCandidateFor) {
                            return;
                          }

                          setDeletingCandidateFor(c.applicationId);
                          try {
                            await deleteCandidate(c.candidateId);
                            toast(`Candidate record deleted for ${c.name}.`, 'success');
                            await loadCandidates(organizationId);
                          } catch (error) {
                            console.error(error);
                            toast(`Unable to delete candidate record for ${c.name}.`, 'error');
                          } finally {
                            setDeletingCandidateFor(null);
                          }
                        }}
                        disabled={!c.candidateId || deletingCandidateFor === c.applicationId}
                        className="p-1 hover:bg-zinc-800/20 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                        title="Delete Candidate"
                      >
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
