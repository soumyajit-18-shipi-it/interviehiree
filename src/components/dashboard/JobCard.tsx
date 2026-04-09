import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  Briefcase,
  Users,
  CheckCircle,
  FileText,
  MoreVertical,
  Calendar,
  ArrowRight,
  Copy,
  Pencil,
  GitBranch,
  Globe,
  FolderCog,
  Settings,
  Archive,
  X,
  Monitor,
  Smartphone,
  Clock3,
  PlayCircle,
  RotateCcw,
  FileBadge,
  LockKeyhole,
  ChevronDown,
  Video,
  type LucideIcon,
} from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    role: string;
    createdDate: string;
    status: 'Published' | 'Draft' | 'Archived';
    listedOnCareerPage?: boolean;
    createdBy?: string;
    stats: {
      total: number;
      resume: number;
      screening: number;
      interview: number;
    };
  };
  onStatClick?: (tab: string) => void;
  onOpenConfig?: () => void;
  onEditJobName?: (payload: { title: string; jobId?: string; tags: string[] }) => void;
  onUnlistFromCareerPage?: () => void;
  onArchiveJob?: () => void;
  onUnarchiveJob?: () => void;
  onDuplicateJob?: () => void;
}

type InterviewSettingsState = {
  interviewStatus: boolean;
  allowMobile: boolean;
  allowLateAttempts: boolean;
  continueFromMiddle: boolean;
  allowReattempt: boolean;
  requestCV: boolean;
  accessType: string;
};

const defaultInterviewSettings: InterviewSettingsState = {
  interviewStatus: true,
  allowMobile: false,
  allowLateAttempts: false,
  continueFromMiddle: true,
  allowReattempt: false,
  requestCV: true,
  accessType: 'Anyone with the link',
};

