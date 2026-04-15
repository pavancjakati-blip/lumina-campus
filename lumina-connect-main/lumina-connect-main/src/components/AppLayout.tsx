import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LuminaLogo } from '@/components/LuminaLogo';
import { AvatarInitials } from '@/components/shared/UIComponents';
import { NotificationBell } from '@/components/NotificationBell';
import { cn } from '@/lib/utils';
import {
  Home, FileText, ListChecks, CalendarDays, User, LogOut,
  LayoutDashboard, ClipboardList, Users, BarChart3, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const facultyNav: NavItem[] = [
  { label: 'Home', icon: Home, path: '/faculty' },
  { label: 'Apply Leave', icon: FileText, path: '/faculty/apply' },
  { label: 'My Leaves', icon: ListChecks, path: '/faculty/leaves' },
  { label: 'Attendance', icon: CalendarDays, path: '/faculty/attendance' },
  { label: 'Profile', icon: User, path: '/faculty/profile' },
];

const hodNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/hod' },
  { label: 'Leave Requests', icon: ClipboardList, path: '/hod/requests' },
  { label: 'Faculty Attendance', icon: Users, path: '/hod/attendance' },
  { label: 'Reports', icon: BarChart3, path: '/hod/reports' },
  { label: 'Profile', icon: User, path: '/hod/profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'faculty' ? facultyNav : hodNav;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col border-r border-white/10 bg-card shadow-[4px_0_24px_rgba(40,40,60,0.06)] transition-all duration-300 fixed h-screen z-30',
        collapsed ? 'w-[72px]' : 'w-60'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          {collapsed ? (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
          ) : (
            <LuminaLogo />
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <AvatarInitials name={user.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span>Collapse</span></>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', collapsed ? 'lg:ml-[72px]' : 'lg:ml-60')}>
        {/* Top bar */}
        <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <LuminaLogo size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed left-4 right-4 bottom-5 z-30 safe-area-inset-bottom">
        <div className="flex bg-card/90 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(40,40,60,0.2)] border border-white/20 rounded-[28px] overflow-hidden">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
