import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Briefcase, X, FileText, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import JobCard from './JobCard';
import JobDetails from './JobDetails';
import JobConfiguration from './JobConfiguration';
import {
  createJob,
  ensureOrganizationId,
  getJobPipeline,
  listJobs,
  type Job as ApiJob,
  type JobPipeline,
} from '../../lib/api';
import { useToast } from '../ui/Toast';

type JobStatus = 'Published' | 'Draft' | 'Archived';

interface Job {
  id: string;
  title: string;
  role: string;
  createdDate: string;
  status: JobStatus;
  createdBy: string;
  stats: { total: number; resume: number; screening: number; interview: number };
}

function mapApiStatus(status: string): JobStatus {
  const normalized = status.toLowerCase();
  if (normalized === 'published' || normalized === 'active') {
    return 'Published';
  }
  if (normalized === 'archived') {
    return 'Archived';
  }
  return 'Draft';
}

function mapPipeline(pipeline?: JobPipeline): Job['stats'] {
  return {
    total: pipeline?.total ?? 0,
    resume: pipeline?.resume_analysis ?? 0,
    screening: pipeline?.recruiter_screening ?? 0,
    interview: pipeline?.functional_interview ?? 0,
  };
}

function mapApiJob(job: ApiJob, pipeline?: JobPipeline): Job {
  return {
    id: job.id,
    title: job.title,
    role: `${job.role} • ${job.location}`,
    createdDate: new Date(job.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: mapApiStatus(job.status),
    createdBy: job.created_by || 'System',
    stats: mapPipeline(pipeline),
  };
}

function NewJobModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    department: string;
    location: string;
    status: JobStatus;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full-time');
  const [status, setStatus] = useState<JobStatus>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['Engineering', 'Design', 'Growth', 'Marketing', 'Sales', 'HR', 'Finance'];
  const locations = ['Remote', 'NYC', 'San Francisco', 'Delhi', 'London', 'Berlin'];
  const types = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        department,
        location,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
        className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Create New Job</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Fill in the details to post a new position.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
              Job Title *
            </label>
            <div className="relative">
              <FileText
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-foreground transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground appearance-none transition-all"
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                <MapPin size={12} className="inline mr-1" />
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground appearance-none transition-all"
              >
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
              <Clock size={12} className="inline mr-1" />
              Employment Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {types.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-xs font-bold border transition-all',
                    type === t
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
              Initial Status
            </label>
            <div className="flex gap-2">
              {(['Draft', 'Published'] as JobStatus[]).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all',
                    status === s
                      ? s === 'Published'
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-muted text-foreground border-border'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              const form = (e.currentTarget.closest('.flex.flex-col') as HTMLElement)?.querySelector('form');
              form?.requestSubmit();
            }}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type FilterStatus = JobStatus | 'All';

export default function Dashboard() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [createdByFilter, setCreatedByFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'config' | 'responses' | null>(null);
  const [initialTab, setInitialTab] = useState<
    'Overview' | 'Resume Analysis' | 'Recruiter Screening' | 'Functional Interview'
  >('Overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  const loadJobs = async () => {
    try {
      const orgId = await ensureOrganizationId(organizationId || undefined);
      setOrganizationId(orgId);

      const jobsResponse = await listJobs({ organization: orgId, page_size: 100 });

      const pipelines = await Promise.all(
        jobsResponse.results.map((job) =>
          getJobPipeline(job.id)
            .then((pipeline) => ({ id: job.id, pipeline }))
            .catch(() => ({ id: job.id, pipeline: undefined }))
        )
      );

      const pipelineByJob = new Map(pipelines.map((item) => [item.id, item.pipeline]));
      setJobs(jobsResponse.results.map((job) => mapApiJob(job, pipelineByJob.get(job.id))));
    } catch (error) {
      console.error(error);
      toast('Failed to load jobs from API.', 'error');
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJobClick = (
    job: Job,
    tab?: 'Overview' | 'Resume Analysis' | 'Recruiter Screening' | 'Functional Interview'
  ) => {
    setIsLoading(true);
    setSelectedJob(job);

    if (tab) {
      setInitialTab(tab);
      setViewMode('responses');
    } else {
      setViewMode('config');
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleAddJob = async (payload: {
    title: string;
    department: string;
    location: string;
    status: JobStatus;
  }) => {
    try {
      const orgId = await ensureOrganizationId(organizationId || undefined);
      setOrganizationId(orgId);

      await createJob({
        organization: orgId,
        title: payload.title,
        role: payload.department,
        business_unit: payload.department,
        description: `${payload.title} role created from dashboard`,
        location: payload.location,
        status: payload.status.toLowerCase(),
      });

      toast('Job created successfully.', 'success');
      await loadJobs();
    } catch (error) {
      console.error(error);
      toast('Unable to create job. Please try again.', 'error');
      throw error;
    }
  };

  const creatorOptions = useMemo(
    () => ['All', ...Array.from(new Set(jobs.map((job) => job.createdBy)))],
    [jobs]
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = activeFilter === 'All' || job.status === activeFilter;
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchesCreator = createdByFilter === 'All' || job.createdBy === createdByFilter;
    return matchesStatus && matchesSearch && matchesCreator;
  });

  const filterTabs: FilterStatus[] = ['All', 'Published', 'Draft', 'Archived'];

  return (
    <>
      <AnimatePresence>
        {isNewJobModalOpen && (
          <NewJobModal
            onClose={() => setIsNewJobModalOpen(false)}
            onCreate={handleAddJob}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedJob ? (
          isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="h-16 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-xl animate-pulse" />
                <div className="h-8 w-24 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-xl animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 h-[300px] bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-3xl animate-pulse" />
                <div className="h-[300px] bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-3xl animate-pulse" />
              </div>
            </motion.div>
          ) : viewMode === 'config' ? (
            <JobConfiguration
              key="config"
              job={selectedJob}
              onBack={() => {
                setSelectedJob(null);
                setViewMode(null);
              }}
              onViewResponses={() => setViewMode('responses')}
            />
          ) : (
            <JobDetails
              key="details"
              job={selectedJob}
              onBack={() => {
                setSelectedJob(null);
                setViewMode(null);
              }}
              initialTab={initialTab}
            />
          )
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  Jobs
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by job name or role name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm text-foreground"
                  />
                </div>
                <button
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  <span>New Job</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                  {filterTabs.map((tab) => {
                    const jobCount =
                      tab === 'All' ? jobs.length : jobs.filter((j) => j.status === tab).length;

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={clsx(
                          'relative px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300',
                          activeFilter === tab
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <span className="relative z-10">
                          {tab} ({jobCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Created by:</label>
                <select
                  value={createdByFilter}
                  onChange={(e) => setCreatedByFilter(e.target.value)}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {creatorOptions.map((creator) => (
                    <option key={creator} value={creator}>
                      {creator}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div className="grid grid-cols-1 xl:grid-cols-2 gap-6" layout>
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    layout
                    onClick={() => handleJobClick(job)}
                  >
                    <JobCard job={job} onStatClick={(tab: any) => handleJobClick(job, tab)} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredJobs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-zinc-500"
              >
                <Briefcase size={48} className="text-zinc-700 mb-4" />
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all"
                >
                  <Plus size={18} />
                  <span>Create New Job</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}