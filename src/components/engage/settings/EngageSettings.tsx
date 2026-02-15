import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, Twitter, Linkedin, Instagram, Facebook, Check, AlertCircle, Database, CheckCircle, Send, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { loadSeedData } from '@/utils/engage/seedData';
import { motion } from 'framer-motion';
import { SimpleProviderCard } from '@/components/settings/api/SimpleProviderCard';
import { API_PROVIDERS } from '@/components/settings/api/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const socialProviders = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'bg-foreground/10', iconColor: 'text-foreground' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500/10', iconColor: 'text-pink-400' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600/10', iconColor: 'text-blue-500' },
];

const resendProvider = API_PROVIDERS.find(p => p.id === 'resend')!;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3 },
});

export const EngageSettings = () => {
  const { user } = useAuth();
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspaceId;

  // Sender config
  const [senderForm, setSenderForm] = useState({ from_name: '', from_email: '', reply_to: '' });

  const { data: emailSettings } = useQuery({
    queryKey: ['email-provider-settings-global', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_provider_settings').select('*').eq('workspace_id', workspaceId!).single();
      return data;
    },
    enabled: !!workspaceId,
  });

  const { data: resendKeyConfigured } = useQuery({
    queryKey: ['resend-key-status', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_keys_metadata')
        .select('is_active')
        .eq('user_id', user!.id)
        .eq('service', 'resend')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (emailSettings) {
      setSenderForm({
        from_name: emailSettings.from_name || '',
        from_email: emailSettings.from_email || '',
        reply_to: emailSettings.reply_to || '',
      });
    }
  }, [emailSettings]);

  const saveSenderConfig = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: workspaceId!,
        provider: 'resend',
        config: {},
        from_name: senderForm.from_name,
        from_email: senderForm.from_email,
        reply_to: senderForm.reply_to,
      };
      if (emailSettings) {
        await supabase.from('email_provider_settings').update(payload).eq('id', emailSettings.id);
      } else {
        await supabase.from('email_provider_settings').insert(payload);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-provider-settings-global'] }); toast.success('Sender settings saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const sendTestEmail = useMutation({
    mutationFn: async () => {
      if (!senderForm.from_email) throw new Error('Set a from email first');
      const { data, error } = await supabase.functions.invoke('engage-email-send', {
        body: { to: senderForm.from_email, subject: 'Creaiter Test Email', html: '<h1>It works!</h1><p>Your Engage email integration is configured correctly.</p>' },
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

  const deleteAllContacts = useMutation({
    mutationFn: async () => {
      await supabase.from('engage_contacts').delete().eq('workspace_id', workspaceId!);
    },
    onSuccess: () => { queryClient.invalidateQueries(); toast.success('All contacts deleted'); },
  });

  const senderConfigured = !!emailSettings?.from_email;

  if (!workspaceId) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No workspace found. Visit Engage to auto-create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero */}
      <motion.div {...fadeUp()}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Engage Settings</h2>
            <p className="text-sm text-muted-foreground">API keys, sender config, and integrations</p>
          </div>
        </div>
      </motion.div>

      {/* Connection Status */}
      <motion.div {...fadeUp(0.03)}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connection Status</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${resendKeyConfigured ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {resendKeyConfigured ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Resend API Key</p>
                <p className="text-[10px] text-muted-foreground">{resendKeyConfigured ? 'Configured' : 'Not configured'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${senderConfigured ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {senderConfigured ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Sender Details</p>
                <p className="text-[10px] text-muted-foreground">{senderConfigured ? 'Set' : 'Missing'}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Resend API Key */}
      <motion.div {...fadeUp(0.06)}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email API Key</h3>
              <p className="text-[10px] text-muted-foreground">Encrypted storage, same system as all other API keys</p>
            </div>
          </div>
          <SimpleProviderCard provider={resendProvider} />
        </GlassCard>
      </motion.div>

      {/* Sender Configuration */}
      <motion.div {...fadeUp(0.09)}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Send className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sender Details</h3>
              <p className="text-[10px] text-muted-foreground">Configure your from name, email, and reply-to</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From Name</Label><Input className="h-9 mt-1" value={senderForm.from_name} onChange={e => setSenderForm(f => ({ ...f, from_name: e.target.value }))} placeholder="Your Company" /></div>
              <div><Label className="text-xs">From Email</Label><Input className="h-9 mt-1" value={senderForm.from_email} onChange={e => setSenderForm(f => ({ ...f, from_email: e.target.value }))} placeholder="hello@yourdomain.com" /></div>
            </div>
            <div><Label className="text-xs">Reply To</Label><Input className="h-9 mt-1" value={senderForm.reply_to} onChange={e => setSenderForm(f => ({ ...f, reply_to: e.target.value }))} placeholder="support@yourdomain.com" /></div>
            <div className="flex gap-2">
              <Button onClick={() => saveSenderConfig.mutate()} disabled={saveSenderConfig.isPending} size="sm">
                <Save className="h-3.5 w-3.5 mr-1" /> Save Sender Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => sendTestEmail.mutate()} disabled={!senderConfigured || sendTestEmail.isPending}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send Test Email
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Social Accounts */}
      <motion.div {...fadeUp(0.12)}>
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

      {/* Demo Data */}
      <motion.div {...fadeUp(0.18)}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Demo Data</h3>
              <p className="text-[10px] text-muted-foreground">Load sample contacts, segments, templates, and a journey</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLoadDemo} disabled={loadingDemo}>
            <Database className="h-3.5 w-3.5 mr-1" /> {loadingDemo ? 'Loading...' : 'Load Demo Data'}
          </Button>
        </GlassCard>
      </motion.div>

      {/* Danger Zone */}
      <motion.div {...fadeUp(0.21)}>
        <GlassCard className="p-5 border-destructive/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-[10px] text-muted-foreground">Irreversible actions</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete All Contacts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all contacts?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all contacts. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteAllContacts.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </GlassCard>
      </motion.div>
    </div>
  );
};