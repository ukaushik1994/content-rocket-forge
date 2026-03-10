import React, { useEffect, useState } from 'react';
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
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-border relative transition-transform duration-200 hover:scale-105 bg-background/80 backdrop-blur-md shadow-lg"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-purple-600 text-primary-foreground text-[11px] font-semibold leading-5 text-center px-1.5 shadow-sm border border-background">
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
