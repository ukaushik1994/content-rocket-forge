import { supabase } from '@/integrations/supabase/client';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'achievement';
export type NotificationFrequency = 'instant' | 'hourly' | 'daily' | 'weekly';

export interface EnhancedDashboardAlert {
  id: string;
  user_id: string;
  title?: string | null;
  message: string;
  module?: string | null;
  severity: string;
  status: 'unread' | 'read' | 'archived';
  link_url?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_read?: boolean | null;
  priority: NotificationPriority;
  notification_type: NotificationType;
  grouped_id?: string | null;
  action_buttons: ActionButton[];
  preview_data: Record<string, any>;
  expires_at?: string | null;
  interaction_count: number;
  last_interaction_at?: string | null;
}

export interface ActionButton {
  id: string;
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  url?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  category: string;
  enabled: boolean;
  frequency: NotificationFrequency;
  channels: string[];
  priority_threshold: NotificationPriority;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  auto_dismiss_after_days: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  default_enabled: boolean;
  default_frequency: NotificationFrequency;
  created_at: string;
}

// Enhanced notification creation with new features
export async function pushEnhancedAlert(params: {
  userId: string;
  title?: string;
  message: string;
  module?: string;
  severity?: string;
  priority?: NotificationPriority;
  notificationType?: NotificationType;
  linkUrl?: string;
  metadata?: Record<string, any>;
  actionButtons?: ActionButton[];
  previewData?: Record<string, any>;
  expiresIn?: number; // hours
  groupedId?: string;
}) {
  const {
    userId,
    title,
    message,
    module,
    severity = 'info',
    priority = 'medium',
    notificationType = 'info',
    linkUrl,
    metadata,
    actionButtons = [],
    previewData = {},
    expiresIn,
    groupedId,
  } = params;

  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from('dashboard_alerts').insert({
    user_id: userId,
    title: title ?? null,
    message,
    module: module ?? 'general',
    severity,
    priority,
    notification_type: notificationType,
    status: 'unread',
    link_url: linkUrl ?? null,
    metadata: metadata ?? {},
    action_buttons: actionButtons as any,
    preview_data: previewData,
    expires_at: expiresAt,
    grouped_id: groupedId,
    is_read: false,
    interaction_count: 0,
  });

  if (error) {
    console.warn('pushEnhancedAlert error:', error);
    throw error;
  }
}

// Fetch enhanced alerts with grouping and filtering
export async function fetchEnhancedAlerts(
  userId: string,
  options: {
    limit?: number;
    priority?: NotificationPriority;
    category?: string;
    status?: string;
    grouped?: boolean;
  } = {}
) {
  const { limit = 50, priority, category, status, grouped = true } = options;

  let query = supabase
    .from('dashboard_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (category) {
    query = query.eq('module', category);
  }

  if (status) {
    query = query.eq('status', status);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.warn('fetchEnhancedAlerts error:', error);
    return [] as EnhancedDashboardAlert[];
  }

  let alerts = (data ?? []).map(item => ({
    ...item,
    action_buttons: Array.isArray(item.action_buttons) 
      ? (item.action_buttons as unknown as ActionButton[])
      : [],
    priority: item.priority as NotificationPriority,
    notification_type: item.notification_type as NotificationType,
  })) as EnhancedDashboardAlert[];

  // Group related notifications if requested
  if (grouped) {
    alerts = groupNotifications(alerts);
  }

  return alerts;
}

