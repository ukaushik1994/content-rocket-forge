import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { TrendingUp, Users, Timer, Target } from 'lucide-react';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import type { Node } from '@xyflow/react';

interface JourneyPerformanceProps {
  journeyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
}

export const JourneyPerformance: React.FC<JourneyPerformanceProps> = ({ journeyId, open, onOpenChange, nodes }) => {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['journey-perf-enrollments', journeyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('status, enrolled_at')
        .eq('journey_id', journeyId);
      return data || [];
    },
    enabled: open && !!journeyId,
  });

  const { data: stepCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['journey-perf-steps', journeyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_steps' as any)
        .select('node_id, status')
        .eq('journey_id', journeyId);
      const counts: Record<string, number> = {};
      ((data as any[]) || []).forEach((s: any) => {
        counts[s.node_id] = (counts[s.node_id] || 0) + 1;
      });
      return counts;
    },
    enabled: open && !!journeyId,
  });

  const { data: failedSteps = {} } = useQuery<Record<string, number>>({
    queryKey: ['journey-perf-failures', journeyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_steps' as any)
        .select('node_id')
        .eq('journey_id', journeyId)
        .eq('status', 'failed');
      const counts: Record<string, number> = {};
      ((data as any[]) || []).forEach((s: any) => {
        counts[s.node_id] = (counts[s.node_id] || 0) + 1;
      });
      return counts;
    },
    enabled: open && !!journeyId,
  });

  const totalEnrolled = enrollments.length;
  const completed = enrollments.filter((e: any) => e.status === 'completed').length;
  const active = enrollments.filter((e: any) => e.status === 'active').length;
  const conversionRate = totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;

  // Build funnel from node order
  const funnelData = nodes
    .filter(n => n.type !== 'end')
    .map(n => ({
      name: (n.data as any)?.config?.customLabel || n.type?.replace('_', ' ') || n.id,
      value: stepCounts[n.id] || 0,
      failed: failedSteps[n.id] || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Drop-off per node
  const dropOffData = nodes
    .filter(n => n.type !== 'end' && n.type !== 'trigger')
    .map(n => ({
      name: (n.data as any)?.config?.customLabel || n.type?.replace('_', ' ') || '',
      passed: stepCounts[n.id] || 0,
      failed: failedSteps[n.id] || 0,
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <EngageDialogHeader icon={TrendingUp} title="Journey Performance" gradientFrom="from-emerald-400" gradientTo="to-blue-400" iconColor="text-emerald-400" />

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Enrolled', value: totalEnrolled, icon: Users, color: 'text-primary' },
            { label: 'Active', value: active, icon: Users, color: 'text-emerald-400' },
            { label: 'Completed', value: completed, icon: Target, color: 'text-blue-400' },
            { label: 'Conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-400' },
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

        {/* Funnel */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Conversion Funnel</h4>
          {funnelData.length > 0 && funnelData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Contacts" />
                <Bar dataKey="failed" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No execution data yet</p>
          )}
        </GlassCard>

        {/* Drop-off table */}
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Drop-off per Node</h4>
          <div className="space-y-1">
            {dropOffData.map((d, i) => {
              const total = d.passed + d.failed;
              const failRate = total > 0 ? Math.round((d.failed / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20">
                  <span className="text-xs text-foreground">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground">{d.passed} passed</span>
                    {d.failed > 0 && <Badge variant="destructive" className="text-[9px] h-4">{d.failed} failed ({failRate}%)</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
