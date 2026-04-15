import { useState } from 'react';
import { getFacultyLeaves } from '@/data/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge, LeaveTypeBadge, PageHeader } from '@/components/shared/UIComponents';
import { cn } from '@/lib/utils';
import { X, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const filters = ['All', 'Pending', 'Approved', 'Rejected'];

export default function MyLeaves() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);

  const { data: myLeaves = [] } = useQuery({ queryKey: ['leaves', user?.id], queryFn: () => getFacultyLeaves(user!.id), enabled: !!user });
  const filtered = filter === 'All' ? myLeaves : myLeaves.filter(l => l.status.toLowerCase() === filter.toLowerCase());
  const selectedLeave = myLeaves.find(l => l.id === selected);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Leaves" subtitle="Track all your leave applications" />

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FileText size={48} className="mx-auto text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground">No leave applications yet</h3>
          <p className="text-sm text-muted-foreground">Click 'Apply Leave' to get started.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className={cn('space-y-3', selected ? 'lg:col-span-3' : 'lg:col-span-5')}>
            {filtered.map(leave => (
              <div
                key={leave.id}
                onClick={() => setSelected(leave.id)}
                className={cn(
                  'bg-card rounded-2xl card-shadow card-3d p-4 cursor-pointer transition-all border-l-4',
                  leave.status === 'pending' && 'border-l-warning',
                  leave.status === 'approved' && 'border-l-success',
                  leave.status === 'rejected' && 'border-l-destructive',
                  selected === leave.id && 'ring-2 ring-primary/20'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <LeaveTypeBadge type={leave.leaveType} />
                      <StatusBadge status={leave.status} />
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {leave.fromDate !== leave.toDate && ` — ${new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      <span className="text-muted-foreground font-normal"> · {leave.duration} day{leave.duration > 1 ? 's' : ''}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{leave.reason}</p>
                  </div>
                </div>
                {leave.hodRemarks && (
                  <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border-l-2 border-primary/30">
                    <p className="text-xs text-muted-foreground italic">"{leave.hodRemarks}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedLeave && (
            <div className="lg:col-span-2 hidden lg:block">
              <div className="bg-card rounded-2xl card-shadow card-3d p-5 sticky top-24 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Leave Details</h3>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LeaveTypeBadge type={selectedLeave.leaveType} />
                    <StatusBadge status={selectedLeave.status} />
                  </div>
                  <div className="text-sm space-y-2">
                    <p><span className="text-muted-foreground">Duration:</span> <span className="text-foreground font-medium">{selectedLeave.duration} day{selectedLeave.duration > 1 ? 's' : ''}</span></p>
                    <p><span className="text-muted-foreground">From:</span> <span className="text-foreground">{selectedLeave.fromDate}</span></p>
                    <p><span className="text-muted-foreground">To:</span> <span className="text-foreground">{selectedLeave.toDate}</span></p>
                    <p><span className="text-muted-foreground">Reason:</span> <span className="text-foreground">{selectedLeave.reason}</span></p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground">Timeline</h4>
                    <TimelineStep icon={<CheckCircle size={16} />} label="Submitted" date={new Date(selectedLeave.appliedOn).toLocaleDateString()} done />
                    <TimelineStep icon={<Clock size={16} />} label="Under Review" date="" done={selectedLeave.status !== 'pending'} active={selectedLeave.status === 'pending'} />
                    <TimelineStep
                      icon={selectedLeave.status === 'rejected' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      label={selectedLeave.status === 'pending' ? 'Decision' : selectedLeave.status === 'approved' ? 'Approved' : 'Rejected'}
                      date={selectedLeave.status !== 'Pending' ? new Date(selectedLeave.appliedOn).toLocaleDateString() : ''}
                      done={selectedLeave.status !== 'pending'}
                    />
                  </div>

                  {selectedLeave.status === 'pending' && (
                    <button className="w-full py-2 rounded-xl border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                      Cancel Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile bottom sheet */}
      {selectedLeave && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative w-full bg-card rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-lg">Leave Details</h3>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LeaveTypeBadge type={selectedLeave.leaveType} />
                <StatusBadge status={selectedLeave.status} />
              </div>
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Duration:</span> <span className="text-foreground font-medium">{selectedLeave.duration} day{selectedLeave.duration > 1 ? 's' : ''}</span></p>
                <p><span className="text-muted-foreground">From:</span> <span className="text-foreground">{selectedLeave.fromDate}</span></p>
                <p><span className="text-muted-foreground">To:</span> <span className="text-foreground">{selectedLeave.toDate}</span></p>
                <p><span className="text-muted-foreground">Reason:</span> <span className="text-foreground">{selectedLeave.reason}</span></p>
              </div>
              {selectedLeave.hodRemarks && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary/30">
                  <p className="text-sm text-muted-foreground italic">"{selectedLeave.hodRemarks}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineStep({ icon, label, date, done, active }: { icon: React.ReactNode; label: string; date: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center',
        done ? 'bg-success/10 text-success' : active ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
      )}>{icon}</div>
      <div>
        <p className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>{label}</p>
        {date && <p className="text-xs text-muted-foreground">{date}</p>}
      </div>
    </div>
  );
}
