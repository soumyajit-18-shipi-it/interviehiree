import { clsx } from 'clsx';
import { Briefcase, Users, CheckCircle, FileText, MoreVertical, Calendar, ArrowRight, Copy } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    role: string;
    createdDate: string;
    status: 'Published' | 'Draft' | 'Archived';
    stats: {
      total: number;
      resume: number;
      screening: number;
      interview: number;
    }
  };
  onStatClick?: (tab: string) => void;
}

export default function JobCard({ job, onStatClick }: JobCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full">
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1" title={job.title}>
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Briefcase size={16} className="text-primary"/>
            <span>Role: <span className="font-medium text-foreground">{job.role}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Calendar size={16} className="text-primary"/>
        <span>Created: <span className="font-medium text-foreground">{job.createdDate}</span></span>
      </div>

      {/* Pipeline Progress Strip */}
      <div className="flex items-center justify-between mb-8 px-2 relative">
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
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/10">A</div>
            <span className="text-xs text-muted-foreground font-medium">Alpha <span className="text-muted-foreground/70">(me)</span></span>
          </div>
          <span className="text-border mx-1"></span>
          <button className="flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary transition-all uppercase tracking-wide">
             JOB DESCRIPTION
          </button>
        </div>
        
        <div className="flex items-center">
          {job.status === 'Published' && (
            <button className="flex items-center gap-1.5 text-primary text-xs font-bold hover:underline bg-primary/5 px-2.5 py-1.5 rounded-lg transition-colors border border-primary/10">
              Functional Interview Link <Copy size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowNode({ label, count, icon: Icon, color, active, onClick }: { label: string, count: number|string, icon: any, color: string, active: boolean, onClick: () => void }) {
  const colors: Record<string, string> = {
    "purple": "bg-primary/10 border-primary/20 text-primary",
    "orange": "bg-warning/10 border-warning/20 text-warning",
    "blue-grey": "bg-slate-100 border-slate-200 text-slate-500",
    "green": "bg-success/10 border-success/20 text-success"
  };

  const activeColor = active ? colors[color] : "bg-muted/50 border-border border-dashed text-muted-foreground/50";

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform cursor-pointer group"
    >
      <div className={clsx("w-[52px] h-[38px] rounded-lg border-2 flex items-center justify-center gap-1.5 transition-colors", activeColor, active && "group-hover:border-opacity-50")}>
        <Icon size={14} className="flex-shrink-0" />
        {active && count !== '-' && <span className="text-sm font-bold">{count}</span>}
      </div>
      <span className={clsx("text-[10px] font-bold uppercase tracking-tight", active ? "text-muted-foreground" : "text-muted-foreground/50")}>{label}</span>
      {active && <div className={clsx("absolute -bottom-2 w-1 h-1 rounded-full", colors[color].split(' ')[2].replace('text-', 'bg-'))} />}
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

const Video = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
    <rect x={2} y={6} width={14} height={12} rx={3} />
  </svg>
);