export default function JobCard({
  job,
  onStatClick,
  onOpenConfig,
  onEditJobName,
  onUnlistFromCareerPage,
  onArchiveJob,
  onUnarchiveJob,
  onDuplicateJob,
}: JobCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInterviewSettingsOpen, setIsInterviewSettingsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editTitle, setEditTitle] = useState(job.title);
  const [editJobId, setEditJobId] = useState(job.id);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [interviewSettings, setInterviewSettings] =
    useState<InterviewSettingsState>(defaultInterviewSettings);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const addTag = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    if (tags.includes(cleaned)) return;
    setTags((prev) => [...prev, cleaned]);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const handleSaveEdit = () => {
    onEditJobName?.({
      title: editTitle.trim() || job.title,
      jobId: editJobId.trim() || undefined,
      tags,
    });
    setIsEditOpen(false);
    setIsMenuOpen(false);
  };

  const listedOnCareerPage = job.listedOnCareerPage ?? true;

  return (
    <>
      <div className="relative bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex-1 pr-0 sm:pr-4 min-w-0">
            <h3
              className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1"
              title={job.title}
            >
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 min-w-0">
              <Briefcase size={16} className="text-primary shrink-0" />
              <span className="truncate">
                Role: <span className="font-medium text-foreground">{job.role}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start relative" ref={menuRef}>
            {job.status === 'Published' && (
              <span className="bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <CheckCircle size={12} />
                Published
              </span>
            )}
            {job.status === 'Draft' && (
              <span className="bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                Draft
              </span>
            )}
            {job.status === 'Archived' && (
              <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                Archived
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-10 z-30 w-64 rounded-2xl border border-border bg-white shadow-xl p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem
                  icon={Pencil}
                  label="Edit Job Name"
                  onClick={() => {
                    setIsEditOpen(true);
                    setIsMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={GitBranch}
                  label="View Job Flow"
                  onClick={() => {
                    onOpenConfig?.();
                    setIsMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={Globe}
                  label={listedOnCareerPage ? 'Unlist from Career Page' : 'List on Career Page'}
                  onClick={() => {
                    onUnlistFromCareerPage?.();
                    setIsMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={FolderCog}
                  label="Duplicate"
                  onClick={() => {
                    onDuplicateJob?.();
                    setIsMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={Settings}
                  label="Interview Settings"
                  onClick={() => {
                    setIsInterviewSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={Archive}
                  label={job.status === 'Archived' ? 'Unarchive' : 'Archive'}
                  onClick={() => {
                    if (job.status === 'Archived') {
                      onUnarchiveJob?.();
                    } else {
                      onArchiveJob?.();
                    }
                    setIsMenuOpen(false);
                  }}
                  danger={job.status !== 'Archived'}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Calendar size={16} className="text-primary" />
          <span>
            Created: <span className="font-medium text-foreground">{job.createdDate}</span>
          </span>
        </div>

        {!listedOnCareerPage && job.status !== 'Archived' && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Career Page Unlisted
            </span>
          </div>
        )}

        {/* Pipeline Progress Strip */}
        <div className="flex items-center justify-between mb-8 px-2 relative w-full overflow-x-auto pb-4 scrollbar-hide shrink-0 min-w-min">
          <WorkflowNode
            label="Total"
            count={job.stats.total}
            icon={Users}
            color="purple"
            active={true}
            onClick={() => onStatClick?.('Overview')}
          />
          <WorkflowArrow />
          <WorkflowNode
            label="Resume"
            count={job.stats.resume || '-'}
            icon={FileText}
            color="orange"
            active={job.stats.total > 0}
            onClick={() => onStatClick?.('Resume Analysis')}
          />
          <WorkflowArrow />
          <WorkflowNode
            label="Screening"
            count={job.stats.screening || '-'}
            icon={Video}
            color="blue-grey"
            active={job.stats.resume > 0}
            onClick={() => onStatClick?.('Recruiter Screening')}
          />
          <WorkflowArrow />
          <WorkflowNode
            label="Functional"
            count={job.stats.interview || '-'}
            icon={Briefcase}
            color="green"
            active={job.stats.screening > 0}
            onClick={() => onStatClick?.('Functional Interview')}
          />
        </div>

        {/* Card Footer */}
        <div className="mt-auto pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/10">
                A
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Alpha <span className="text-muted-foreground/70">(me)</span>
              </span>
            </div>
            <span className="text-border mx-1">|</span>
            <button className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-foreground hover:text-primary transition-all uppercase tracking-wide">
              JOB DESCRIPTION
            </button>
          </div>

          <div className="flex items-center">
            {job.status === 'Published' && listedOnCareerPage && (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-full md:w-auto gap-1.5 text-primary text-xs font-bold hover:underline bg-primary/5 px-2.5 py-2 rounded-lg transition-colors border border-primary/10"
              >
                Functional Interview Link <Copy size={14} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Name Modal */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center mb-8">
              <h2 className="text-2xl font-bold text-slate-700">Edit Job Name</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute right-0 top-0 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Job Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Job Id <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  value={editJobId}
                  onChange={(e) => setEditJobId(e.target.value)}
                  placeholder="e.g. 49298af015c842336b57a62a1"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags <span className="text-slate-400">(optional)</span>
                </label>

                <div className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[92px] flex flex-wrap gap-2 items-start focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) {
                        addTag(tagInput);
                        setTagInput('');
                      }
                    }}
                    placeholder="Type and press Enter or comma"
                    className="flex-1 min-w-[180px] outline-none text-lg text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full rounded-xl bg-primary text-white font-bold text-lg py-4 hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Settings Modal */}
      {isInterviewSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setIsInterviewSettingsOpen(false)}
        >
          <div
            className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-700">
                Interview Settings
              </h2>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 border border-slate-300 rounded-xl px-4 py-3 min-w-[420px] text-slate-700">
                  <span className="truncate">{job.title} - HR Screening</span>
                  <ChevronDown size={18} className="ml-auto shrink-0" />
                </div>

                <button
                  onClick={() => setIsInterviewSettingsOpen(false)}
                  className="p-1.5 border-2 border-slate-500 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-10">
              <SettingsRow
                icon={Monitor}
                title="Interview status"
                description="Enable or disable the interview"
                checked={interviewSettings.interviewStatus}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, interviewStatus: value }))
                }
              />
              <SettingsRow
                icon={Smartphone}
                title="Allow access on mobile"
                description="We recommend using desktop over mobile, For better experience"
                checked={interviewSettings.allowMobile}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, allowMobile: value }))
                }
              />
              <SettingsRow
                icon={Clock3}
                title="Allow late attempts"
                description="Enables candidates to attempt interview at a time after the scheduled time."
                checked={interviewSettings.allowLateAttempts}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, allowLateAttempts: value }))
                }
              />
              <SettingsRow
                icon={PlayCircle}
                title="Continue from middle"
                description="Enables candidates to continue their interview from where they left off."
                checked={interviewSettings.continueFromMiddle}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, continueFromMiddle: value }))
                }
              />
              <SettingsRow
                icon={RotateCcw}
                title="Allow reattempt"
                description="Enable candidates to reattempt the interview."
                checked={interviewSettings.allowReattempt}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, allowReattempt: value }))
                }
              />
              <SettingsRow
                icon={FileBadge}
                title="Request candidate’s CV"
                description=""
                checked={interviewSettings.requestCV}
                onChange={(value) =>
                  setInterviewSettings((prev) => ({ ...prev, requestCV: value }))
                }
              />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <LockKeyhole size={22} className="text-slate-500 shrink-0" />
                  <div className="w-px self-stretch bg-slate-200 hidden sm:block" />
                  <div>
                    <div className="text-xl font-medium text-slate-800">
                      Allow interview access to
                    </div>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-xl px-4 py-3 min-w-[260px] flex items-center gap-2 text-slate-600">
                  <span>{interviewSettings.accessType}</span>
                  <ChevronDown size={18} className="ml-auto shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors',
        danger
          ? 'text-slate-700 hover:bg-red-50 hover:text-red-600'
          : 'text-slate-700 hover:bg-slate-50'
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <Icon size={22} className="text-slate-500 shrink-0" />
        <div className="w-px self-stretch bg-slate-200 hidden sm:block" />
        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xl font-medium text-slate-800">{title}</span>
            {description && <span className="text-slate-500 text-xl">{description}</span>}
          </div>
        </div>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-10 w-16 rounded-full transition-colors shrink-0',
        checked ? 'bg-primary' : 'bg-slate-200'
      )}
    >
      <span
        className={clsx(
          'absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all',
          checked ? 'left-7' : 'left-1'
        )}
      />
    </button>
  );
}

