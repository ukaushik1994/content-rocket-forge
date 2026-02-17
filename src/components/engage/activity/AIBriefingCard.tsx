import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EngageButton } from '../shared/EngageButton';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const insightIcons: Record<string, any> = {
  positive: TrendingUp,
  warning: AlertTriangle,
  neutral: Lightbulb,
};

const insightColors: Record<string, string> = {
  positive: 'text-emerald-400',
  warning: 'text-amber-400',
  neutral: 'text-blue-400',
};

interface BriefingData {
  summary: string;
  insights: Array<{ type: string; text: string }>;
  actions: Array<{ priority: string; text: string; action_type: string }>;
}

interface MetricsData {
  emails: { total: number; sent: number; failed: number; queued: number };
  journeys: { enrollments: number };
  automations: { total: number; success: number; failed: number };
  contacts: { new: number };
  activity: { total: number };
}

export const AIBriefingCard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');

  const generateBriefing = async () => {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('engage-ai-analytics', {
        body: { use_case: 'briefing', workspace_id: currentWorkspaceId, period },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setBriefing(data?.briefing || null);
      setMetrics(data?.metrics || null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate briefing');
    } finally {
      setLoading(false);
    }
  };

  if (!briefing) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Command Center</h3>
              <p className="text-xs text-muted-foreground">Get an AI-generated briefing of your workspace activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['daily', 'weekly'] as const).map(p => (
                <EngageButton
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </EngageButton>
              ))}
            </div>
            <EngageButton onClick={generateBriefing} disabled={loading} size="sm">
              {loading ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 mr-1" /> Generate Briefing</>
              )}
            </EngageButton>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Briefing</h3>
              <p className="text-[10px] text-muted-foreground capitalize">{period} summary</p>
            </div>
          </div>
          <EngageButton variant="outline" size="sm" className="h-7" onClick={generateBriefing} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </EngageButton>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/90 leading-relaxed">{briefing.summary}</p>

        {/* Metrics mini-cards */}
        {metrics && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Emails', value: metrics.emails.total, sub: `${metrics.emails.sent} sent` },
              { label: 'New Contacts', value: metrics.contacts.new },
              { label: 'Automations', value: metrics.automations.total, sub: `${metrics.automations.success} ok` },
              { label: 'Events', value: metrics.activity.total },
            ].map((m, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-muted/20 border border-border/20">
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                {m.sub && <p className="text-[9px] text-muted-foreground/70">{m.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {briefing.insights?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Key Insights</p>
            {briefing.insights.map((insight, i) => {
              const Icon = insightIcons[insight.type] || Lightbulb;
              return (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10">
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${insightColors[insight.type] || 'text-muted-foreground'}`} />
                  <p className="text-xs text-foreground">{insight.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Recommended Actions */}
        {briefing.actions?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Recommended Actions</p>
            {briefing.actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <p className="text-xs text-foreground flex-1">{action.text}</p>
                <Badge variant="outline" className={`text-[9px] shrink-0 ${priorityColors[action.priority] || ''}`}>
                  {action.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
