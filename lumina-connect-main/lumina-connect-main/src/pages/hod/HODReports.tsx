import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/UIComponents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Share2, FileText, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { getAllFaculty, getFacultyAttendance, getFacultyLeaves } from '@/data/dataService';

const leaveData = [
  { month: 'Nov', casual: 8, medical: 3, duty: 2, emergency: 1 },
  { month: 'Dec', casual: 5, medical: 4, duty: 3, emergency: 2 },
  { month: 'Jan', casual: 10, medical: 2, duty: 1, emergency: 0 },
  { month: 'Feb', casual: 7, medical: 5, duty: 4, emergency: 1 },
  { month: 'Mar', casual: 6, medical: 3, duty: 2, emergency: 3 },
  { month: 'Apr', casual: 9, medical: 4, duty: 3, emergency: 1 },
];

const attendanceData = [
  { month: 'Nov', avg: 88 },
  { month: 'Dec', avg: 85 },
  { month: 'Jan', avg: 82 },
  { month: 'Feb', avg: 86 },
  { month: 'Mar', avg: 84 },
  { month: 'Apr', avg: 81 },
];

const datePresets = ['This Month', 'Last Month', 'This Semester', 'Custom'];

const reportCards = [
  { title: 'Leave Summary Report', desc: 'Breakdown of leaves by type per month', icon: BarChart3, type: 'leave' },
  { title: 'Monthly Attendance Report', desc: 'Department average attendance trends', icon: TrendingUp, type: 'attendance' },
  { title: 'Faculty-wise Attendance', desc: 'Sortable table with individual stats', icon: FileText, type: 'table' },
  { title: 'Approval Turnaround', desc: 'Average time to approve/reject requests', icon: Clock, type: 'turnaround' },
];

export default function HODReports() {
  const [activePreset, setActivePreset] = useState('This Month');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'pct'>('pct');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [facultyTableData, setFacultyTableData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allFac = await getAllFaculty();
      const tableData = await Promise.all(
        allFac.map(async (f: any) => {
          const attendance = await getFacultyAttendance(f.id);
          const leaves = await getFacultyLeaves(f.id);
          const present = attendance.filter((a: any) => a.status === 'Present').length;
          const absent = attendance.filter((a: any) => a.status === 'Absent').length;
          const leave = leaves.length;
          return {
            name: f.name,
            dept: f.department,
            present,
            absent,
            leave,
            pct: f.attendanceRatio
          };
        })
      );
      setFacultyTableData(tableData);
    };
    loadData();
  }, []);

  const sortedTable = [...facultyTableData].sort((a, b) => {
    const val = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'name') return a.name.localeCompare(b.name) * val;
    return (a.pct - b.pct) * val;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Analytics and insights for your department" />

      {/* Date presets */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {datePresets.map(p => (
          <button
            key={p}
            onClick={() => setActivePreset(p)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              activePreset === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {reportCards.map(card => (
          <div key={card.type}>
            <div
              onClick={() => setExpandedReport(expandedReport === card.type ? null : card.type)}
              className={cn(
                'bg-card rounded-2xl card-shadow card-3d p-5 cursor-pointer transition-all',
                expandedReport === card.type && 'ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <card.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded report */}
      {expandedReport && (
        <div className="bg-card rounded-2xl card-shadow card-3d p-5 animate-fade-in">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">
              {reportCards.find(r => r.type === expandedReport)?.title}
            </h3>
          </div>

          {expandedReport === 'leave' && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="casual" name="Casual" fill="hsl(244, 58%, 51%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medical" name="Medical" fill="hsl(187, 94%, 43%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="duty" name="Duty" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="emergency" name="Emergency" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {expandedReport === 'attendance' && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" name="Avg Attendance %" stroke="hsl(244, 58%, 51%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {expandedReport === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium cursor-pointer" onClick={() => { setSortKey('name'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Name</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Present</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Absent</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Leave</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium cursor-pointer" onClick={() => { setSortKey('pct'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTable.map(f => (
                    <tr key={f.name} className="border-b border-border last:border-0">
                      <td className="py-2.5 px-3 text-foreground font-medium">{f.name}</td>
                      <td className="py-2.5 px-3 text-center text-success">{f.present}</td>
                      <td className="py-2.5 px-3 text-center text-destructive">{f.absent}</td>
                      <td className="py-2.5 px-3 text-center text-warning">{f.leave}</td>
                      <td className={cn('py-2.5 px-3 text-center font-bold', f.pct < 75 ? 'text-destructive' : 'text-foreground')}>{f.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {expandedReport === 'turnaround' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Avg Response Time', value: '1.2 days' },
                { label: 'Fastest Response', value: '2 hours' },
                { label: 'Slowest Response', value: '3 days' },
                { label: 'Pending > 2 days', value: '1' },
              ].map(s => (
                <div key={s.label} className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
