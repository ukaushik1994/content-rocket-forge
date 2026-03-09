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
import { ComposeDialog } from './inbox/ComposeDialog';
import { Mail, Plus, PenSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const allTabs = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'templates', label: 'Templates' },
  { key: 'sent', label: 'Sent' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'reports', label: 'Reports' },
];

export const EmailDashboard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [tab, setTab] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);

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
    { icon: Inbox, label: 'Threads', value: threadCount },
    { icon: TrendingUp, label: 'Delivery Rate', value: `${stats.rate}%` },
    { icon: Megaphone, label: 'Active Campaigns', value: activeCampaigns },
    { icon: Clock, label: 'Queued', value: stats.queued },
  ];

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
            <Mail className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">Email</h1>
            <p className="text-xs text-muted-foreground">Inbox, campaigns & delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setShowCampaignWizard(true); setTab('campaigns'); }}>
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90" onClick={() => setShowCompose(true)}>
            <PenSquare className="h-3.5 w-3.5" /> Compose
          </Button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between gap-6">
          {miniStats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
              {i < miniStats.length - 1 && <div className="h-8 w-px bg-border/30 ml-auto" />}
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
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all',
              tab === t.key
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
        <div className="h-4 w-px bg-border/40 mx-1.5" />
        {secondaryTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all',
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
        {tab === 'campaigns' && <CampaignsList openWizardOnMount={showCampaignWizard} onWizardOpened={() => setShowCampaignWizard(false)} />}
        {tab === 'reports' && <EmailReports />}
      </div>

      {/* Compose Dialog mounted at dashboard level */}
      <ComposeDialog open={showCompose} onOpenChange={setShowCompose} />
    </motion.div>
  );
};
