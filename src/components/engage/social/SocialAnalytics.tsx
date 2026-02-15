import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Share2, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const platformColors: Record<string, string> = {
  twitter: 'hsl(210, 80%, 60%)',
  linkedin: 'hsl(210, 70%, 50%)',
  instagram: 'hsl(330, 70%, 60%)',
  facebook: 'hsl(220, 70%, 55%)',
};

export const SocialAnalytics = () => {
  const { currentWorkspaceId } = useWorkspace();

  const { data: posts = [] } = useQuery({
    queryKey: ['social-posts-analytics', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('social_posts')
        .select('*, social_post_targets(*)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const channelData = useMemo(() => {
    const counts: Record<string, { posted: number; scheduled: number; draft: number }> = {};
    posts.forEach((p: any) => {
      const targets = p.social_post_targets || [];
      if (targets.length === 0) {
        const k = 'unassigned';
        if (!counts[k]) counts[k] = { posted: 0, scheduled: 0, draft: 0 };
        counts[k][p.status as 'posted' | 'scheduled' | 'draft'] = (counts[k][p.status as keyof typeof counts[typeof k]] || 0) + 1;
      }
      targets.forEach((t: any) => {
        if (!counts[t.provider]) counts[t.provider] = { posted: 0, scheduled: 0, draft: 0 };
        if (t.status === 'posted') counts[t.provider].posted++;
        else counts[t.provider].scheduled++;
      });
    });
    return Object.entries(counts).map(([platform, data]) => ({
      platform, ...data, total: data.posted + data.scheduled + data.draft,
    }));
  }, [posts]);

  const statusData = useMemo(() => {
    const counts = { draft: 0, scheduled: 0, posted: 0, failed: 0 };
    posts.forEach((p: any) => { counts[p.status as keyof typeof counts] = (counts[p.status as keyof typeof counts] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [posts]);

  const pieColors = ['hsl(var(--muted-foreground))', 'hsl(210, 80%, 60%)', 'hsl(150, 60%, 50%)', 'hsl(0, 70%, 55%)'];

  const topPosts = useMemo(() => {
    return posts.filter((p: any) => p.status === 'posted').slice(0, 5);
  }, [posts]);

  const exportCSV = () => {
    const rows = [['Date', 'Content', 'Status', 'Channels']];
    posts.forEach((p: any) => {
      const channels = (p.social_post_targets || []).map((t: any) => t.provider).join(', ');
      rows.push([format(new Date(p.created_at), 'yyyy-MM-dd'), p.content?.slice(0, 100) || '', p.status, channels]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'social-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Social Analytics</h3>
            <p className="text-sm text-muted-foreground">Performance across all channels</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Posts', value: posts.length, icon: Share2, color: 'text-purple-400' },
          { label: 'Posted', value: posts.filter((p: any) => p.status === 'posted').length, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Scheduled', value: posts.filter((p: any) => p.status === 'scheduled').length, icon: Calendar, color: 'text-blue-400' },
          { label: 'Channels', value: channelData.length, icon: Share2, color: 'text-amber-400' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-4 w-4 ${s.color} opacity-50`} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {channelData.length > 0 && (
          <GlassCard className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Posts by Channel</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <XAxis dataKey="platform" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="posted" fill="hsl(150, 60%, 50%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="scheduled" fill="hsl(210, 80%, 60%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {statusData.length > 0 && (
          <GlassCard className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Status Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recent Published Posts</h4>
          <div className="space-y-2">
            {topPosts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{p.content?.slice(0, 80)}</p>
                  <div className="flex gap-1 mt-1">
                    {(p.social_post_targets || []).map((t: any) => (
                      <Badge key={t.id} variant="outline" className="text-[10px]">{t.provider}</Badge>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {format(new Date(p.created_at), 'MMM d')}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
