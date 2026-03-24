import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, X, Check, Camera, Mail, Phone, Building, Save } from 'lucide-react';
import { clsx } from 'clsx';

function CookieModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [preferences, setPreferences] = useState({
    performance: true,
    functional: true,
    targeting: false,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-card rounded-3xl w-full max-w-lg border border-border shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground">Cookie Preferences</h3>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-muted-foreground mb-4">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
            </p>

            <div className="space-y-4 bg-muted/20 p-4 border border-border rounded-2xl">
              {/* Strictly Necessary */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Strictly Necessary</h4>
                  <p className="text-xs text-muted-foreground">Always active to ensure site functionality.</p>
                </div>
                <div className="w-10 h-6 bg-success/20 rounded-full flex items-center pl-1 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-success" />
                </div>
              </div>

              {[
                { key: 'performance' as const, label: 'Performance', desc: 'Helps us understand how visitors interact with the site.' },
                { key: 'functional' as const, label: 'Functional', desc: 'Enables enhanced functionality and personalization.' },
                { key: 'targeting' as const, label: 'Targeting', desc: 'Used to build a profile of your interests.' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })}
                >
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{label}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div className={clsx('w-10 h-6 rounded-full flex items-center px-1 transition-colors', preferences[key] ? 'bg-primary' : 'bg-muted-foreground/30')}>
                    <div className={clsx('w-4 h-4 rounded-full bg-white transition-transform', preferences[key] ? 'translate-x-4' : 'translate-x-0')} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Save Preferences
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---- Profile Tab ----
function ProfileTab() {
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah@interviehire.ai',
    phone: '+1 (555) 000-1234',
    company: 'InterviewHire Inc.',
    role: 'Head of Talent',
    bio: 'Passionate about building world-class hiring experiences.',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">Profile Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your personal information and public profile.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-2xl">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-lg text-white shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Camera size={12} />
          </button>
        </div>
        <div>
          <p className="font-bold text-foreground">{profile.firstName} {profile.lastName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{profile.role} · {profile.company}</p>
          <button type="button" className="text-xs text-primary font-bold hover:underline mt-1">
            Upload new photo
          </button>
        </div>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
            <Mail size={10} className="inline mr-1" />Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
            <Phone size={10} className="inline mr-1" />Phone
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
      </div>

      {/* Company + Role */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
            <Building size={10} className="inline mr-1" />Company
          </label>
          <input
            type="text"
            value={profile.company}
            onChange={e => setProfile({ ...profile, company: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Role</label>
          <input
            type="text"
            value={profile.role}
            onChange={e => setProfile({ ...profile, role: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Bio</label>
        <textarea
          rows={3}
          value={profile.bio}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground transition-all resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved
              ? 'bg-success text-white shadow-success/20'
              : 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
          )}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}

// ---- Notifications Tab ----
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newCandidate: true,
    stageComplete: true,
    weeklyReport: false,
    teamActivity: true,
    hiringMilestone: true,
    productUpdates: false,
  });
  const [saved, setSaved] = useState(false);

  const groups = [
    {
      title: 'Candidates',
      items: [
        { key: 'newCandidate' as const, label: 'New candidate applied', desc: 'Get notified when someone applies to a job.' },
        { key: 'stageComplete' as const, label: 'Stage completed', desc: 'When a candidate finishes a screening stage.' },
        { key: 'hiringMilestone' as const, label: 'Hiring milestones', desc: 'Offer accepted, rejected, or withdrawn.' },
      ],
    },
    {
      title: 'Team & Reports',
      items: [
        { key: 'weeklyReport' as const, label: 'Weekly digest', desc: 'Summary of hiring activity every Monday.' },
        { key: 'teamActivity' as const, label: 'Team activity', desc: 'When team members add notes or make decisions.' },
        { key: 'productUpdates' as const, label: 'Product updates', desc: 'New features and platform improvements.' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose which events you want to be notified about.</p>
      </div>

      {groups.map(group => (
        <div key={group.title}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{group.title}</p>
          <div className="space-y-2 bg-muted/20 border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {group.items.map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <div
                  onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
                  className={clsx('w-10 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer', prefs[key] ? 'bg-primary' : 'bg-muted-foreground/30')}
                >
                  <div className={clsx('w-4 h-4 rounded-full bg-white transition-transform shadow-sm', prefs[key] ? 'translate-x-4' : 'translate-x-0')} />
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
            saved ? 'bg-success text-white shadow-success/20' : 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
          )}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
        </button>
      </div>
    </div>
  );
}

// ---- Data & Privacy Tab ----
function DataPrivacyTab({ onOpenCookies }: { onOpenCookies: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground">Data & Privacy</h3>
        <p className="text-sm text-muted-foreground mt-1">Manage your data sharing and cookie tracking preferences.</p>
      </div>

      <div className="p-6 border border-border rounded-2xl bg-muted/30 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-foreground">Cookie Tracking Center</h4>
          <p className="text-xs text-muted-foreground mt-1">Control how we use tracking cookies on your device.</p>
        </div>
        <button
          onClick={onOpenCookies}
          className="px-5 py-2.5 bg-background border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          Manage Cookies
        </button>
      </div>

      <div className="p-6 border border-border rounded-2xl bg-muted/30">
        <h4 className="font-bold text-foreground">Download My Data</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Export a copy of all your profile and hiring data.</p>
        <button className="px-5 py-2.5 bg-background border border-border text-foreground hover:bg-muted rounded-xl text-sm font-bold transition-colors shadow-sm">
          Request Export
        </button>
      </div>

      <div className="p-6 border border-danger/20 rounded-2xl bg-danger/5">
        <h4 className="font-bold text-danger">Delete Account</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="px-5 py-2.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl text-sm font-bold transition-colors border border-danger/20">
          Delete My Account
        </button>
      </div>
    </div>
  );
}

// ---- Main Settings View ----
export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Data & Privacy', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile': return <ProfileTab />;
      case 'Notifications': return <NotificationsTab />;
      case 'Data & Privacy': return <DataPrivacyTab onOpenCookies={() => setIsCookieModalOpen(true)} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 min-h-full">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, team, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Nav Tabs */}
        <div className="w-full md:w-56 space-y-1 flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={18} />
                {tab.id}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-3xl border border-border shadow-sm p-8 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CookieModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
    </div>
  );
}
