import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, CheckCircle, MousePointer, AlertTriangle, Send, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['hsl(var(--primary))', 'hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(0, 84%, 60%)'];

export const EmailReports = () => {
  const { currentWorkspaceId } = useWorkspace();

  const { data: messageStats } = useQuery({
    queryKey: ['email-reports-stats', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_messages')
        .select('status')
        .eq('workspace_id', currentWorkspaceId!);
      const stats = { total: 0, sent: 0, delivered: 0, failed: 0, queued: 0 };
      (data || []).forEach((m: any) => {
        stats.total++;
        if (m.status === 'sent') stats.sent++;
        else if (m.status === 'delivered') stats.delivered++;
        else if (m.status === 'failed') stats.failed++;
        else if (m.status === 'queued') stats.queued++;
      });
      return stats;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: campaignPerformance = [] } = useQuery({
    queryKey: ['email-reports-campaigns', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_campaigns')
        .select('name, stats, status')
        .eq('workspace_id', currentWorkspaceId!)
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(10);
      return (data || []).map((c: any) => {
        const s = c.stats || {};
        return {
          name: c.name?.substring(0, 20) || 'Unnamed',
          sent: s.sent || 0,
          delivered: s.delivered || 0,
          opened: s.opened || 0,
          clicked: s.clicked || 0,
          failed: s.failed || 0,
        };
      });
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: templateUsage = [] } = useQuery({
    queryKey: ['email-reports-templates', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_campaigns')
        .select('template_id, email_templates(name)')
        .eq('workspace_id', currentWorkspaceId!)
        .not('template_id', 'is', null);
      const counts: Record<string, { name: string; count: number }> = {};
      (data || []).forEach((c: any) => {
        const tid = c.template_id;
        if (!counts[tid]) counts[tid] = { name: c.email_templates?.name || 'Unknown', count: 0 };
        counts[tid].count++;
      });
      return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    },
    enabled: !!currentWorkspaceId,
  });

  const stats = messageStats || { total: 0, sent: 0, delivered: 0, failed: 0, queued: 0 };
  const deliveryRate = stats.total > 0 ? Math.round(((stats.sent + stats.delivered) / stats.total) * 100) : 0;

  const pieData = [
    { name: 'Sent', value: stats.sent },
    { name: 'Delivered', value: stats.delivered },
    { name: 'Queued', value: stats.queued },
    { name: 'Failed', value: stats.failed },
  ].filter(d => d.value > 0);

  const summaryCards = [
    { label: 'Total Emails', value: stats.total, icon: Mail, color: 'text-primary' },
    { label: 'Delivered', value: stats.sent + stats.delivered, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Failed', value: stats.failed, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {summaryCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-3">
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status distribution */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Email Status Distribution</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </GlassCard>

        {/* Campaign performance */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Campaign Performance</h4>
          {campaignPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={campaignPerformance}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No campaigns yet</p>
          )}
        </GlassCard>
      </div>

      {/* Template leaderboard */}
      <GlassCard className="p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Template Leaderboard</h4>
        {templateUsage.length > 0 ? (
          <div className="space-y-2">
            {templateUsage.map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm text-foreground">{t.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">{t.count} campaigns</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No template data yet</p>
        )}
      </GlassCard>
    </div>
  );
};
