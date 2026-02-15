import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, Twitter, Linkedin, Instagram, Facebook, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const socialProviders = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-foreground' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-info' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-primary' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-info' },
];

export const EngageIntegrationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get first workspace for user
  const { data: membership } = useQuery({
    queryKey: ['user-workspace-membership', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('workspace_id, role')
        .eq('user_id', user!.id)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const workspaceId = membership?.workspace_id;

  // Email provider settings
  const [emailForm, setEmailForm] = useState({
    provider: 'resend', api_key: '', from_name: '', from_email: '', reply_to: '',
  });

  const { data: emailSettings } = useQuery({
    queryKey: ['email-provider-settings-global', workspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_provider_settings')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .single();
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
        workspace_id: workspaceId!,
        provider: emailForm.provider,
        config: { api_key: emailForm.api_key },
        from_name: emailForm.from_name,
        from_email: emailForm.from_email,
        reply_to: emailForm.reply_to,
      };
      if (emailSettings) {
        await supabase.from('email_provider_settings').update(payload).eq('id', emailSettings.id);
      } else {
        await supabase.from('email_provider_settings').insert(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-provider-settings-global'] });
      toast.success('Email settings saved');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Social accounts
  const { data: socialAccounts = [] } = useQuery({
    queryKey: ['social-accounts-settings', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('social_accounts').select('*').eq('workspace_id', workspaceId!);
      return data || [];
    },
    enabled: !!workspaceId,
  });

  if (!workspaceId) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No workspace found. Join or create a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Provider */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email Provider</CardTitle>
          <CardDescription>Configure your email sending service for campaigns and journeys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Select value={emailForm.provider} onValueChange={v => setEmailForm(f => ({ ...f, provider: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="resend">Resend</SelectItem>
                <SelectItem value="smtp">SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{emailForm.provider === 'resend' ? 'Resend API Key' : 'SMTP Connection String'}</Label>
            <Input type="password" value={emailForm.api_key} onChange={e => setEmailForm(f => ({ ...f, api_key: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From Name</Label><Input value={emailForm.from_name} onChange={e => setEmailForm(f => ({ ...f, from_name: e.target.value }))} /></div>
            <div><Label>From Email</Label><Input value={emailForm.from_email} onChange={e => setEmailForm(f => ({ ...f, from_email: e.target.value }))} /></div>
          </div>
          <div><Label>Reply To</Label><Input value={emailForm.reply_to} onChange={e => setEmailForm(f => ({ ...f, reply_to: e.target.value }))} /></div>
          <Button onClick={() => saveEmail.mutate()} disabled={saveEmail.isPending} size="sm">
            <Save className="h-3.5 w-3.5 mr-1" /> Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* Social Accounts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Twitter className="h-4 w-4" /> Social Accounts</CardTitle>
          <CardDescription>Connect your social media accounts for scheduling posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialProviders.map(p => {
              const connected = socialAccounts.find((a: any) => a.provider === p.id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {connected ? connected.display_name : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {connected ? (
                    <Badge variant="outline" className="gap-1 text-success border-success/30">
                      <Check className="h-3 w-3" /> Connected
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => toast.info('OAuth integration coming soon')}>
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
