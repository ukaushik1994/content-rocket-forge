import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, Twitter, Linkedin, Instagram, Facebook, Check, AlertCircle, Database, CheckCircle, XCircle, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { loadSeedData } from '@/utils/engage/seedData';
import { motion } from 'framer-motion';

const socialProviders = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'bg-foreground/10', iconColor: 'text-foreground' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500/10', iconColor: 'text-pink-400' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600/10', iconColor: 'text-blue-500' },
];

export const EngageIntegrationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: membership } = useQuery({
    queryKey: ['user-workspace-membership', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('workspace_id, role').eq('user_id', user!.id).limit(1).single();
      return data;
    },
    enabled: !!user,
  });

  const workspaceId = membership?.workspace_id;

  const [emailForm, setEmailForm] = useState({ provider: 'resend', api_key: '', from_name: '', from_email: '', reply_to: '' });

  const { data: emailSettings } = useQuery({
    queryKey: ['email-provider-settings-global', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_provider_settings').select('*').eq('workspace_id', workspaceId!).single();
      return data;
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (emailSettings) {
      setEmailForm({
        provider: emailSettings.provider || 'resend',
        api_key: (emailSettings.config as any)?.api_key || '',
        from_name: emailSettings.from_name || '',
        from_email: emailSettings.from_email || '',
        reply_to: emailSettings.reply_to || '',
      });
    }
  }, [emailSettings]);

  const saveEmail = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: workspaceId!, provider: emailForm.provider,
        config: { api_key: emailForm.api_key },
        from_name: emailForm.from_name, from_email: emailForm.from_email, reply_to: emailForm.reply_to,
      };
      if (emailSettings) {
        await supabase.from('email_provider_settings').update(payload).eq('id', emailSettings.id);
      } else {
        await supabase.from('email_provider_settings').insert(payload);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-provider-settings-global'] }); toast.success('Email settings saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const sendTestEmail = useMutation({
    mutationFn: async () => {
      if (!emailForm.from_email) throw new Error('Set a from email first');
      const { data, error } = await supabase.functions.invoke('engage-email-send', {
        body: { to: emailForm.from_email, subject: 'Creaiter Test Email', html: '<h1>It works!</h1><p>Your Engage email integration is configured correctly.</p>' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success('Test email sent!'),
    onError: (e: any) => toast.error(`Test failed: ${e.message}`),
  });

  const { data: socialAccounts = [] } = useQuery({
    queryKey: ['social-accounts-settings', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('social_accounts').select('*').eq('workspace_id', workspaceId!);
      return data || [];
    },
    enabled: !!workspaceId,
  });

  const [loadingDemo, setLoadingDemo] = useState(false);
  const handleLoadDemo = async () => {
    if (!workspaceId || !user) return;
    setLoadingDemo(true);
    await loadSeedData(workspaceId, user.id);
    queryClient.invalidateQueries();
    setLoadingDemo(false);
  };

  const emailConfigured = !!emailSettings;
  const apiKeySet = !!(emailSettings?.config as any)?.api_key;

  if (!workspaceId) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No workspace found. Visit Engage to auto-create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connection Status</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${emailConfigured ? 'bg-emerald-500/20' : 'bg-destructive/20'}`}>
                {emailConfigured ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-destructive" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Email Provider</p>
                <p className="text-[10px] text-muted-foreground">{emailConfigured ? 'Configured' : 'Not configured'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${apiKeySet ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {apiKeySet ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">API Key</p>
                <p className="text-[10px] text-muted-foreground">{apiKeySet ? 'Set' : 'Missing'}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Email Provider */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email Provider</h3>
              <p className="text-[10px] text-muted-foreground">Configure your email sending service</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs">Provider</Label>
              <Select value={emailForm.provider} onValueChange={v => setEmailForm(f => ({ ...f, provider: v }))}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="smtp">SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">{emailForm.provider === 'resend' ? 'Resend API Key' : 'SMTP Connection String'}</Label>
                {emailForm.provider === 'resend' && (
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    Get key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
              <Input type="password" className="h-9 mt-1" value={emailForm.api_key} onChange={e => setEmailForm(f => ({ ...f, api_key: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From Name</Label><Input className="h-9 mt-1" value={emailForm.from_name} onChange={e => setEmailForm(f => ({ ...f, from_name: e.target.value }))} /></div>
              <div><Label className="text-xs">From Email</Label><Input className="h-9 mt-1" value={emailForm.from_email} onChange={e => setEmailForm(f => ({ ...f, from_email: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Reply To</Label><Input className="h-9 mt-1" value={emailForm.reply_to} onChange={e => setEmailForm(f => ({ ...f, reply_to: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button onClick={() => saveEmail.mutate()} disabled={saveEmail.isPending} size="sm">
                <Save className="h-3.5 w-3.5 mr-1" /> Save Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => sendTestEmail.mutate()} disabled={!emailConfigured || sendTestEmail.isPending}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send Test Email
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Social Accounts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Twitter className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Social Accounts</h3>
              <p className="text-[10px] text-muted-foreground">Connect your social media accounts</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialProviders.map(p => {
              const connected = socialAccounts.find((a: any) => a.provider === p.id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/30 hover:border-border/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${p.color}`}>
                      <p.icon className={`h-4 w-4 ${p.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{connected ? connected.display_name : 'Not connected'}</p>
                    </div>
                  </div>
                  {connected ? (
                    <Badge variant="outline" className="gap-1 text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      <Check className="h-2.5 w-2.5" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toast.info('OAuth integration coming soon')}>
                      Coming Soon
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Seed Data */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Demo Data</h3>
              <p className="text-[10px] text-muted-foreground">Load sample contacts, segments, templates, and a journey for testing</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLoadDemo} disabled={loadingDemo}>
            <Database className="h-3.5 w-3.5 mr-1" /> {loadingDemo ? 'Loading...' : 'Load Demo Data'}
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};
