import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
      s === 'pending' && 'bg-warning/10 text-warning',
      s === 'approved' && 'bg-success/10 text-success',
      s === 'rejected' && 'bg-destructive/10 text-destructive',
    )}>
      {s === 'pending' && '🕐 '}
      {s === 'approved' && '✅ '}
      {s === 'rejected' && '❌ '}
      {status}
    </span>
  );
}

export function LeaveTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {type}
    </span>
  );
}

export function AvatarInitials({ name, size = 'default' }: { name: string; size?: 'sm' | 'default' | 'lg' }) {
  const initials = name.split(' ').filter(n => !['Prof.', 'Dr.'].includes(n)).map(n => n[0]).join('').slice(0, 2);
  const sizes = { sm: 'w-8 h-8 text-xs', default: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  return (
    <div className={cn('rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold', sizes[size])}>
      {initials}
    </div>
  );
}

export function StatCard({ icon, label, value, color, pulse }: { icon: React.ReactNode; label: string; value: string | number; color: string; pulse?: boolean }) {
  return (
    <div className="stat-card flex items-center gap-4 animate-fade-in">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center relative', color)}>
        {icon}
        {pulse && <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse-dot" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
