import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Plus, Info, Edit, Globe, FileText, Video, Briefcase,
  Check, AlertTriangle, Star, Clock, Zap, Trash2, GripVertical
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Types ─────────────────────────────────────────────────────────────────
interface CriterionItem {
  id: string;
  text: string;
}
interface ResumeConfig {
  mustHave: CriterionItem[];
  redFlags: CriterionItem[];
  goodToHave: CriterionItem[];
}
interface ScreeningParam {
  id: string;
  label: string;
  weight: number;
  enabled: boolean;
}
interface InterviewQuestion {
  id: string;
  question: string;
  competency: string;
  duration: number;
}

// ─── Resume Analysis Panel ────────────────────────────────────────────────
function ResumePanel() {
  const [config, setConfig] = useState<ResumeConfig>({
    mustHave: [
      { id: 'm1', text: '5+ years of UX/Product Design experience' },
    ],
    redFlags: [
      { id: 'r1', text: 'No portfolio or case studies' },
    ],
    goodToHave: [
      { id: 'g1', text: 'Experience with Figma and design systems' },
    ],
  });
  const [newText, setNewText] = useState<Record<string, string>>({ mustHave: '', redFlags: '', goodToHave: '' });
  const [saved, setSaved] = useState(false);

  const sections: { key: keyof ResumeConfig; label: string; icon: any; color: string }[] = [
    { key: 'mustHave', label: 'Must Have', icon: Check, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'redFlags', label: 'Red Flags', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { key: 'goodToHave', label: 'Good to Have', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const addItem = (key: keyof ResumeConfig) => {
    const text = newText[key]?.trim();
    if (!text) return;
    setConfig(prev => ({ ...prev, [key]: [...prev[key], { id: Date.now().toString(), text }] }));
    setNewText(prev => ({ ...prev, [key]: '' }));
  };

  const removeItem = (key: keyof ResumeConfig, id: string) => {
    setConfig(prev => ({ ...prev, [key]: prev[key].filter(i => i.id !== id) }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Resume Analysis Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Define the criteria our AI will use to evaluate and score resumes.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {sections.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="border border-border rounded-2xl overflow-hidden">
            <div className={clsx('px-4 py-3 flex items-center gap-2 border-b border-border', color.split(' ')[1], color.split(' ')[2])}>
              <Icon size={15} className={color.split(' ')[0]} />
              <span className={clsx('font-bold text-sm', color.split(' ')[0])}>{label}</span>
              <span className="ml-auto text-xs font-semibold text-muted-foreground">{config[key].length} criteria</span>
            </div>
            <div className="p-3 space-y-2 bg-card">
              {config[key].map(item => (
                <div key={item.id} className="flex items-center gap-2 group px-3 py-2 bg-muted/30 rounded-xl">
                  <GripVertical size={14} className="text-muted-foreground/40 cursor-grab flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.text}</span>
                  <button
                    onClick={() => removeItem(key, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newText[key]}
                  onChange={e => setNewText(prev => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addItem(key)}
                  placeholder={`Add ${label.toLowerCase()} criterion...`}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-all"
                />
                <button
                  onClick={() => addItem(key)}
                  className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
          )}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Criteria'}
        </button>
      </div>
    </div>
  );
}

// ─── Recruiter Screening Panel ────────────────────────────────────────────
function ScreeningPanel() {
  const [params, setParams] = useState<ScreeningParam[]>([
    { id: '1', label: 'Communication Skills', weight: 25, enabled: true },
    { id: '2', label: 'Technical Knowledge', weight: 30, enabled: true },
    { id: '3', label: 'Problem Solving', weight: 20, enabled: true },
    { id: '4', label: 'Cultural Fit', weight: 15, enabled: true },
    { id: '5', label: 'Motivation & Interest', weight: 10, enabled: true },
  ]);
  const [duration, setDuration] = useState([5, 10]);
  const [saved, setSaved] = useState(false);

  const totalWeight = params.filter(p => p.enabled).reduce((a, p) => a + p.weight, 0);

  const updateWeight = (id: string, val: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, weight: Math.max(0, Math.min(100, val)) } : p));
  };

  const toggleParam = (id: string) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Video size={20} className="text-primary" /> Recruiter Screening Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Configure the parameters and weights for automated recruiter screening.</p>
      </div>

      {/* Duration */}
      <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl flex items-center gap-4">
        <Clock size={18} className="text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Estimated Duration</p>
          <p className="text-xs text-muted-foreground">Time allocated for this screening stage</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={duration[0]}
            min={1} max={duration[1] - 1}
            onChange={e => setDuration([+e.target.value, duration[1]])}
            className="w-14 px-2 py-1 text-center text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="number"
            value={duration[1]}
            min={duration[0] + 1} max={120}
            onChange={e => setDuration([duration[0], +e.target.value])}
            className="w-14 px-2 py-1 text-center text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-sm text-muted-foreground font-medium">mins</span>
        </div>
      </div>

      {/* Weight indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Evaluation Parameters</span>
        <span className={clsx('font-bold px-2.5 py-1 rounded-full text-xs', totalWeight === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}>
          {totalWeight}% / 100%
        </span>
      </div>

      <div className="space-y-3">
        {params.map(param => (
          <div key={param.id} className={clsx('p-4 border rounded-2xl transition-all', param.enabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60')}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleParam(param.id)}
                className={clsx('w-9 h-5 rounded-full relative transition-colors border flex-shrink-0', param.enabled ? 'bg-primary border-primary' : 'bg-muted border-border')}
              >
                <div className={clsx('absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all', param.enabled ? 'left-[18px]' : 'left-1')} />
              </button>
              <span className={clsx('text-sm font-semibold flex-1', param.enabled ? 'text-foreground' : 'text-muted-foreground')}>{param.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={param.weight}
                  disabled={!param.enabled}
                  min={0} max={100}
                  onChange={e => updateWeight(param.id, +e.target.value)}
                  className="w-14 px-2 py-1 text-center text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-40"
                />
                <span className="text-xs text-muted-foreground font-medium w-3">%</span>
              </div>
            </div>
            {param.enabled && (
              <div className="mt-3 ml-12">
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    animate={{ width: `${param.weight}%` }}
                    className="h-1.5 bg-primary rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
          )}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Parameters'}
        </button>
      </div>
    </div>
  );
}

// ─── Functional Interview Panel ────────────────────────────────────────────
function InterviewPanel() {
  const competencies = ['Problem Solving', 'Communication', 'Leadership', 'Technical', 'Adaptability'];

  const [questions, setQuestions] = useState<InterviewQuestion[]>([
    { id: '1', question: 'Walk me through your design process for a complex product.', competency: 'Communication', duration: 3 },
    { id: '2', question: 'Describe a time you turned user research into a product decision.', competency: 'Problem Solving', duration: 3 },
    { id: '3', question: 'How do you handle stakeholder disagreements on design direction?', competency: 'Leadership', duration: 2 },
    { id: '4', question: 'Tell me about a time you designed under tight constraints.', competency: 'Adaptability', duration: 2 },
    { id: '5', question: 'What metrics do you use to measure design success?', competency: 'Technical', duration: 2 },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newQ, setNewQ] = useState({ question: '', competency: 'Problem Solving', duration: 2 });
  const [saved, setSaved] = useState(false);

  const totalDuration = questions.reduce((a, q) => a + q.duration, 0);
  const competencyCounts = competencies.map(c => ({ name: c, count: questions.filter(q => q.competency === c).length }));

  const addQuestion = () => {
    if (!newQ.question.trim()) return;
    setQuestions(prev => [...prev, { ...newQ, id: Date.now().toString() }]);
    setNewQ({ question: '', competency: 'Problem Solving', duration: 2 });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Briefcase size={20} className="text-primary" /> Functional Interview Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage interview questions, competencies and timing.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl text-center">
          <p className="text-2xl font-black text-primary">{questions.length}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Questions</p>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl text-center">
          <p className="text-2xl font-black text-primary">{totalDuration}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Minutes Total</p>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl text-center">
          <p className="text-2xl font-black text-primary flex items-center justify-center gap-1">
            <Zap size={18} />{competencyCounts.filter(c => c.count > 0).length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Competencies</p>
        </div>
      </div>

      {/* Competency breakdown */}
      <div className="flex flex-wrap gap-2">
        {competencyCounts.map(c => (
          <span key={c.name} className={clsx(
            'px-3 py-1 rounded-full text-xs font-semibold border',
            c.count > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
          )}>
            {c.name} {c.count > 0 && `(${c.count})`}
          </span>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            layout
            className="p-4 border border-border rounded-2xl bg-card group hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/15">
                    {q.competency}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                    <Clock size={11} /> {q.duration} min
                  </span>
                </div>
              </div>
              <button
                onClick={() => setQuestions(prev => prev.filter(x => x.id !== q.id))}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger p-1 rounded-lg hover:bg-danger/10 transition-all flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Question */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border-2 border-primary/30 border-dashed rounded-2xl bg-primary/5 space-y-3"
          >
            <textarea
              placeholder="Enter interview question..."
              rows={2}
              value={newQ.question}
              onChange={e => setNewQ({ ...newQ, question: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary resize-none"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Competency</label>
                <select
                  value={newQ.competency}
                  onChange={e => setNewQ({ ...newQ, competency: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary"
                >
                  {competencies.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Duration (mins)</label>
                <input
                  type="number" min={1} max={15}
                  value={newQ.duration}
                  onChange={e => setNewQ({ ...newQ, duration: +e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={addQuestion} className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                Add Question
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-primary/25 rounded-2xl text-sm font-semibold text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Question
          </button>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved ? 'bg-emerald-600 text-white' : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
          )}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Questions'}
        </button>
      </div>
    </div>
  );
}

// ─── Career Page Panel (existing, now extracted) ──────────────────────────
function CareerPagePanel({ job, setEditableJob }: any) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-foreground">Career Page</h2>
        <div title="What is the career page?">
          <Info size={16} className="text-muted-foreground" />
        </div>
      </div>

      <button className="self-start flex items-center gap-2 px-4 py-2 border border-border bg-muted/50 text-foreground rounded-lg text-xs font-bold hover:bg-muted transition-all mb-8">
        <Plus size={14} /> Add Application Form
      </button>

      <div className="border border-border rounded-xl p-6 bg-background flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Job Description</h3>
          <button
  onClick={() => setIsEditing(true)}
  className="flex items-center gap-1.5 text-primary text-xs font-bold hover:underline"
>
  <Edit size={12} /> Edit
</button>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground flex-1">
        <input
  value={job.title}
  disabled={!isEditing}
  onChange={(e) =>
    setEditableJob((prev: any) => ({
      ...prev,
      title: e.target.value
    }))
  }
  className="text-2xl font-black text-foreground mb-1 bg-transparent border-b border-border focus:outline-none disabled:opacity-60"
/>          
<p className="text-sm font-semibold text-foreground mb-3">Alpha • 📍 Delhi, India</p>
          <div className="flex gap-2 mb-6">
            <span className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider">Full Time</span>
            <span className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider">Fresher</span>
          </div>
          <h4 className="font-bold text-foreground">Job Overview</h4>
          <p className="mb-4">We are seeking a talented individual to join our growing team. You will be responsible for end-to-end delivery of the assigned role.</p>
          <h4 className="font-bold text-foreground">Key Responsibilities</h4>
          <ul>
            <li>Collaborate with cross-functional teams</li>
            <li>Deliver high-quality output on spec</li>
            <li>Maintain platform stability and performance</li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Live URL: <a href="https://alpha.interviehire.ai/jobs" className="text-primary hover:underline">alpha.interviehire.ai/jobs</a>
          </div>
          <button className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function JobConfiguration({ job, onBack, onViewResponses, onSave }: any) {
  const [stages, setStages] = useState([
    { id: 'career', name: '1 · Career Page', shortName: 'Career Page', details: 'Job title on career page', enabled: false, icon: Globe },
    { id: 'resume', name: '2 · Resume Analysis', shortName: 'Resume Analysis', details: '1 Must have · 1 Red flags · 1 Good to have', enabled: true, icon: FileText },
    { id: 'screening', name: '3 · Recruiter Screening', shortName: 'Recruiter Screening', details: '5 Parameters · ⏱ 5–10 mins', enabled: true, icon: Video },
    { id: 'functional', name: '4 · Functional Interview', shortName: 'Functional Interview', details: '5 Questions · ⏱ 12 Minutes · ⚡ 5 Competency', enabled: true, icon: Briefcase },
  ]);
  const [activeStage, setActiveStage] = useState<string>('career');
  const [editableJob, setEditableJob] = useState(job);

  const toggleStage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStages(stages.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const renderRightPanel = () => {
    switch (activeStage) {
      case 'career': return <CareerPagePanel job={editableJob} setEditableJob={setEditableJob} />;
      case 'resume': return <ResumePanel />;
      case 'screening': return <ScreeningPanel />;
      case 'functional': return <InterviewPanel />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden -m-8 relative z-50">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Jobs</span>
            <ChevronRight size={14} className="text-border" />
            <span className="font-semibold text-foreground truncate max-w-[200px]">{job.title}</span>
            {job.status === 'Published' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-2">
                Published
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
        <button
  onClick={() => onSave(editableJob)}
  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
>
  Save Job
</button>
          <button className="flex items-center gap-2 px-4 py-1.5 border border-primary/20 bg-card text-primary rounded-lg text-xs font-bold hover:bg-muted transition-all">
            Add Collaborator
          </button>
          <button
            onClick={onViewResponses}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            View Responses
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Left Panel: Pipeline stages */}
          <div className="space-y-0 relative">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              return (
                <div key={stage.id} className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveStage(stage.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveStage(stage.id);
                      }
                    }}
                    className={clsx(
                      'w-full text-left bg-card border p-4 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'border-primary/40 bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-border hover:border-primary/20 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={clsx('p-1.5 rounded-lg', isActive ? 'bg-primary/10' : 'bg-muted/50')}>
                          <Icon size={14} className={isActive ? 'text-primary' : stage.enabled ? 'text-foreground' : 'text-muted-foreground'} />
                        </div>
                        <h3 className={clsx(
                          'font-bold text-sm',
                          isActive ? 'text-primary' : stage.enabled ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {stage.name}
                        </h3>
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={(e) => toggleStage(stage.id, e)}
                        className={clsx(
                          'w-9 h-5 rounded-full relative transition-colors border flex-shrink-0',
                          stage.enabled ? 'bg-primary border-primary' : 'bg-muted border-border'
                        )}
                      >
                        <div className={clsx(
                          'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm',
                          stage.enabled ? 'left-[18px]' : 'left-1'
                        )} />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground ml-8 font-medium leading-relaxed">{stage.details}</p>

                    {isActive && (
                      <div className="mt-2 ml-8">
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">Configuring →</span>
                      </div>
                    )}
                  </div>

                  {index < stages.length - 1 && (
                    <div className="h-4 flex justify-center items-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-px h-2 bg-border" />
                        <div className="w-1.5 h-1.5 rotate-45 border-r border-b border-border/70" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Panel: Stage Config */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {renderRightPanel()}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
