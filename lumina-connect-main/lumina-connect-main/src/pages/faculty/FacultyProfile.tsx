import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, AvatarInitials } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Mail, Building, BadgeCheck, Hash, LogOut, Lock, X } from 'lucide-react';

const leaveBalances = [
  { type: 'Casual', remaining: 5, total: 10 },
  { type: 'Medical', remaining: 3, total: 5 },
  { type: 'Duty', remaining: 2, total: 5 },
  { type: 'Compensatory', remaining: 1, total: 3 },
];

const notifPrefs = [
  { key: 'leave', label: 'Leave updates' },
  { key: 'attendance', label: 'Attendance alerts' },
  { key: 'hod', label: 'HOD messages' },
];

export default function FacultyProfile() {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState({ leave: true, attendance: true, hod: true });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
            <p className="text-sm text-muted-foreground">{user.designation}</p>
            <div className="w-full mt-4 space-y-2 text-sm">
              <InfoRow icon={<Building size={14} />} value={user.department} />
              <InfoRow icon={<Hash size={14} />} value={user.employeeId} />
              <InfoRow icon={<Mail size={14} />} value={user.email} />
              <InfoRow icon={<BadgeCheck size={14} />} value={user.role.toUpperCase()} />
            </div>
          </div>

          {/* Leave Balance */}
          <div className="bg-card rounded-2xl card-shadow card-3d p-5">
            <h3 className="font-semibold text-foreground mb-4">Leave Balance</h3>
            <div className="space-y-3">
              {leaveBalances.map(b => (
                <div key={b.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.type}</span>
                    <span className="font-medium text-foreground">{b.remaining}/{b.total}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${(b.remaining / b.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
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

      {/* Password Modal */}
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
