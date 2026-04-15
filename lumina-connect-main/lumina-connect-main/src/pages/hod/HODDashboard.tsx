import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader, AvatarInitials, StatusBadge, LeaveTypeBadge } from '@/components/shared/UIComponents';
import { getDepartmentStats, getPendingLeaves, getAllFaculty } from '@/data/dataService';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HODDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['deptStats'], queryFn: getDepartmentStats });
  const { data: pendingRequests, isLoading: reqLoading } = useQuery({ queryKey: ['pendingLeaves'], queryFn: getPendingLeaves });
  const { data: allFaculty, isLoading: facLoading } = useQuery({ queryKey: ['allFaculty'], queryFn: getAllFaculty });
  
  if (statsLoading || reqLoading || facLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  if (!stats || !pendingRequests || !allFaculty) return <div className="p-8 text-center text-destructive">Failed to load data.</div>;

  const lowAttendance = [...allFaculty].sort((a: any, b: any) => a.attendanceRatio - b.attendanceRatio).slice(0, 3);
  const absentCount = allFaculty.length - stats.presentToday - stats.onLeaveToday;

  const deptData = [
    { label: 'Present', value: stats.presentToday, color: 'hsl(142, 71%, 45%)' },
    { label: 'Absent', value: absentCount > 0 ? absentCount : 0, color: 'hsl(0, 84%, 60%)' },
    { label: 'On Leave', value: stats.onLeaveToday, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <PageHeader title={`HOD Dashboard — ${user?.department || 'Department'}`} />
        <p className="text-sm text-muted-foreground -mt-4">{user?.name} | {dateStr}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} className="text-primary" />} label="Total Faculty" value={stats.totalFaculty} color="bg-primary/10" />
        <StatCard icon={<Clock size={22} className="text-warning" />} label="Pending Approvals" value={stats.pendingLeaves} color="bg-warning/10" pulse={stats.pendingLeaves > 0} />
        <StatCard icon={<CheckCircle size={22} className="text-success" />} label="Present Today" value={stats.presentToday} color="bg-success/10" />
        <StatCard icon={<XCircle size={22} className="text-destructive" />} label="On Leave Today" value={stats.onLeaveToday} color="bg-destructive/10" />
      </div>

      <div className="space-y-6">
        {/* Pending requests */}
        <div className="bg-card rounded-2xl card-shadow card-3d p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Pending Requests</h3>
            <button onClick={() => navigate('/hod/requests')} className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
               <p className="text-sm text-muted-foreground w-full py-2 text-center">No pending requests.</p>
            ) : pendingRequests.slice(0, 3).map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <AvatarInitials name={req.facultyName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.facultyName}</p>
                    <p className="text-xs text-muted-foreground">{req.leaveType} · {req.fromDate} — {req.toDate}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/hod/requests')} className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => navigate('/hod/requests')} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
