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

// #24: Show 3 primary tabs always, secondary tabs only when they have data
const primaryTabs = [
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  { key: 'sent', label: 'Sent', icon: Send },
];

const secondaryTabs = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'scheduled', label: 'Scheduled', icon: Clock },
  { key: 'drafts', label: 'Drafts', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

export const EmailDashboard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [tab, setTab] = useState('campaigns'); // #24: Default to campaigns, not inbox
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

  // SB-7: Check if Resend/email service is configured
  const { data: hasEmailKey } = useQuery({
    queryKey: ['email-service-configured'],
    queryFn: async () => {
      const { data } = await supabase.from('api_keys').select('id').eq('service', 'resend').eq('is_active', true).maybeSingle();
      return !!data;
    },
  });

  return (
    <div className="w-full relative">
      <Helmet>
        <title>Email Dashboard | Creaiter</title>
        <meta name="description" content="Compose emails, manage campaigns, and track delivery performance." />
      </Helmet>
      {/* ─── Centered Hero Section ─── */}
      <div className="text-center mb-12 relative pt-16 pb-8">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/[0.06] rounded-full blur-3xl" />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, type: 'spring', stiffness: 100, damping: 18 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full shadow-sm">
            <Mail className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-foreground">Email Hub</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 18 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-blue-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Email
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 100, damping: 18 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8"
        >
          Manage your inbox, launch campaigns, and track delivery performance
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100, damping: 18 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            <Button
              onClick={() => setShowCompose(true)}
              className="h-11 px-6 bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-shadow border-0"
            >
              <PenSquare className="h-4 w-4 mr-2" /> Compose Email
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            <Button
              onClick={() => { setShowCampaignWizard(true); setTab('campaigns'); }}
              variant="outline"
              className="h-11 px-5 glass-card hover:bg-white/[0.08]"
            >
              <Plus className="h-4 w-4 mr-2" /> New Campaign
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 100, damping: 18 }}
          className="flex justify-center gap-4 flex-wrap mb-8"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ─── Quick Filters (Tab Bar) ─── */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex gap-3 p-2 glass-card rounded-2xl">
          {[...primaryTabs, ...secondaryTabs].map((t) => {
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

      {/* SB-7: Resend onboarding guidance */}
      {hasEmailKey === false && (
        <motion.div
          className="max-w-7xl mx-auto mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground">Set up email delivery</p>
            <p className="text-muted-foreground">
              To send emails to real recipients, you need a <strong>Resend</strong> API key. Go to{' '}
              <strong>Settings → API Keys</strong> and add your Resend key. 
              Get a free key at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a>.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Without this, emails will be composed and saved but won't be delivered.
            </p>
          </div>
        </motion.div>
      )}

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
