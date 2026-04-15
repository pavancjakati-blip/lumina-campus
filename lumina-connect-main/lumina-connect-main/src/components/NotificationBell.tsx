import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getFacultyNotifications } from '@/data/dataService';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getFacultyNotifications(user.id)
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]));
    }
  }, [user]);

  const unread = items.filter(n => !n.read).length;

  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
          <Bell size={20} className="text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">
              {unread}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 bg-card border-border"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <SheetTitle className="font-semibold text-foreground">Notifications</SheetTitle>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-64px)]">
          {items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              You're all caught up! 🎉
            </div>
          ) : (
            items.map(n => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 p-4 border-b border-border last:border-0 transition-colors',
                  !n.read && 'bg-primary/5'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    n.icon === 'check' && 'bg-success/10 text-success',
                    n.icon === 'warning' && 'bg-warning/10 text-warning',
                    n.icon === 'info' && 'bg-primary/10 text-primary',
                    n.icon === 'leave' && 'bg-secondary/10 text-secondary',
                    n.icon === 'attendance' && 'bg-success/10 text-success',
                  )}
                >
                  {n.icon === 'check' ? <Check size={14} /> : <Bell size={14} />}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead(n.id)}>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.timestamp}</p>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
