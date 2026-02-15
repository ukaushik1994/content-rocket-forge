import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Mail, Share2, GitBranch, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format } from 'date-fns';

export const SystemHealth = () => {
  const { currentWorkspaceId } = useWorkspace();

  // Email provider status
  const { data: emailProvider } = useQuery({
    queryKey: ['email-provider-status', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_provider_settings')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!currentWorkspaceId,
  });

  // Social accounts
  const { data: socialAccounts = [] } = useQuery({
    queryKey: ['social-accounts-health', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('social_accounts').select('*').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  // Queue stats
  const { data: queueStats } = useQuery({
    queryKey: ['queue-stats', currentWorkspaceId],
    queryFn: async () => {
      const [emails, journeySteps, socialPosts] = await Promise.all([
        supabase.from('email_messages').select('*', { count: 'exact', head: true })
          .eq('workspace_id', currentWorkspaceId!).eq('status', 'queued'),
        supabase.from('journey_steps').select('*', { count: 'exact', head: true })
          .eq('workspace_id', currentWorkspaceId!).eq('status', 'pending'),
        supabase.from('social_posts').select('*', { count: 'exact', head: true })
          .eq('workspace_id', currentWorkspaceId!).eq('status', 'scheduled'),
      ]);
      return {
        pendingEmails: emails.count || 0,
        pendingSteps: journeySteps.count || 0,
        scheduledPosts: socialPosts.count || 0,
      };
    },
    enabled: !!currentWorkspaceId,
  });

  // Deliverability - bounce/fail trend (last 7 days)
  const { data: deliverability = [] } = useQuery({
    queryKey: ['deliverability-trend', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_messages')
        .select('status, sent_at')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('queued_at', subDays(new Date(), 7).toISOString());
      
      const byDay: Record<string, { sent: number; failed: number; delivered: number }> = {};
      (data || []).forEach((m: any) => {
        const day = format(new Date(m.sent_at || m.queued_at || new Date()), 'MMM d');
        if (!byDay[day]) byDay[day] = { sent: 0, failed: 0, delivered: 0 };
        if (m.status === 'failed') byDay[day].failed++;
        else if (m.status === 'delivered') byDay[day].delivered++;
        else byDay[day].sent++;
      });
      return Object.entries(byDay).map(([day, d]) => ({ day, ...d }));
    },
    enabled: !!currentWorkspaceId,
  });

  const integrations = [
    {
      name: 'Email Provider',
      icon: Mail,
      status: emailProvider ? 'connected' : 'not_configured',
      detail: emailProvider ? `${emailProvider.provider} — ${emailProvider.from_email}` : 'No provider configured',
    },
    ...socialAccounts.map((a: any) => ({
      name: `${a.provider} Account`,
      icon: Share2,
      status: 'connected',
      detail: a.display_name || a.provider,
    })),
  ];

  if (socialAccounts.length === 0) {
    integrations.push({
      name: 'Social Accounts',
      icon: Share2,
      status: 'not_configured',
      detail: 'No social accounts linked',
    });
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'connected') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === 'error') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-lg font-bold text-foreground">System Health</h3>
        <p className="text-sm text-muted-foreground">Integration status and queue health</p>
      </motion.div>

      {/* Integration Status */}
      <div className="grid gap-3">
        {integrations.map((integ, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center">
                <integ.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{integ.name}</p>
                <p className="text-xs text-muted-foreground">{integ.detail}</p>
              </div>
              <StatusIcon status={integ.status} />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Queue Status */}
      <GlassCard className="p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Queue Status
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Emails', count: queueStats?.pendingEmails || 0, icon: Mail, color: 'text-blue-400' },
            { label: 'Journey Steps', count: queueStats?.pendingSteps || 0, icon: GitBranch, color: 'text-primary' },
            { label: 'Scheduled Posts', count: queueStats?.scheduledPosts || 0, icon: Share2, color: 'text-purple-400' },
          ].map(q => (
            <div key={q.label} className="text-center">
              <q.icon className={`h-5 w-5 ${q.color} mx-auto mb-1 opacity-60`} />
              <p className={`text-2xl font-bold ${q.color}`}>{q.count}</p>
              <p className="text-[10px] text-muted-foreground">{q.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Deliverability Chart */}
      {deliverability.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Deliverability (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deliverability}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="delivered" fill="hsl(150, 60%, 50%)" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="sent" fill="hsl(210, 80%, 60%)" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="failed" fill="hsl(0, 70%, 55%)" radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
};
