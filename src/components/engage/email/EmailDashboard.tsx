import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailInbox } from './inbox/EmailInbox';
import { SentList } from './sent/SentList';
import { ScheduledList } from './scheduled/ScheduledList';
import { DraftsList } from './drafts/DraftsList';
import { TemplatesList } from './templates/TemplatesList';
import { CampaignsList } from './campaigns/CampaignsList';
import { EmailReports } from './reports/EmailReports';
import { Mail, Inbox, Send, Clock, FileText, Megaphone, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { EngagePageHero } from '../shared/EngagePageHero';
import { engageStagger } from '../shared/engageAnimations';

export const EmailDashboard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [tab, setTab] = useState('inbox');

  const { data: templateCount = 0 } = useQuery({
    queryKey: ['email-templates-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_templates').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: campaignCount = 0 } = useQuery({
    queryKey: ['email-campaigns-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: emailsSent = 0 } = useQuery({
    queryKey: ['email-messages-sent-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!).eq('status', 'sent');
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: threadCount = 0 } = useQuery({
    queryKey: ['email-threads-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase.from('email_threads').select('*', { count: 'exact', head: true }).eq('workspace_id', currentWorkspaceId!);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const quickFilters = [
    { key: 'inbox', label: 'Inbox', icon: Inbox },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'scheduled', label: 'Scheduled', icon: Clock },
    { key: 'drafts', label: 'Drafts', icon: FileText },
    { key: 'templates', label: 'Templates', icon: FileText },
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngagePageHero
        icon={Mail}
        badge="Email Marketing Suite"
        title="Email"
        titleAccent="Dashboard"
        subtitle="Inbox, campaigns, templates, and delivery — all in one place"
        gradientFrom="from-blue-400"
        gradientTo="to-cyan-400"
        stats={[
          { icon: Inbox, label: 'Threads', value: threadCount },
          { icon: FileText, label: 'Templates', value: templateCount },
          { icon: Megaphone, label: 'Campaigns', value: campaignCount },
          { icon: Send, label: 'Sent', value: emailsSent },
        ]}
        quickFilters={quickFilters}
        activeFilter={tab}
        onFilterChange={setTab}
      />

      {/* Tab Content */}
      <motion.div variants={engageStagger.item} className="max-w-7xl mx-auto">
        {tab === 'inbox' && <EmailInbox />}
        {tab === 'sent' && <SentList />}
        {tab === 'scheduled' && <ScheduledList />}
        {tab === 'drafts' && <DraftsList />}
        {tab === 'templates' && <TemplatesList />}
        {tab === 'campaigns' && <CampaignsList />}
        {tab === 'reports' && <EmailReports />}
      </motion.div>
    </motion.div>
  );
};
