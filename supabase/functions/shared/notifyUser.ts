/**
 * Non-blocking dashboard notification helper for background jobs.
 * Inserts into dashboard_alerts table — fire-and-forget.
 */
export async function notifyUser(
  supabase: any,
  params: {
    userId: string;
    title: string;
    message: string;
    module: string;
    severity?: 'info' | 'success' | 'warning' | 'error';
    linkUrl?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await supabase.from('dashboard_alerts').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      module: params.module,
      severity: params.severity || 'info',
      status: 'unread',
      is_read: false,
      link_url: params.linkUrl || null,
      metadata: params.metadata || {},
    });
  } catch (e) {
    console.warn('[notifyUser] Failed (non-blocking):', e);
  }
}

/**
 * Resolve workspace owner user_id from team_members table.
 */
export async function getWorkspaceOwnerId(supabase: any, workspaceId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .in('role', ['owner', 'admin'])
      .limit(1)
      .single();
    return data?.user_id || null;
  } catch {
    return null;
  }
}
