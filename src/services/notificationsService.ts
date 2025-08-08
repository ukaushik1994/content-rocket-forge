import { supabase } from '@/integrations/supabase/client';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export type DashboardAlert = {
  id: string;
  user_id: string;
  title?: string | null;
  message: string;
  module?: string | null;
  severity: AlertSeverity;
  status: 'unread' | 'read' | 'archived';
  link_url?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_read?: boolean | null;
  category?: string; // legacy
};

export async function pushAlert(params: {
  userId: string;
  title?: string;
  message: string;
  module?: string;
  severity?: AlertSeverity;
  linkUrl?: string;
  metadata?: Record<string, any>;
}) {
  const { userId, title, message, module, severity = 'info', linkUrl, metadata } = params;
  const { error } = await supabase.from('dashboard_alerts').insert({
    user_id: userId,
    title: title ?? null,
    message,
    module: module ?? 'general',
    severity,
    status: 'unread',
    link_url: linkUrl ?? null,
    metadata: metadata ?? {},
    is_read: false,
  });
  if (error) console.warn('pushAlert error:', error);
}

export async function fetchAlerts(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('dashboard_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('fetchAlerts error:', error);
    return [] as DashboardAlert[];
  }
  return (data ?? []) as DashboardAlert[];
}

export async function markAlertRead(id: string) {
  const { error } = await supabase
    .from('dashboard_alerts')
    .update({ status: 'read', is_read: true })
    .eq('id', id);
  if (error) console.warn('markAlertRead error:', error);
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('dashboard_alerts')
    .update({ status: 'read', is_read: true })
    .eq('user_id', userId)
    .eq('status', 'unread');
  if (error) console.warn('markAllRead error:', error);
}

export function subscribeToAlerts(userId: string, onInsert: (alert: DashboardAlert) => void) {
  const channel = supabase
    .channel(`alerts-${userId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dashboard_alerts', filter: `user_id=eq.${userId}` },
      (payload) => {
        const alert = payload.new as any;
        onInsert(alert as DashboardAlert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
