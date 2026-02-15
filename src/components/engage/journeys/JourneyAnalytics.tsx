import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Node } from '@xyflow/react';

interface JourneyAnalyticsProps {
  journeyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
}

export const JourneyAnalytics: React.FC<JourneyAnalyticsProps> = ({ journeyId, open, onOpenChange, nodes }) => {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['journey-analytics-enrollments', journeyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('status, enrolled_at, completed_at, exited_at')
        .eq('journey_id', journeyId);
      return data || [];
    },
    enabled: open && !!journeyId,
  });

  const { data: stepCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['journey-analytics-steps', journeyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_steps' as any)
        .select('node_id')
        .eq('journey_id', journeyId);
      const counts: Record<string, number> = {};
      ((data as any[]) || []).forEach((s: any) => {
        counts[s.node_id] = (counts[s.node_id] || 0) + 1;
      });
      return counts;
    },
    enabled: open && !!journeyId,
  });

  // Enrollments over time (last 30 days)
  const enrollmentTimeline = React.useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd');
      const count = enrollments.filter((e: any) =>
        e.enrolled_at && format(new Date(e.enrolled_at), 'yyyy-MM-dd') === dayStr
      ).length;
      return { date: format(d, 'MMM d'), enrollments: count };
    });
  }, [enrollments]);

  // Funnel data from nodes
  const funnelData = React.useMemo(() => {
    return nodes
      .filter(n => n.type !== 'end')
      .map(n => ({
        name: (n.data as any)?.config?.customLabel || n.type?.replace('_', ' ') || n.id,
        contacts: stepCounts[n.id] || 0,
      }))
      .sort((a, b) => b.contacts - a.contacts);
  }, [nodes, stepCounts]);

  const totalEnrolled = enrollments.length;
  const activeCount = enrollments.filter((e: any) => e.status === 'active').length;
  const completedCount = enrollments.filter((e: any) => e.status === 'completed').length;
  const dropOffRate = totalEnrolled > 0 ? Math.round(((totalEnrolled - completedCount) / totalEnrolled) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Journey Analytics
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Enrolled', value: totalEnrolled, icon: Users, color: 'text-primary' },
            { label: 'Active', value: activeCount, icon: Users, color: 'text-emerald-400' },
            { label: 'Completed', value: completedCount, icon: Users, color: 'text-blue-400' },
            { label: 'Drop-off Rate', value: `${dropOffRate}%`, icon: TrendingDown, color: 'text-amber-400' },
          ].map(s => (
            <GlassCard key={s.label} className="p-3">
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Enrollment Timeline */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Enrollments Over Time (30 days)</h4>
          {enrollmentTimeline.some(d => d.enrollments > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={enrollmentTimeline}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No enrollment data yet</p>
          )}
        </GlassCard>

        {/* Conversion Funnel */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Node Conversion Funnel</h4>
          {funnelData.length > 0 && funnelData.some(d => d.contacts > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="contacts" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No step execution data yet</p>
          )}
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
