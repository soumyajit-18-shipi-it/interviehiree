import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import ApplicationForm from './ApplicationForm';
import {
  ensureOrganizationId,
  getCareerPageDetails,
  getCareerPageJobs,
  getCareerPageSetup,
  listJobs,
} from '../../lib/api';
import { useToast } from '../ui/Toast';

type PortalJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
};

const fallbackJobs: PortalJob[] = [];

export default function CandidatePortal() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<PortalJob[]>(fallbackJobs);
  const [organizationId, setOrganizationId] = useState('');
  const [portalHeadline, setPortalHeadline] = useState('Shape the Future of AI.');
  const [portalSubheadline, setPortalSubheadline] = useState("We're building the next generation of recruitment tools. Explore our open positions and start your journey with us.");
  const [selectedJob, setSelectedJob] = useState<PortalJob | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const orgId = await ensureOrganizationId();
        setOrganizationId(orgId);

        let apiJobs = [] as PortalJob[];
        try {
          const setup = await getCareerPageSetup(orgId);
          if (setup?.slug) {
            const details = await getCareerPageDetails(setup.slug).catch(() => null);
            setPortalHeadline(details?.headline || setup.headline || 'Shape the Future of AI.');
            setPortalSubheadline(
              details?.subheadline ||
              setup.subheadline ||
              "We're building the next generation of recruitment tools. Explore our open positions and start your journey with us."
            );

            const careerJobs = await getCareerPageJobs({ slug: setup.slug, page_size: 50 });
            apiJobs = careerJobs.results.map((job) => ({
              id: job.id,
              title: job.title,
              department: job.role,
              location: job.location,
              type: 'Full-time',
              description: job.description,
            }));
          }
        } catch {
          // Fallback to regular jobs endpoint when career setup is not created.
        }

        if (!apiJobs.length) {
          const jobsResponse = await listJobs({ organization: orgId, status: 'published', page_size: 50 });
          apiJobs = jobsResponse.results.map((job) => ({
            id: job.id,
            title: job.title,
            department: job.role,
            location: job.location,
            type: 'Full-time',
            description: job.description,
          }));
        }

        setJobs(apiJobs);
      } catch (error) {
        console.error(error);
        toast('Unable to load open positions right now.', 'error');
      }
    };

    loadJobs();
  }, [toast]);

  if (isApplied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel max-w-md w-full p-12 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold gradient-text">Application Sent!</h2>
          <p className="text-[var(--muted-foreground)]">
            Thank you for applying to the <strong>{selectedJob?.title}</strong> role. Our team (and our AI) will review your resume shortly.
          </p>
          <button 
            onClick={() => { setIsApplied(false); setSelectedJob(null); }}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Back to Job Board
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold border border-[var(--primary)]/20 shadow-sm shadow-[var(--primary)]/10"
          >
            Join Our Team
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight gradient-text"
          >
            {portalHeadline}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto"
          >
            {portalSubheadline}
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedJob ? (
            <motion.div 
              key="job-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel group p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs font-bold uppercase tracking-wider">
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-sm">
                        <MapPin size={14} /> {job.location}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] text-sm line-clamp-2 max-w-xl">
                      {job.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden md:flex items-center gap-1.5 text-[var(--muted-foreground)] text-sm">
                      <Clock size={14} /> {job.type}
                    </span>
                    <div className="p-3 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="apply-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors font-medium mb-4"
              >
                <ChevronLeft size={20} /> Back to Open Positions
              </button>

              <div className="glass-panel p-8 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-3xl rounded-full -mr-32 -mt-32" />
                
                <div className="relative space-y-12">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold text-[var(--foreground)]">Applying for {selectedJob.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="bg-[var(--secondary)]/10 px-3 py-1 rounded-full">{selectedJob.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {selectedJob.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {selectedJob.type}</span>
                    </div>
                  </div>

                  <ApplicationForm 
                    jobTitle={selectedJob.title} 
                    jobId={selectedJob.id}
                    organizationId={organizationId}
                    onSuccess={() => setIsApplied(true)} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center pt-12 border-t border-[var(--border)]">
          <p className="text-[var(--muted-foreground)] text-sm">
            © 2026 ATSDash Technologies. All rights reserved. 
            <span className="mx-2">|</span> 
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
