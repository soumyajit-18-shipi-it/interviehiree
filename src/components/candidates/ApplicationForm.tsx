import { useState } from 'react';
import { Upload, X, CheckCircle2, User, Mail, Phone, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createApplication, createCandidate } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface ApplicationFormProps {
  jobTitle: string;
  jobId: string;
  organizationId: string;
  onSuccess: () => void;
}

export default function ApplicationForm({ jobTitle, jobId, organizationId, onSuccess }: ApplicationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('msword') || file.type.includes('officedocument'))) {
      setFormData(prev => ({ ...prev, resume: file }));
    } else {
      alert("Please upload a PDF or Word document.");
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resume) {
      toast('Please upload your resume.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const candidate = await createCandidate({
        organization: organizationId,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: 'Career Page',
        current_title: `Applicant for ${jobTitle}`,
        resume: formData.resume,
      });

      await createApplication({
        organization: organizationId,
        candidate: candidate.id,
        job: jobId,
        source: 'Career Page',
        current_stage: 'resume_analysis',
        notes: `Submitted from public career page for ${jobTitle}`,
      });

      toast('Application submitted successfully.', 'success');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast('Failed to submit application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <User size={16} className="text-[var(--primary)]" /> FULL NAME
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Mail size={16} className="text-[var(--primary)]" /> EMAIL ADDRESS
          </label>
          <input
            type="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Phone size={16} className="text-[var(--primary)]" /> PHONE NUMBER
          </label>
          <input
            type="tel"
            required
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <FileText size={16} className="text-[var(--primary)]" /> RESUME / CV
        </label>
        
        {!formData.resume ? (
          <div 
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group relative overflow-hidden",
              dragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
            )}
            onClick={() => document.getElementById('resume-upload')?.click()}
          >
            <input 
              id="resume-upload"
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">Click or drag to upload</p>
                <p className="text-[var(--muted-foreground)] text-sm">PDF, DOC, DOCX (Max 10MB)</p>
              </div>
            </div>
            {dragActive && (
                <div className="absolute inset-0 bg-[var(--primary)]/10 backdrop-blur-[2px] flex items-center justify-center">
                    <p className="text-[var(--primary)] font-bold text-xl">Drop it here!</p>
                </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-6 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-[var(--foreground)]">{formData.resume.name}</p>
                <p className="text-[var(--muted-foreground)] text-xs">{(formData.resume.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, resume: null })}
              className="p-2 hover:bg-[var(--primary)]/10 text-[var(--muted-foreground)] hover:text-red-500 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3",
            isSubmitting 
                ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed" 
                : "bg-[var(--primary)] text-white hover:opacity-90 hover:scale-[1.02] shadow-[var(--primary)]/20"
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Optimizing your profile...
          </>
        ) : (
          <>Submit Application for {jobTitle}</>
        )}
      </button>
    </form>
  );
}
