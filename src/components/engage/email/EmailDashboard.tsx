import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { EmailInbox } from './inbox/EmailInbox';
import { SentList } from './sent/SentList';
import { ScheduledList } from './scheduled/ScheduledList';
import { DraftsList } from './drafts/DraftsList';
import { TemplatesList } from './templates/TemplatesList';
import { CampaignsList } from './campaigns/CampaignsList';
import { EmailReports } from './reports/EmailReports';
import { Mail, Inbox, Send, Clock, FileText, Megaphone, BarChart3, Plus, PenSquare, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const primaryTabs = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'templates', label: 'Templates', icon: FileText },
];

const secondaryTabs = [
  { key: 'sent', label: 'Sent', icon: Send },
  { key: 'scheduled', label: 'Scheduled', icon: Clock },
  { key: 'drafts', label: 'Drafts', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

export const EmailDashboard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [tab, setTab] = useState('inbox');

  const { data: threadCount = 0 } = useQuery({
    queryKey: ['email-threads-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_threads').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: activeCampaigns = 0 } = useQuery({
    queryKey: ['email-active-campaigns', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!).neq('status', 'draft');
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: emailStats } = useQuery({
    queryKey: ['email-delivery-stats', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_messages').select('status').eq('workspace_id', currentWorkspaceId!);
      let total = 0, delivered = 0, queued = 0;
      (data || []).forEach((m: any) => {
        total++;
        if (m.status === 'sent' || m.status === 'delivered') delivered++;
        if (m.status === 'queued') queued++;
      });
      return { total, delivered, queued, rate: total > 0 ? Math.round((delivered / total) * 100) : 0 };
    },
    enabled: !!currentWorkspaceId,
  });

  const stats = emailStats || { total: 0, delivered: 0, queued: 0, rate: 0 };

  const miniStats = [
    { icon: Inbox, label: 'Threads', value: threadCount, color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Delivery Rate', value: `${stats.rate}%`, color: 'text-emerald-400' },
    { icon: Megaphone, label: 'Active Campaigns', value: activeCampaigns, color: 'text-purple-400' },
    { icon: Clock, label: 'Queued', value: stats.queued, color: 'text-amber-400' },
  ];

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Compact Header */}
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Mail className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Email</h1>
            <p className="text-xs text-muted-foreground">Inbox, campaigns & delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTab('campaigns')}>
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600" onClick={() => setTab('inbox')}>
            <PenSquare className="h-3.5 w-3.5" /> Compose
          </Button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <GlassCard className="p-3">
        <div className="flex items-center justify-between gap-4">
          {miniStats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
              {i < miniStats.length - 1 && <div className="h-6 w-px bg-border/40 ml-auto" />}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tab Bar with hierarchy */}
      <div className="flex items-center gap-1 flex-wrap">
        {primaryTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === t.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
        <div className="h-4 w-px bg-border/40 mx-1" />
        {secondaryTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all',
              tab === t.key
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/30'
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {tab === 'inbox' && <EmailInbox />}
        {tab === 'sent' && <SentList />}
        {tab === 'scheduled' && <ScheduledList />}
        {tab === 'drafts' && <DraftsList />}
        {tab === 'templates' && <TemplatesList />}
        {tab === 'campaigns' && <CampaignsList />}
        {tab === 'reports' && <EmailReports />}
      </div>
    </motion.div>
  );
};
