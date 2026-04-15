import { useState, useEffect } from 'react';
import { getAllLeaveApplications, reviewLeaveApplication } from '@/data/dataService';
import { StatusBadge, LeaveTypeBadge, AvatarInitials, PageHeader } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, CheckCircle, XCircle, Clock, MessageSquare, FileDown, Paperclip } from 'lucide-react';

const filterTabs = ['Pending', 'Approved', 'Rejected', 'All'];

export default function HODLeaveRequests() {
  const [filter, setFilter] = useState('Pending');
  const [selected, setSelected] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    getAllLeaveApplications().then(setRequests);
  }, []);
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const filtered = filter === 'All' ? requests : requests.filter(l => l.status?.toLowerCase() === filter.toLowerCase());
  const selectedReq = requests.find(r => r.id === selected);
  const pendingCount = requests.filter(r => r.status?.toLowerCase() === 'pending').length;

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    await reviewLeaveApplication(id, newStatus, remarks);
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: newStatus, hodRemarks: remarks || undefined, decidedAt: new Date().toISOString() } : r
    ));
    setRemarks('');
    setShowConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Leave Requests" subtitle="Review and manage faculty leave applications" />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTabs.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors relative',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f}
            {f === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className={cn('space-y-3', selected ? 'lg:col-span-2' : 'lg:col-span-5')}>
          {filtered.map(req => (
            <div
              key={req.id}
              onClick={() => setSelected(req.id)}
              className={cn(
                'bg-card rounded-2xl card-shadow card-3d p-4 cursor-pointer transition-all border-l-4',
                req.status?.toLowerCase() === 'pending' && 'border-l-warning',
                req.status?.toLowerCase() === 'approved' && 'border-l-success',
                req.status?.toLowerCase() === 'rejected' && 'border-l-destructive',
                selected === req.id && 'ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                <AvatarInitials name={req.facultyName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{req.facultyName}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{req.designation}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <LeaveTypeBadge type={req.leaveType} />
                    <span className="text-xs text-muted-foreground">{req.fromDate} — {req.toDate} · {req.duration}d</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{req.reason}</p>
                  {req.document && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                      <Paperclip size={12} /> {req.document}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel - desktop */}
        {selectedReq && (
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-card rounded-2xl card-shadow card-3d p-5 sticky top-24 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Request Details</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <RequestDetail
                req={selectedReq}
                remarks={remarks}
                setRemarks={setRemarks}
                onAction={(action) => setShowConfirm({ id: selectedReq.id, action })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail - bottom sheet */}
      {selectedReq && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative w-full bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
            <RequestDetail
              req={selectedReq}
              remarks={remarks}
              setRemarks={setRemarks}
              onAction={(action) => setShowConfirm({ id: selectedReq.id, action })}
            />
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowConfirm(null)}>
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative bg-card rounded-2xl card-shadow card-3d p-6 w-full max-w-sm mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              {showConfirm.action === 'approve' ? 'Approve' : 'Reject'} Leave Request?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">This action will notify the faculty member.</p>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add optional remarks..."
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={() => handleAction(showConfirm.id, showConfirm.action)}
                className={cn('flex-1 rounded-xl', showConfirm.action === 'reject' && 'bg-destructive hover:bg-destructive/90')}
              >
                {showConfirm.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestDetail({ req, remarks, setRemarks, onAction }: {
  req: any;
  remarks: string;
  setRemarks: (v: string) => void;
  onAction: (action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AvatarInitials name={req.facultyName} />
        <div>
          <p className="font-medium text-foreground">{req.facultyName}</p>
          <p className="text-xs text-muted-foreground">{req.designation}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LeaveTypeBadge type={req.leaveType} />
        <StatusBadge status={req.status} />
      </div>

      <div className="text-sm space-y-2">
        <p><span className="text-muted-foreground">Duration:</span> <span className="font-medium text-foreground">{req.duration} day{req.duration > 1 ? 's' : ''}</span></p>
        <p><span className="text-muted-foreground">Period:</span> <span className="text-foreground">{req.fromDate} — {req.toDate}</span></p>
        <p><span className="text-muted-foreground">Reason:</span> <span className="text-foreground">{req.reason}</span></p>
        {req.substituteName && <p><span className="text-muted-foreground">Substitute:</span> <span className="text-foreground">{req.substituteName}</span></p>}
        {req.document && (
          <div className="flex items-center gap-2 text-primary">
            <Paperclip size={14} /> <span className="underline cursor-pointer">{req.document}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground">Timeline</h4>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center"><CheckCircle size={16} /></div>
          <div><p className="text-sm font-medium text-foreground">Submitted</p><p className="text-xs text-muted-foreground">{new Date(req.appliedOn).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', req.status?.toLowerCase() === 'pending' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>
            <Clock size={16} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{req.status?.toLowerCase() === 'pending' ? 'Under Review' : 'Reviewed'}</p>
        </div>
      </div>

      {req.status?.toLowerCase() === 'pending' && (
        <div className="space-y-3 pt-4 border-t border-border">
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Add remarks for faculty..."
            className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={() => onAction('approve')} className="flex-1 rounded-xl bg-success hover:bg-success/90">
              <CheckCircle size={16} /> Approve
            </Button>
            <Button onClick={() => onAction('reject')} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90">
              <XCircle size={16} /> Reject
            </Button>
          </div>
          <Button variant="outline" className="w-full rounded-xl gap-2">
            <MessageSquare size={16} /> Request More Info
          </Button>
        </div>
      )}

      {req.hodRemarks && (
        <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary/30">
          <p className="text-sm text-muted-foreground italic">"{req.hodRemarks}"</p>
        </div>
      )}
    </div>
  );
}
