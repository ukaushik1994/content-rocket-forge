import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export const EmailProviderSettings = () => {
  const { currentWorkspaceId, canManage } = useWorkspace();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    provider: 'resend',
    api_key: '',
    from_name: '',
    from_email: '',
    reply_to: '',
  });

  const { data: settings } = useQuery({
    queryKey: ['email-provider-settings', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_provider_settings')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .single();
      return data;
    },
    enabled: !!currentWorkspaceId,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        provider: settings.provider || 'resend',
        api_key: (settings.config as any)?.api_key || '',
        from_name: settings.from_name || '',
        from_email: settings.from_email || '',
        reply_to: settings.reply_to || '',
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: currentWorkspaceId!,
        provider: form.provider,
        config: { api_key: form.api_key },
        from_name: form.from_name,
        from_email: form.from_email,
        reply_to: form.reply_to,
      };

      if (settings) {
        const { error } = await supabase.from('email_provider_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_provider_settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-provider-settings'] });
      toast.success('Settings saved');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Email Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Provider</Label>
          <Select value={form.provider} onValueChange={v => setForm(f => ({ ...f, provider: v }))} disabled={!canManage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="resend">Resend</SelectItem>
              <SelectItem value="smtp">SMTP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>API Key</Label>
          <Input type="password" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} disabled={!canManage} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>From Name</Label><Input value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))} disabled={!canManage} /></div>
          <div><Label>From Email</Label><Input value={form.from_email} onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))} disabled={!canManage} /></div>
        </div>
        <div><Label>Reply To</Label><Input value={form.reply_to} onChange={e => setForm(f => ({ ...f, reply_to: e.target.value }))} disabled={!canManage} /></div>
        {canManage && (
          <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
            <Save className="h-4 w-4 mr-1" /> Save Settings
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