// Group related notifications
function groupNotifications(alerts: EnhancedDashboardAlert[]): EnhancedDashboardAlert[] {
  const grouped = new Map<string, EnhancedDashboardAlert[]>();
  const ungrouped: EnhancedDashboardAlert[] = [];

  alerts.forEach(alert => {
    if (alert.grouped_id) {
      if (!grouped.has(alert.grouped_id)) {
        grouped.set(alert.grouped_id, []);
      }
      grouped.get(alert.grouped_id)!.push(alert);
    } else {
      ungrouped.push(alert);
    }
  });

  const result: EnhancedDashboardAlert[] = [];

  // Add ungrouped notifications
  result.push(...ungrouped);

  // Add grouped notifications with summary
  grouped.forEach((groupAlerts, groupId) => {
    if (groupAlerts.length === 1) {
      result.push(groupAlerts[0]);
    } else {
      // Create a summary notification for the group
      const latest = groupAlerts[0];
      const summary: EnhancedDashboardAlert = {
        ...latest,
        id: `group_${groupId}`,
        title: `${groupAlerts.length} ${latest.module} notifications`,
        message: `${groupAlerts.length} items: ${groupAlerts.map(a => a.message).join(', ')}`,
        preview_data: {
          ...latest.preview_data,
          groupCount: groupAlerts.length,
          groupItems: groupAlerts.map(a => ({ id: a.id, message: a.message })),
        },
      };
      result.push(summary);
    }
  });

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Handle notification actions
export async function executeNotificationAction(
  notificationId: string,
  actionId: string,
  actionData?: Record<string, any>
) {
  // First get current interaction count
  const { data: currentData } = await supabase
    .from('dashboard_alerts')
    .select('interaction_count')
    .eq('id', notificationId)
    .single();

  const newCount = (currentData?.interaction_count || 0) + 1;

  const { error: updateError } = await supabase
    .from('dashboard_alerts')
    .update({
      interaction_count: newCount,
      last_interaction_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (updateError) {
    console.warn('executeNotificationAction update error:', updateError);
  }

  // Here you can add specific action handling logic
  // For example, redirect to URLs, trigger other functions, etc.
  console.log('Executing action:', actionId, 'for notification:', notificationId, 'with data:', actionData);
}

// Notification settings management
export async function fetchNotificationSettings(userId: string): Promise<NotificationSettings[]> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.warn('fetchNotificationSettings error:', error);
    return [];
  }

  return (data ?? []).map(item => ({
    ...item,
    frequency: item.frequency as NotificationFrequency,
    priority_threshold: item.priority_threshold as NotificationPriority,
    channels: Array.isArray(item.channels) ? item.channels as string[] : ['in_app'],
  })) as NotificationSettings[];
}

export async function updateNotificationSettings(
  userId: string,
  category: string,
  settings: Partial<NotificationSettings>
) {
  const { error } = await supabase
    .from('notification_settings')
    .upsert({
      user_id: userId,
      category,
      ...settings,
    });

  if (error) {
    console.warn('updateNotificationSettings error:', error);
    throw error;
  }
}

export async function fetchNotificationCategories(): Promise<NotificationCategory[]> {
  const { data, error } = await supabase
    .from('notification_categories')
    .select('*')
    .order('name');

  if (error) {
    console.warn('fetchNotificationCategories error:', error);
    return [];
  }

  return (data ?? []).map(item => ({
    ...item,
    default_frequency: item.default_frequency as NotificationFrequency,
  })) as NotificationCategory[];
}

// Bulk operations
export async function markMultipleRead(userId: string, notificationIds: string[]) {
  const { error } = await supabase
    .from('dashboard_alerts')
    .update({ status: 'read', is_read: true })
    .eq('user_id', userId)
    .in('id', notificationIds);

  if (error) {
    console.warn('markMultipleRead error:', error);
    throw error;
  }
}

export async function archiveMultiple(userId: string, notificationIds: string[]) {
  const { error } = await supabase
    .from('dashboard_alerts')
    .update({ status: 'archived' })
    .eq('user_id', userId)
    .in('id', notificationIds);

  if (error) {
    console.warn('archiveMultiple error:', error);
    throw error;
  }
}

// Real-time subscription for enhanced alerts
export function subscribeToEnhancedAlerts(
  userId: string,
  onInsert: (alert: EnhancedDashboardAlert) => void,
  onUpdate?: (alert: EnhancedDashboardAlert) => void
) {
  const channel = supabase
    .channel(`enhanced-alerts-${userId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dashboard_alerts', filter: `user_id=eq.${userId}` },
      (payload) => {
        const alert = payload.new as EnhancedDashboardAlert;
        onInsert(alert);
      }
    );

  if (onUpdate) {
    channel.on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'dashboard_alerts', filter: `user_id=eq.${userId}` },
      (payload) => {
        const alert = payload.new as EnhancedDashboardAlert;
        onUpdate(alert);
      }
    );
  }

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}