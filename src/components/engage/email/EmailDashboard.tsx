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
import { EngageHero } from '../shared/EngageHero';
import { EngageStatGrid } from '../shared/EngageStatCard';
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

  const stats = [
    { label: 'Threads', count: threadCount, color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', icon: Inbox },
    { label: 'Templates', count: templateCount, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', icon: FileText },
    { label: 'Campaigns', count: campaignCount, color: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', icon: Megaphone },
    { label: 'Emails Sent', count: emailsSent, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: Send },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngageHero
        icon={Mail}
        title="Email"
        subtitle="Inbox, campaigns, templates, and delivery"
        gradientFrom="from-blue-400"
        gradientTo="to-cyan-400"
        glowFrom="from-blue-500/30"
        glowTo="to-cyan-500/10"
      />

      <EngageStatGrid stats={stats} columns={4} />

      {/* Tabs */}
      <motion.div variants={engageStagger.item}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm flex-wrap h-auto gap-0.5 p-1">
            <TabsTrigger value="inbox" className="text-xs gap-1"><Inbox className="h-3 w-3" /> Inbox</TabsTrigger>
            <TabsTrigger value="sent" className="text-xs gap-1"><Send className="h-3 w-3" /> Sent</TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs gap-1"><Clock className="h-3 w-3" /> Scheduled</TabsTrigger>
            <TabsTrigger value="drafts" className="text-xs gap-1"><FileText className="h-3 w-3" /> Drafts</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-4"><EmailInbox /></TabsContent>
          <TabsContent value="sent" className="mt-4"><SentList /></TabsContent>
          <TabsContent value="scheduled" className="mt-4"><ScheduledList /></TabsContent>
          <TabsContent value="drafts" className="mt-4"><DraftsList /></TabsContent>
          <TabsContent value="templates" className="mt-4"><TemplatesList /></TabsContent>
          <TabsContent value="campaigns" className="mt-4"><CampaignsList /></TabsContent>
          <TabsContent value="reports" className="mt-4"><EmailReports /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