function WorkflowNode({
  label,
  count,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number | string;
  icon: LucideIcon;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    purple: 'bg-primary/10 border-primary/20 text-primary',
    orange: 'bg-warning/10 border-warning/20 text-warning',
    'blue-grey': 'bg-slate-100 border-slate-200 text-slate-500',
    green: 'bg-success/10 border-success/20 text-success',
  };

  const activeColor = active
    ? colors[color]
    : 'bg-muted/50 border-border border-dashed text-muted-foreground/50';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative flex flex-col items-center gap-1.5 active:scale-95 transition-transform cursor-pointer group"
    >
      <div
        className={clsx(
          'w-[52px] h-[38px] rounded-lg border-2 flex items-center justify-center gap-1.5 transition-colors',
          activeColor,
          active && 'group-hover:border-opacity-50'
        )}
      >
        <Icon size={14} className="flex-shrink-0" />
        {active && count !== '-' && <span className="text-sm font-bold">{count}</span>}
      </div>
      <span
        className={clsx(
          'text-[10px] font-bold uppercase tracking-tight',
          active ? 'text-muted-foreground' : 'text-muted-foreground/50'
        )}
      >
        {label}
      </span>
      {active && (
        <div
          className={clsx(
            'absolute -bottom-2 w-1 h-1 rounded-full',
            colors[color].split(' ')[2].replace('text-', 'bg-')
          )}
        />
      )}
    </button>
  );
}

function WorkflowArrow() {
  return (
    <div className="text-muted/80 flex-1 flex justify-center pb-5">
      <ArrowRight size={14} strokeWidth={2.5} />
    </div>
  );
}