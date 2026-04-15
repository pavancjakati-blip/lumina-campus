import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createLeaveApplication, getDepartmentHOD } from '@/data/dataService';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Upload, X, CheckCircle, ArrowLeft } from 'lucide-react';

const leaveTypes = ['Casual Leave', 'Medical Leave', 'Duty Leave', 'Emergency Leave', 'Compensatory Leave'];

export default function ApplyLeave() {
  const { user } = useAuth();

  // Fetch real HOD name for this department
  const { data: hodData } = useQuery({
    queryKey: ['deptHOD', user?.departmentId],
    queryFn: () => getDepartmentHOD(user!.departmentId!),
    enabled: !!user?.departmentId,
    staleTime: 60000,
  });
  const hodName = hodData?.name || 'your HOD';

  const [form, setForm] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    substituteArranged: false,
    substituteName: '',
    document: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const duration = form.fromDate && form.toDate
    ? Math.max(1, Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.leaveType) e.leaveType = 'Select leave type';
    if (!form.fromDate) e.fromDate = 'Select start date';
    if (!form.toDate) e.toDate = 'Select end date';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    if (form.substituteArranged && !form.substituteName.trim()) e.substituteName = 'Enter substitute name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await createLeaveApplication({
        facultyId: user?.id,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        duration,
        reason: form.reason,
        substituteArranged: form.substituteArranged,
        substituteName: form.substituteName,
        documentAttached: !!form.document
      });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto animate-checkmark">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Application Submitted!</h2>
          <p className="text-muted-foreground">HOD {hodName} will review your request.</p>
          <Button onClick={() => { setSubmitted(false); setForm({ leaveType: '', fromDate: '', toDate: '', reason: '', substituteArranged: false, substituteName: '', document: null }); }} variant="outline" className="rounded-xl mt-4">
            <ArrowLeft size={16} /> Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="New Leave Application" subtitle="Fill in the details below to submit your leave request" />

      <div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Leave Type</label>
            <select
              value={form.leaveType}
              onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.leaveType && <p className="text-xs text-destructive">{errors.leaveType}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className="h-11 rounded-xl" />
              {errors.fromDate && <p className="text-xs text-destructive">{errors.fromDate}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input type="date" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className="h-11 rounded-xl" />
              {errors.toDate && <p className="text-xs text-destructive">{errors.toDate}</p>}
            </div>
          </div>

          {duration > 0 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              {duration} Working Day{duration > 1 ? 's' : ''}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Provide details for your leave request..."
              rows={3}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
          </div>

          {/* Substitute */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.substituteArranged}
                onCheckedChange={(checked) => setForm(f => ({ ...f, substituteArranged: checked }))}
              />
              <label className="text-sm font-medium text-foreground">Substitute Arrangement</label>
            </div>
            {form.substituteArranged && (
              <div className="space-y-2 animate-fade-in">
                <Input
                  value={form.substituteName}
                  onChange={e => setForm(f => ({ ...f, substituteName: e.target.value }))}
                  placeholder="Substitute Faculty Name"
                  className="h-11 rounded-xl"
                />
                {errors.substituteName && <p className="text-xs text-destructive">{errors.substituteName}</p>}
              </div>
            )}
          </div>

          {/* Document upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Supporting Document</label>
            {form.document ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <span className="text-sm text-foreground flex-1 truncate">{form.document.name}</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, document: null }))} className="text-muted-foreground hover:text-destructive">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload size={24} className="text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Drop file here or <span className="text-primary">browse</span></span>
                <input type="file" className="hidden" onChange={e => e.target.files?.[0] && setForm(f => ({ ...f, document: e.target.files![0] }))} />
              </label>
            )}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl">
            Submit to HOD
          </Button>
        </form>
      </div>
    </div>
  );
}
