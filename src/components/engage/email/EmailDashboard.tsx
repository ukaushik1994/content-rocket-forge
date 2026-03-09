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
import { Mail, Plus, PenSquare, Inbox, Send, Clock, FileText, LayoutTemplate, Megaphone, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const allTabs = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  { key: 'sent', label: 'Sent', icon: Send },
  { key: 'scheduled', label: 'Scheduled', icon: Clock },
  { key: 'drafts', label: 'Drafts', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
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

  const statPills = [
    { label: 'Threads', value: threadCount, show: threadCount > 0 },
    { label: 'Delivery', value: `${stats.rate}%`, show: stats.rate > 0 },
    { label: 'Active', value: activeCampaigns, show: activeCampaigns > 0 },
    { label: 'Queued', value: stats.queued, show: stats.queued > 0 },
  ].filter(s => s.show);

  return (
    <div className="space-y-4">
      {/* Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl p-6"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Mail className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                  Email
                </h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Inbox, campaigns & delivery
              </p>
            </div>

            {/* Stat pills */}
            {statPills.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                {statPills.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/80 border border-border/50 backdrop-blur-sm text-muted-foreground"
                  >
                    <span className="text-foreground font-semibold">{s.value}</span>
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 bg-background/40 border-border/50 backdrop-blur-sm hover:bg-background/80 transition-all"
              onClick={() => { setShowCampaignWizard(true); setTab('campaigns'); }}
            >
              <Plus className="h-3.5 w-3.5" /> New Campaign
            </Button>
            <Button
              size="sm"
              className="h-9 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 transition-all"
              onClick={() => setShowCompose(true)}
            >
              <PenSquare className="h-3.5 w-3.5" /> Compose
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Glassmorphic Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl p-1.5 flex items-center gap-1"
      >
        {allTabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <motion.button
              key={t.key}
              onClick={() => setTab(t.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-foreground text-background shadow-lg shadow-foreground/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'inbox' && <EmailInbox />}
            {tab === 'sent' && <SentList />}
            {tab === 'scheduled' && <ScheduledList />}
            {tab === 'drafts' && <DraftsList />}
            {tab === 'templates' && <TemplatesList />}
            {tab === 'campaigns' && <CampaignsList openWizardOnMount={showCampaignWizard} onWizardOpened={() => setShowCampaignWizard(false)} />}
            {tab === 'reports' && <EmailReports />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <ComposeDialog open={showCompose} onOpenChange={setShowCompose} />
    </div>
  );
};
