import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { TemplatesList } from './templates/TemplatesList';
import { CampaignsList } from './campaigns/CampaignsList';
import { EmailProviderSettings } from './settings/EmailProviderSettings';
import { Mail, FileText, Megaphone, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmailDashboard = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [tab, setTab] = useState('templates');

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

  const stats = [
    { label: 'Templates', count: templateCount, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', icon: FileText },
    { label: 'Campaigns', count: campaignCount, color: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', icon: Megaphone },
    { label: 'Emails Sent', count: emailsSent, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Email</h2>
            <p className="text-sm text-muted-foreground">Templates, campaigns, and delivery settings</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className={`p-3 bg-gradient-to-br ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.text}`}>{s.count}</p>
                </div>
                <s.icon className={`h-5 w-5 ${s.text} opacity-50`} />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card/50 border border-border/30 backdrop-blur-sm">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-4"><TemplatesList /></TabsContent>
        <TabsContent value="campaigns" className="mt-4"><CampaignsList /></TabsContent>
        <TabsContent value="settings" className="mt-4"><EmailProviderSettings /></TabsContent>
      </Tabs>
    </div>
  );
};