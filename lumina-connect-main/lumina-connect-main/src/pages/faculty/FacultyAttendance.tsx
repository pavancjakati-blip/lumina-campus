import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFacultyAttendance, markAttendance } from '@/data/dataService';
import { PageHeader } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function FacultyAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Modal + marking state
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [marking, setMarking] = useState(false);
  const [markedSuccess, setMarkedSuccess] = useState<{ time: string } | null>(null);

  // Month navigation state — starts on the current month
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const { data: rawRecords = [] } = useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: () => getFacultyAttendance(user!.id),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = rawRecords.find((r: any) => r.date === todayStr);
  const alreadyMarked = todayRecord?.status === 'Present';

  const handleConfirmMark = async () => {
    if (!user) return;
    setMarking(true);
    try {
      const result = await markAttendance(user.id);
      if (result.already_marked) {
        setMarkedSuccess({ time: todayRecord?.markedAt || 'Earlier today' });
      } else if (result.success) {
        setMarkedSuccess({ time: result.record.markedAt });
        queryClient.invalidateQueries({ queryKey: ['attendance', user.id] });
      }
    } catch (e) {
      // silent fail — modal still closes
    }
    setMarking(false);
    setShowMarkModal(false);
  };

  
  const stats = {
    present: rawRecords.filter((r: any) => r.status === 'Present').length,
    absent: rawRecords.filter((r: any) => r.status === 'Absent').length,
    leave: rawRecords.filter((r: any) => r.status === 'On Leave').length,
    holiday: 0,
  };
  const total = stats.present + stats.absent + stats.leave;
  const percentage = total > 0 ? Math.round((stats.present / total) * 100) : 0;
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (percentage / 100) * circumference;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDate = new Date();
  const isCurrentMonth = todayDate.getFullYear() === viewYear && todayDate.getMonth() === viewMonth;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Attendance" subtitle="Track your monthly attendance" />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-card rounded-2xl card-shadow card-3d p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPrevMonth} className="p-1 hover:bg-muted rounded-lg"><ChevronLeft size={20} /></button>
            <h3 className="font-semibold text-foreground">{monthLabel}</h3>
            <button onClick={goToNextMonth} className="p-1 hover:bg-muted rounded-lg"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dateStr = `${viewYear}-${mm}-${dd}`;
              const record = rawRecords.find((r: any) => r.date === dateStr);
              const isToday = isCurrentMonth && day === todayDate.getDate();
              const isFuture = new Date(viewYear, viewMonth, day) > todayDate;
              return (
                <div key={day} className={cn(
                  'aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative',
                  isToday && 'ring-2 ring-primary'
                )}>
                  <span className={cn('text-sm font-medium', isFuture ? 'text-muted-foreground/50' : 'text-foreground')}>{day}</span>
                  <span className={cn(
                    'w-2 h-2 rounded-full mt-0.5',
                    record?.status === 'Present' && 'bg-success',
                    record?.status === 'Absent' && 'bg-destructive',
                    record?.status === 'On Leave' && 'bg-warning',
                    !record && !isFuture && 'bg-foreground/30',
                    isFuture && 'bg-transparent',
                  )} />
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            {[
              { color: 'bg-success', label: 'Present' },
              { color: 'bg-destructive', label: 'Absent' },
              { color: 'bg-warning', label: 'On Leave' },
              { color: 'bg-foreground/30', label: 'Holiday / No Record' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            <MiniStat label="Present" value={stats.present} color="text-success" />
            <MiniStat label="Absent" value={stats.absent} color="text-destructive" />
            <MiniStat label="On Leave" value={stats.leave} color="text-warning" />
            <MiniStat label="Holidays" value={stats.holiday} color="text-muted-foreground" />
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Ring */}
          <div className="bg-card rounded-2xl card-shadow card-3d p-6 flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r="56" fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{percentage}%</span>
                <span className="text-xs text-muted-foreground">Attendance</span>
              </div>
            </div>
            {percentage < 75 && (
              <p className="text-sm text-warning font-medium mt-3 text-center">⚠️ Below minimum 75% threshold</p>
            )}
          </div>

          {/* Mark Attendance Button */}
          {alreadyMarked ? (
            <div className="w-full h-11 rounded-xl bg-success/10 border border-success/30 flex items-center justify-center gap-2 text-success font-medium text-sm">
              <CheckCircle2 size={18} />
              Marked Present at {todayRecord?.markedAt}
            </div>
          ) : (
            <Button onClick={() => setShowMarkModal(true)} className="w-full h-11 rounded-xl">
              Mark Today's Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowMarkModal(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div
            className="relative bg-card rounded-2xl card-shadow p-6 w-full max-w-sm mx-4 animate-scale-in"
            style={{ transform: 'perspective(800px) rotateX(2deg)', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-foreground text-lg mb-4">Mark Today's Attendance</h3>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <Clock size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  <p className="text-xs text-muted-foreground">Current Time (Auto-filled)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Campus — SDMCET</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowMarkModal(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleConfirmMark} disabled={marking} className="flex-1 rounded-xl">
                {marking ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Marking...
                  </span>
                ) : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Success Overlay */}
      {markedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setMarkedSuccess(null)} />
          <div
            className="relative w-full max-w-sm animate-scale-in"
            style={{ perspective: '1000px' }}
          >
            <div
              className="bg-card rounded-3xl p-8 flex flex-col items-center text-center"
              style={{
                transform: 'perspective(1000px) rotateX(4deg)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px -10px rgba(0,0,0,0.3), 0 0 60px rgba(var(--success-rgb, 34,197,94), 0.15)'
              }}
            >
              {/* Glow ring */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-success/20 blur-xl scale-150 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-success/10 border-2 border-success/40 flex items-center justify-center">
                  <CheckCircle2 size={48} className="text-success" strokeWidth={1.5} />
                </div>
              </div>

              {/* Sparkle icons */}
              <Sparkles size={16} className="absolute top-6 right-10 text-warning animate-pulse" />
              <Sparkles size={10} className="absolute top-10 left-8 text-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
              <Sparkles size={12} className="absolute bottom-16 right-8 text-success animate-pulse" style={{ animationDelay: '0.6s' }} />

              <h2 className="text-2xl font-bold text-foreground mb-1">Attendance Marked!</h2>
              <p className="text-muted-foreground text-sm mb-5">You're marked <span className="text-success font-semibold">Present</span> for today</p>

              <div className="w-full bg-muted/60 rounded-2xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-success">{markedSuccess.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-success">✓ Present</span>
                </div>
              </div>

              <button
                onClick={() => setMarkedSuccess(null)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
