import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllFaculty } from '@/data/dataService';
import { PageHeader, AvatarInitials } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Bell, X, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function HODFacultyAttendance() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showBulkNotify, setShowBulkNotify] = useState(false);
  const [threshold, setThreshold] = useState(75);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);

  useEffect(() => {
    getAllFaculty().then((data) => setFacultyMembers(Array.isArray(data) ? data : []));
  }, []);

  const filtered = facultyMembers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedFac = facultyMembers.find(f => f.id === selected);
  const belowThreshold = facultyMembers.filter(f => f.attendanceRatio < threshold);

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Faculty Attendance" subtitle="Monitor and manage department attendance" />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Faculty list */}
        <div className={cn(selected ? 'lg:col-span-2' : 'lg:col-span-5')}>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search faculty..."
              className="pl-9 h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
               <p className="text-sm text-muted-foreground py-4 text-center">No faculty found.</p>
            ) : filtered.map(f => (
              <div
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={cn(
                  'bg-card rounded-xl card-shadow card-3d p-4 cursor-pointer transition-all',
                  selected === f.id && 'ring-2 ring-primary/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <AvatarInitials name={f.name} size="sm" />
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                        f.presentToday ? 'bg-success' : 'bg-destructive'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn('text-lg font-bold', f.attendanceRatio < 75 ? 'text-destructive' : 'text-foreground')}>{f.attendanceRatio}%</p>
                    </div>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', f.attendanceRatio < 75 ? 'bg-destructive' : f.attendanceRatio < 85 ? 'bg-warning' : 'bg-success')}
                        style={{ width: `${f.attendanceRatio}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedFac && (
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-card rounded-2xl card-shadow card-3d p-5 sticky top-24 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{selectedFac.name}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="url(#grad2)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (selectedFac.attendanceRatio / 100) * circumference} />
                    <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground">{selectedFac.attendanceRatio}%</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{selectedFac.designation}</p>
                  <p className="text-muted-foreground">{selectedFac.email}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', selectedFac.presentToday ? 'bg-success' : 'bg-destructive')} />
                    <span className="text-xs">{selectedFac.presentToday ? 'Present Today' : 'Absent Today'}</span>
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowNotifyModal(true)} className="w-full rounded-xl gap-2">
                <Bell size={16} /> Send Attendance Notification
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk notify FAB */}
      <button
        onClick={() => setShowBulkNotify(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl card-shadow flex items-center justify-center hover:scale-105 transition-transform z-20"
        title="Bulk Notify"
      >
        <Bell size={22} />
      </button>

      {/* Notify modal */}
      {showNotifyModal && (
        <Modal onClose={() => setShowNotifyModal(false)} title="Send Notification">
          <p className="text-sm text-muted-foreground mb-3">Send attendance notification to {selectedFac?.name}</p>
          <textarea
            defaultValue={`Dear ${selectedFac?.name},\n\nYour current attendance is ${selectedFac?.attendanceRatio}%. Please ensure to maintain the minimum required attendance of 75%.\n\nRegards,\n${user?.name || 'HOD'}\n${user?.department || 'Department'}`}
            className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
          />
          <Button onClick={() => setShowNotifyModal(false)} className="w-full rounded-xl gap-2"><Send size={16} /> Send Notification</Button>
        </Modal>
      )}

      {/* Bulk notify modal */}
      {showBulkNotify && (
        <Modal onClose={() => setShowBulkNotify(false)} title="Bulk Notify Faculty">
          <p className="text-sm text-muted-foreground mb-4">Notify all faculty below attendance threshold</p>
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-foreground">Threshold: {threshold}%</label>
            <input
              type="range" min={50} max={90} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {belowThreshold.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No faculty below {threshold}%</p>
            ) : belowThreshold.map(f => (
              <div key={f.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-foreground">{f.name}</span>
                <span className="text-sm font-medium text-destructive">{f.attendanceRatio}%</span>
              </div>
            ))}
          </div>
          {belowThreshold.length > 0 && (
            <Button onClick={() => setShowBulkNotify(false)} className="w-full rounded-xl gap-2">
              <Send size={16} /> Notify {belowThreshold.length} Faculty
            </Button>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20" />
      <div className="relative bg-card rounded-2xl card-shadow card-3d p-6 w-full max-w-md mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
