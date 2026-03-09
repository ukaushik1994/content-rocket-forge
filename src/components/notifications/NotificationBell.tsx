import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/use-notifications';
import { EnhancedNotificationsCenter } from './EnhancedNotificationsCenter';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, refresh } = useNotifications({
    autoRefresh: true,
    limit: 20,
  });

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-notifications', handler as any);
    return () => document.removeEventListener('open-notifications', handler as any);
  }, []);

  useEffect(() => {
    const refreshHandler = () => refresh();
    document.addEventListener('alerts-updated', refreshHandler as any);
    return () => document.removeEventListener('alerts-updated', refreshHandler as any);
  }, [refresh]);

  return (
    <div className="fixed top-4 right-4 z-50right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-border relative hover:bg-accent/50 trans bg-background/80 backdrop-blur-md shadow-lgition-colors"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center px-1 animate-pulse shadow-sm border border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      <EnhancedNotificationsCenter open={open} onClose={() => setOpen(false)} />
    </div>
  );
};
