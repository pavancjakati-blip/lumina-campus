import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, AvatarInitials } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Mail, Building, BadgeCheck, Hash, LogOut, Lock, X, Users, BookOpen, GraduationCap, Calendar, ArrowRight } from 'lucide-react';
import { getPendingLeaves } from '@/data/dataService';
import { useNavigate } from 'react-router-dom';

const notifPrefs = [
  { key: 'newRequests', label: 'New leave requests' },
  { key: 'lowAttendance', label: 'Low attendance alerts' },
  { key: 'deadlines', label: 'Deadline reminders' },
];

export default function HODProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ newRequests: true, lowAttendance: true, deadlines: true });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const pendingCount = getPendingLeaves().length;

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profile" />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl card-shadow card-3d p-6 flex flex-col items-center text-center">
            <AvatarInitials name={user.name} size="lg" />
            <h2 className="text-xl font-bold text-foreground mt-3">{user.name}</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
              Head of Department
            </span>
            <div className="w-full mt-4 space-y-2 text-sm">
              <InfoRow icon={<Building size={14} />} value={user.department} />
              <InfoRow icon={<Hash size={14} />} value={user.employeeId} />
              <InfoRow icon={<Mail size={14} />} value={user.email} />
            </div>
          </div>

          {/* Department stats */}
          <div className="bg-card rounded-2xl card-shadow card-3d p-5">
            <h3 className="font-semibold text-foreground mb-4">Department Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={<Users size={16} />} label="Total Faculty" value="24" />
              <MiniStat icon={<BookOpen size={16} />} label="Subjects" value="42" />
              <MiniStat icon={<GraduationCap size={16} />} label="Semester" value="Even 2026" />
              <MiniStat icon={<Calendar size={16} />} label="Academic Year" value="2025-26" />
            </div>
          </div>

          {/* Pending actions */}
          <div className="bg-card rounded-2xl card-shadow card-3d p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">My Pending Actions</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{pendingCount} approvals awaiting</p>
              </div>
              <button onClick={() => navigate('/hod/requests')} className="text-sm text-primary hover:underline flex items-center gap-1">
                Review <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl card-shadow card-3d p-5">
            <h3 className="font-semibold text-foreground mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {notifPrefs.map(p => (
                <div key={p.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">{p.label}</span>
                  <Switch
                    checked={prefs[p.key as keyof typeof prefs]}
                    onCheckedChange={(checked) => setPrefs(prev => ({ ...prev, [p.key]: checked }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl card-shadow card-3d p-5 space-y-3">
            <Button variant="outline" onClick={() => setShowPasswordModal(true)} className="w-full rounded-xl justify-start gap-2">
              <Lock size={16} /> Change Password
            </Button>
            <Button variant="outline" onClick={logout} className="w-full rounded-xl justify-start gap-2 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowPasswordModal(false)}>
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative bg-card rounded-2xl card-shadow card-3d p-6 w-full max-w-sm mx-4 animate-scale-in space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}><X size={18} /></button>
            </div>
            <Input type="password" placeholder="Current password" className="h-11 rounded-xl" />
            <Input type="password" placeholder="New password" className="h-11 rounded-xl" />
            <Input type="password" placeholder="Confirm new password" className="h-11 rounded-xl" />
            <Button className="w-full rounded-xl">Update Password</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-muted-foreground">
      {icon}
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-2">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
