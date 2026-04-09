import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, UserPlus, X, ChevronDown, CheckCircle, Shield, Users, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';
import { createTeamMember, ensureOrganizationId, listTeam } from '../../lib/api';
import { useToast } from '../ui/Toast';

type TeamRow = {
  id: string;
  name: string;
  role: string;
  type: string;
  status: string;
  email: string;
  assignedJobs: number;
};

export default function TeamManagement() {
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState('');
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inviteRole, setInviteRole] = useState('Recruiter');
  const [inviteEmail, setInviteEmail] = useState('');
  const [permissions, setPermissions] = useState({ editJob: false, viewScores: true, schedule: true });

  const loadTeam = async () => {
    try {
      const orgId = await ensureOrganizationId(organizationId || undefined);
      setOrganizationId(orgId);
      const response = await listTeam({ organization: orgId, page_size: 100 });
      setTeam(
        response.results.map((member) => ({
          id: member.id,
          name: member.display_name || `${member.first_name} ${member.last_name}`.trim(),
          role: member.designation,
          type: member.user_type,
          status: member.status,
          email: member.email,
          assignedJobs: 0,
        }))
      );
    } catch (error) {
      console.error(error);
      toast('Unable to load team members.', 'error');
    }
  };

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast('Please enter an email to invite.', 'warning');
      return;
    }

    try {
      const orgId = await ensureOrganizationId(organizationId || undefined);
      setOrganizationId(orgId);
      const username = inviteEmail.split('@')[0] || `user${Date.now()}`;
      await createTeamMember({
        organization: orgId,
        username,
        email: inviteEmail,
        first_name: username,
        last_name: '',
        designation: inviteRole,
        user_type: inviteRole,
        status: 'Invited',
      });
      toast('Invite sent successfully.', 'success');
      setInviteEmail('');
      setIsInviteOpen(false);
      await loadTeam();
    } catch (error) {
      console.error(error);
      toast('Failed to send invite.', 'error');
    }
  };

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const summary = useMemo(
    () => ({
      totalMembers: team.length,
      admins: team.filter((member) => member.type.toLowerCase() === 'admin').length,
      pendingInvites: team.filter((member) => member.status.toLowerCase() === 'invited').length,
    }),
    [team],
  );

  return (
    <div className="space-y-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your recruiting team and roles.</p>
        </div>
        
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <UserPlus size={18} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-4">
        <div className="px-5 py-3 bg-card border border-border shadow-sm rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl"><Users size={18} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Members</p>
            <p className="text-lg font-black text-foreground">{summary.totalMembers}</p>
          </div>
        </div>
        <div className="px-5 py-3 bg-card border border-border shadow-sm rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 text-violet-500 rounded-xl"><Shield size={18} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Admins</p>
            <p className="text-lg font-black text-foreground">{summary.admins}</p>
          </div>
        </div>
        <div className="px-5 py-3 bg-card border border-border shadow-sm rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Mail size={18} /></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Invites</p>
            <p className="text-lg font-black text-foreground">{summary.pendingInvites}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm shadow-sm"
          />
        </div>
        
        <div className="relative">
          <select className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground appearance-none pr-10 focus:outline-none focus:border-primary shadow-sm hover:bg-muted/50 transition-colors">
            <option>All Usertypes</option>
            <option>Admin</option>
            <option>Recruiter</option>
            <option>Interviewer</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-muted-foreground">User</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Role</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Assigned Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTeam.map((member) => (
                <tr 
                  key={member.id}
                  className="hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-bold border",
                      member.type === 'Admin' ? "bg-violet-500/10 text-violet-600 border-violet-500/20" : 
                      member.type === 'Recruiter' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    )}>
                      {member.type}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1 ml-1">{member.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "flex items-center gap-1.5 text-xs font-bold",
                      member.status === 'Active' ? "text-success" : "text-warning"
                    )}>
                      <span className={clsx("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? "bg-success" : "bg-warning")} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase size={16} />
                      <span className="font-bold text-foreground">{member.assignedJobs}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card rounded-3xl w-full max-w-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Invite Team Member</h3>
                    <p className="text-muted-foreground text-xs font-medium">Add collaborators to your workspace.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInviteOpen(false)}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                {/* Email Inputs Placeholder */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">EMAIL ADDRESSES</label>
                  <div className="p-2 bg-card border border-border rounded-xl shadow-sm min-h-[48px] flex flex-wrap gap-2 items-center focus-within:border-primary">
                    <input 
                      type="text" 
                      placeholder="Add more emails..." 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[150px]"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-3">ASSIGN ROLE</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { role: 'Admin', desc: 'Full access to jobs, settings, and billing.' },
                      { role: 'Recruiter', desc: 'Can create jobs, manage candidates, and invite members.' },
                      { role: 'Interviewer', desc: 'Limited access to evaluate assigned candidates.' }
                    ].map(r => (
                      <div 
                        key={r.role}
                        onClick={() => setInviteRole(r.role)}
                        className={clsx(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          inviteRole === r.role ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">{r.role}</span>
                          {inviteRole === r.role && <CheckCircle size={16} className="text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Granular Permissions */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-3">GRANULAR PERMISSIONS</label>
                  <div className="space-y-3 bg-muted/20 border border-border p-4 rounded-2xl">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-foreground">Can edit job description</span>
                      <input 
                        type="checkbox" 
                        checked={permissions.editJob}
                        onChange={(e) => setPermissions({...permissions, editJob: e.target.checked})}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-foreground">Can view candidate scores</span>
                      <input 
                        type="checkbox" 
                        checked={permissions.viewScores}
                        onChange={(e) => setPermissions({...permissions, viewScores: e.target.checked})}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-foreground">Can schedule interviews</span>
                      <input 
                        type="checkbox" 
                        checked={permissions.schedule}
                        onChange={(e) => setPermissions({...permissions, schedule: e.target.checked})}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
                <button 
                  onClick={() => setIsInviteOpen(false)}
                  className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInvite}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  Send Invites
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
