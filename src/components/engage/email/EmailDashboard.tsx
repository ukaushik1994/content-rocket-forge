import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { Mail, Plus, PenSquare, Inbox, Send, Clock, FileText, LayoutTemplate, Megaphone, BarChart3, TrendingUp, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const heroStats = [
    { icon: TrendingUp, label: 'Threads', value: threadCount },
    { icon: Zap, label: 'Delivery', value: `${stats.rate}%` },
    { icon: Target, label: 'Campaigns', value: activeCampaigns },
  ];

  return (
    <div className="w-full relative">
      <Helmet>
        <title>Email Dashboard | Creaiter</title>
        <meta name="description" content="Compose emails, manage campaigns, and track delivery performance." />
      </Helmet>
      {/* ─── Centered Hero Section ─── */}
      <motion.div
        className="text-center mb-12 relative pt-16 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Email Hub</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Email
            <br />
            <span className="text-primary">Dashboard</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage your inbox, launch campaigns, and track delivery performance
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex gap-4 justify-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <Button
              onClick={() => setShowCompose(true)}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white px-8 py-4 text-lg font-semibold shadow-2xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative flex items-center gap-3">
                <PenSquare className="h-5 w-5" />
                Compose Email
              </div>
            </Button>
            <Button
              onClick={() => { setShowCampaignWizard(true); setTab('campaigns'); }}
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold glass-card hover:bg-white/[0.08]"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Campaign
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="flex justify-center gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 glass-card rounded-xl mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Quick Filters (Tab Bar) ─── */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex gap-3 p-2 glass-card rounded-2xl">
          {allTabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <motion.button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-background/80'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Tab Content (open, no border wrapper) ─── */}
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
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
