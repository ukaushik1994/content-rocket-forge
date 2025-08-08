import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardAlert, fetchAlerts, markAlertRead, markAllRead, subscribeToAlerts } from '@/services/notificationsService';
import { Button } from '@/components/ui/button';

export const NotificationsCenter: React.FC<{ open: boolean; onClose: () => void; }> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    fetchAlerts(userId, 50).then(setAlerts);
    const unsub = subscribeToAlerts(userId, (a) => setAlerts((prev) => [a, ...prev]));
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const handler = () => onClose ? undefined : undefined;
    const openHandler = () => {
      // no-op placeholder to potentially sync external open events
    };
    document.addEventListener('open-notifications', openHandler as any);
    return () => document.removeEventListener('open-notifications', openHandler as any);
  }, [onClose]);

  const unreadCount = useMemo(() => alerts.filter(a => (a.status === 'unread') || a.is_read === false).length, [alerts]);

  if (!open) return null;

  return (
    <div className="absolute right-2 top-14 z-50 w-[360px] max-h-[70vh] overflow-hidden rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => userId && markAllRead(userId)} className="h-7 px-2 text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {alerts.map((a) => (
              <li key={a.id} className="p-4 hover:bg-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{a.module || a.category || 'general'}</span>
                      <span className="text-[10px] rounded bg-muted px-1.5 py-0.5">{a.severity || a.category || 'info'}</span>
                    </div>
                    {a.title && <div className="mt-1 font-medium">{a.title}</div>}
                    <div className="mt-0.5 text-sm text-muted-foreground">{a.message}</div>
                    {a.link_url && (
                      <a href={a.link_url} className="mt-2 inline-block text-primary text-xs">Open</a>
                    )}
                  </div>
                  {((a.status === 'unread') || a.is_read === false) && (
                    <Button variant="outline" size="sm" className="h-7" onClick={() => markAlertRead(a.id)}>Mark read</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
