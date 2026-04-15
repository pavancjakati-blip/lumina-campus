import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/shared/UIComponents';
import { CalendarDays, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { getFacultyTodaySchedule, getFacultyLeaveBalance, getFacultyLeaves, getFacultyNotifications, getFacultyAttendance } from '@/data/dataService';
import { useQuery } from '@tanstack/react-query';

export default function FacultyHome() {
  const { user } = useAuth();
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  // Load data for user
  const { data: schedule = [] } = useQuery({ queryKey: ['schedule', user?.id], queryFn: () => getFacultyTodaySchedule(user!.id), enabled: !!user });
  const { data: leaveBalance } = useQuery({ queryKey: ['leaveBalance', user?.id], queryFn: () => getFacultyLeaveBalance(user!.id), enabled: !!user });
  const { data: rawLeaves = [] } = useQuery({ queryKey: ['leaves', user?.id], queryFn: () => getFacultyLeaves(user!.id), enabled: !!user });
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications', user?.id], queryFn: () => getFacultyNotifications(user!.id), enabled: !!user });
  const { data: attendance = [] } = useQuery({ queryKey: ['attendance', user?.id], queryFn: () => getFacultyAttendance(user!.id), enabled: !!user });

  const leavesRemaining = leaveBalance ? leaveBalance.casualLeave.remaining : 0;
  const pendingRequests = rawLeaves.filter(l => l.status === 'Pending').length;
  
  // present this month
  const currentMonthStr = today.toISOString().slice(0, 7);
  const thisMonthAtt = attendance.filter(a => a.date.startsWith(currentMonthStr));
  const presentCount = thisMonthAtt.filter(a => a.status === 'Present').length;
  const presentStr = `${presentCount}/${thisMonthAtt.length || 0}`;

  // Upcoming Leave
  const upcomingLeave = rawLeaves.find(l => l.status === 'Approved' && new Date(l.fromDate) > today);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${greeting}, ${user?.name} 👋`}
        subtitle={dateStr}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CalendarDays size={22} className="text-primary" />} label="C.L Remaining" value={leavesRemaining} color="bg-primary/10" />
        <StatCard icon={<Clock size={22} className="text-warning" />} label="Pending Requests" value={pendingRequests} color="bg-warning/10" pulse={pendingRequests > 0} />
        <StatCard icon={<CheckCircle size={22} className="text-success" />} label="Present This Month" value={presentStr} color="bg-success/10" />
        <StatCard icon={<AlertCircle size={22} className="text-secondary" />} label="Upcoming Leave" value={upcomingLeave ? upcomingLeave.fromDate.substring(5) : 'None'} color="bg-secondary/10" />
      </div>

      <div className="space-y-6">
        {/* Today's Schedule */}
        <div className="bg-card rounded-2xl card-shadow card-3d p-5">
          <h3 className="font-semibold text-foreground mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {schedule.length === 0 ? (
              <p className="text-sm text-muted-foreground w-full py-4 text-center">No schedule mapped for today.</p>
            ) : (
              schedule.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground w-20">{item.startTime}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{item.room} | Sec: {item.section}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-success/10 text-success`}>
                    Scheduled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
