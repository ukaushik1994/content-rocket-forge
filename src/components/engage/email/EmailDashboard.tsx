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

  // Build inline subtitle with key metrics
  const subtitleParts: string[] = [];
  if (threadCount > 0) subtitleParts.push(`${threadCount} threads`);
  if (stats.rate > 0) subtitleParts.push(`${stats.rate}% delivery`);
  if (activeCampaigns > 0) subtitleParts.push(`${activeCampaigns} active`);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : 'Inbox, campaigns & delivery';

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header — single row with inline metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
            <Mail className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">Email</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
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

      {/* Flat tab bar — single tier, no icons */}
      <div className="flex items-center gap-1">
        {allTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === t.key
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
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
