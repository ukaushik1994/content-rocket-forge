import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardAlert, fetchAlerts, subscribeToAlerts } from '@/services/notificationsService';
import { NotificationsCenter } from './NotificationsCenter';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchAlerts(userId, 20).then(setAlerts);
    const unsub = subscribeToAlerts(userId, (a) => setAlerts((prev) => [a, ...prev]));
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-notifications', handler as any);
    return () => document.removeEventListener('open-notifications', handler as any);
  }, []);

  const unreadCount = useMemo(() => alerts.filter(a => (a.status === 'unread') || a.is_read === false).length, [alerts]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full overflow-hidden border border-border relative"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationsCenter open={open} onClose={() => setOpen(false)} />
    </div>
  );
};
