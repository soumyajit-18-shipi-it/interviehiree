import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  CheckCircle,
  ChevronDown,
  Loader2,
  Mail,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  createTeamMember,
  deleteTeamMember,
  ensureOrganizationId,
  getTeamMember,
  listJobs,
  listTeam,
  updateTeamMember,
} from '../../lib/api';
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

type TeamRoleValue = 'org_admin' | 'recruiter' | 'interviewer' | 'viewer';

type InviteRole = {
  value: TeamRoleValue;
  label: string;
  designation: string;
  description: string;
};

const TEAM_ROLES: InviteRole[] = [
  {
    value: 'org_admin',
    label: 'Admin',
    designation: 'Admin',
    description: 'Full access to jobs, settings, and team management.',
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    designation: 'Recruiter',
    description: 'Can create jobs, manage candidates, and invite members.',
  },
  {
    value: 'interviewer',
    label: 'Interviewer',
    designation: 'Interviewer',
    description: 'Can review interview stages and leave feedback.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    designation: 'Viewer',
    description: 'Read-only access for stakeholders and observers.',
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'inactive', label: 'Inactive' },
] as const;

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeUserType(value: string | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function normalizeStatus(value: string | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function splitName(fullName: string, fallback: string) {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: fallback, lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function isAdminType(type: string) {
  return type === 'admin' || type === 'org_admin';
}

export default function TeamManagement() {
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState('');
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamRow | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamRoleValue | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]['value']>('all');
  const [inviteRole, setInviteRole] = useState<TeamRoleValue>('recruiter');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [editDesignation, setEditDesignation] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const loadTeam = async (explicitOrganizationId?: string) => {
    const orgId = await ensureOrganizationId((explicitOrganizationId ?? organizationId) || undefined);

    setOrganizationId(orgId);
    setLoadError('');
    setIsLoading(true);

    try {
      const response = await listTeam({ organization: orgId, page_size: 100 });
      const members = Array.isArray(response) ? response : response.results ?? [];
      const mappedTeam = await Promise.all(
        members.map(async (member) => {
          const numericUserId = member.user == null ? undefined : Number(member.user);
          let assignedJobs = 0;

          if (numericUserId !== undefined && !Number.isNaN(numericUserId)) {
            try {
              const jobs = await listJobs({
                organization: orgId,
                created_by: String(numericUserId),
                page_size: 1,
              });
              assignedJobs = jobs.count;
            } catch (error) {
              console.error(error);
            }
          }

          return {
            id: member.id,
            name: member.display_name || `${member.first_name} ${member.last_name}`.trim() || member.username,
            role: member.designation,
            type: normalizeUserType(member.user_type),
            status: normalizeStatus(member.status),
            email: member.email,
            assignedJobs,
          } satisfies TeamRow;
        })
      );

      setTeam(mappedTeam);
    } catch (error) {
      console.error(error);
      setTeam([]);
      setLoadError('Unable to load team members.');
      toast('Unable to load team members.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTeam = async () => {
    await loadTeam(organizationId || undefined);
  };

  const selectedInviteRole = TEAM_ROLES.find((role) => role.value === inviteRole) ?? TEAM_ROLES[1];

  useEffect(() => {
    void loadTeam();
    // The page loads once and refreshes explicitly after CRUD actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast('Please enter an email to invite.', 'warning');
      return;
    }

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const username = normalizedEmail.split('@')[0] || `user${Date.now()}`;
    const { firstName, lastName } = splitName(inviteFullName, username);

    try {
      setIsInviteSubmitting(true);
      const orgId = await ensureOrganizationId(organizationId || undefined);
      setOrganizationId(orgId);
      await createTeamMember({
        organization: orgId,
        username,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        designation: selectedInviteRole.designation,
        user_type: selectedInviteRole.value,
        status: 'invited',
      });
      toast('Invite sent successfully.', 'success');
      setInviteEmail('');
      setInviteFullName('');
      setIsInviteOpen(false);
      await refreshTeam();
    } catch (error) {
      console.error(error);
      toast('Failed to send invite.', 'error');
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMember) {
      return;
    }

    const trimmedDesignation = editDesignation.trim();
    if (!trimmedDesignation) {
      toast('Designation cannot be empty.', 'warning');
      return;
    }

    try {
      setIsEditSubmitting(true);
      await updateTeamMember(editingMember.id, {
        designation: trimmedDesignation,
        status: editStatus.trim().toLowerCase(),
      });
      toast('Team member updated successfully.', 'success');
      setEditingMember(null);
      await refreshTeam();
    } catch (error) {
      console.error(error);
      toast('Failed to update team member.', 'error');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleteSubmitting(true);
      await deleteTeamMember(deleteTarget.id);
      toast('Team member removed.', 'success');
      setDeleteTarget(null);
      await refreshTeam();
    } catch (error) {
      console.error(error);
      toast('Failed to delete team member.', 'error');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const filteredTeam = useMemo(() => {
    const query = search.trim().toLowerCase();

    return team.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        titleCase(member.type).toLowerCase().includes(query);

      const matchesRole =
        roleFilter === 'all' || (roleFilter === 'org_admin' ? isAdminType(member.type) : member.type === roleFilter);
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, team]);

  const summary = useMemo(
    () => ({
      totalMembers: team.length,
      admins: team.filter((member) => isAdminType(member.type)).length,
      pendingInvites: team.filter((member) => member.status === 'invited').length,
      activeMembers: team.filter((member) => member.status === 'active').length,
    }),
    [team],
  );

  return (
    <div className="space-y-8 min-h-full">
      <div className="flex flex-col gap-4 pb-4 border-b border-border lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Manage invitations, roles, and access for your recruiting team using the live team API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void refreshTeam()}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={clsx(isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <UserPlus size={18} />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <SummaryCard icon={Users} iconClassName="bg-primary/10 text-primary" label="Total Members" value={summary.totalMembers} />
        <SummaryCard icon={Shield} iconClassName="bg-violet-500/10 text-violet-500" label="Admins" value={summary.admins} />
        <SummaryCard icon={CheckCircle} iconClassName="bg-emerald-500/10 text-emerald-500" label="Active Members" value={summary.activeMembers} />
        <SummaryCard icon={Mail} iconClassName="bg-amber-500/10 text-amber-500" label="Pending Invites" value={summary.pendingInvites} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search team, role, email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={roleFilter}
            onChange={(value) => setRoleFilter(value as TeamRoleValue | 'all')}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'org_admin', label: 'Admin' },
              { value: 'recruiter', label: 'Recruiter' },
              { value: 'interviewer', label: 'Interviewer' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />

          <FilterSelect
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as (typeof STATUS_OPTIONS)[number]['value'])}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {loadError && !isLoading ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">{loadError}</p>
          <p className="text-sm text-muted-foreground mt-1">Use refresh to retry loading the team list.</p>
          <button
            onClick={() => void refreshTeam()}
            className="mt-5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
          >
            Retry
          </button>
        </div>
      ) : null}

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
                <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Loading team members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeam.length ? (
                filteredTeam.map((member) => (
                  <tr key={member.id} className="group transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary uppercase">
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'px-2.5 py-1 rounded-full text-xs font-bold border',
                          isAdminType(member.type)
                            ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                            : member.type === 'recruiter'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              : member.type === 'interviewer'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        )}
                      >
                        {titleCase(member.type || 'member')}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-1 ml-1">{member.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'flex items-center gap-1.5 text-xs font-bold capitalize',
                          member.status === 'active'
                            ? 'text-success'
                            : member.status === 'invited'
                              ? 'text-warning'
                              : 'text-muted-foreground'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            member.status === 'active'
                              ? 'bg-success'
                              : member.status === 'invited'
                                ? 'bg-warning'
                                : 'bg-muted-foreground'
                          )}
                        />
                        {titleCase(member.status || 'unknown')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase size={16} />
                        <span className="font-bold text-foreground">{member.assignedJobs}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="relative inline-flex" ref={openMenuId === member.id ? menuRef : null}>
                        <button
                          type="button"
                          aria-label={`Open actions for ${member.name}`}
                          onClick={() => setOpenMenuId((current) => (current === member.id ? null : member.id))}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === member.id ? (
                          <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-border bg-card shadow-xl p-2 text-left">
                            <MenuAction
                              icon={Pencil}
                              label="Edit member"
                              onClick={async () => {
                                setOpenMenuId(null);

                                try {
                                  const latest = await getTeamMember(member.id);
                                  const nextMember = {
                                    id: latest.id,
                                    name: latest.display_name || `${latest.first_name} ${latest.last_name}`.trim() || latest.username,
                                    role: latest.designation,
                                    type: normalizeUserType(latest.user_type),
                                    status: normalizeStatus(latest.status),
                                    email: latest.email,
                                    assignedJobs: member.assignedJobs,
                                  };
                                  setEditDesignation(nextMember.role);
                                  setEditStatus(nextMember.status);
                                  setEditingMember(nextMember);
                                } catch (error) {
                                  console.error(error);
                                  setEditDesignation(member.role);
                                  setEditStatus(member.status);
                                  setEditingMember(member);
                                }
                              }}
                            />
                            <MenuAction
                              icon={Trash2}
                              label="Delete member"
                              danger
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteTarget(member);
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-base font-bold text-foreground">No matching team members</p>
                      <p className="text-sm text-muted-foreground">Adjust your search or filters, or invite a new member.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isInviteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={(event) => event.target === event.currentTarget && setIsInviteOpen(false)}
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
                    <p className="text-muted-foreground text-xs font-medium">Create a new team access record in the backend.</p>
                  </div>
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                <div>
                  <label htmlFor="team-invite-name" className="block text-xs font-bold text-foreground mb-2">FULL NAME</label>
                  <input
                    id="team-invite-name"
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={inviteFullName}
                    onChange={(event) => setInviteFullName(event.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="team-invite-email" className="block text-xs font-bold text-foreground mb-2">EMAIL ADDRESS</label>
                  <input
                    id="team-invite-email"
                    type="email"
                    placeholder="e.g. sarah@company.com"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-3">ASSIGN ROLE</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TEAM_ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setInviteRole(role.value)}
                        className={clsx(
                          'text-left p-4 rounded-2xl border-2 cursor-pointer transition-all',
                          inviteRole === role.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">{role.label}</span>
                          {inviteRole === role.value && <CheckCircle size={16} className="text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
                      </button>
                    ))}
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
                  disabled={isInviteSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                >
                  {isInviteSubmitting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={(event) => event.target === event.currentTarget && setEditingMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Edit Team Member</h3>
                  <p className="text-muted-foreground text-xs font-medium">Update the member&apos;s designation and status.</p>
                </div>
                <button onClick={() => setEditingMember(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">NAME</label>
                    <div className="px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground">
                      {editingMember.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">EMAIL</label>
                    <div className="px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground break-all">
                      {editingMember.email}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="team-edit-designation" className="block text-xs font-bold text-foreground mb-2">DESIGNATION</label>
                  <input
                    id="team-edit-designation"
                    type="text"
                    value={editDesignation}
                    onChange={(event) => setEditDesignation(event.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="team-edit-status" className="block text-xs font-bold text-foreground mb-2">STATUS</label>
                  <select
                    id="team-edit-status"
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:border-primary text-sm capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
                <button
                  onClick={() => setEditingMember(null)}
                  className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={(event) => event.target === event.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card rounded-3xl w-full max-w-lg border border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex gap-4 items-start bg-muted/20">
                <div className="p-2.5 rounded-xl bg-danger/10 text-danger">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Delete Team Member</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Remove {deleteTarget.name} from the organization. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-6 text-sm text-muted-foreground space-y-2">
                <p>Email: {deleteTarget.email}</p>
                <p>Role: {titleCase(deleteTarget.type || 'member')}</p>
              </div>

              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleteSubmitting}
                  className="px-6 py-2.5 bg-danger text-white rounded-xl text-sm font-bold shadow-lg shadow-danger/20 transition-all disabled:opacity-70"
                >
                  {isDeleteSubmitting ? 'Deleting...' : 'Delete Member'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: number;
}) {
  return (
    <div className="px-5 py-3 bg-card border border-border shadow-sm rounded-2xl flex items-center gap-3">
      <div className={clsx('p-2 rounded-xl', iconClassName)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground appearance-none pr-10 focus:outline-none focus:border-primary shadow-sm hover:bg-muted/50 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function MenuAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
        danger ? 'text-danger hover:bg-danger/10' : 'text-foreground hover:bg-muted'
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}