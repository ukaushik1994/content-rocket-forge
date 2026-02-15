import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-info/20 text-info',
  sending: 'bg-warning/20 text-warning',
  complete: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
};

export const CampaignsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', template_id: '' });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['email-campaigns', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(name)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates-select', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_templates')
        .select('id, name')
        .eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('email_campaigns').insert({
        workspace_id: currentWorkspaceId!,
        name: form.name,
        template_id: form.template_id || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setShowCreate(false);
      setForm({ name: '', template_id: '' });
      toast.success('Campaign created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const launchCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      // Resolve segment memberships and queue messages
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      if (!campaign?.template_id) { toast.error('No template selected'); return; }

      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();

      const { data: contacts } = await supabase
        .from('engage_contacts')
        .select('id, email, first_name, last_name')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('unsubscribed', false);

      if (!contacts?.length) { toast.error('No active contacts'); return; }

      const messages = contacts.map((c: any) => ({
        workspace_id: currentWorkspaceId!,
        campaign_id: campaignId,
        contact_id: c.id,
        to_email: c.email,
        subject: (template?.subject || '').replace(/\{\{first_name\}\}/g, c.first_name || '').replace(/\{\{last_name\}\}/g, c.last_name || ''),
        body_html: (template?.body_html || '').replace(/\{\{first_name\}\}/g, c.first_name || '').replace(/\{\{last_name\}\}/g, c.last_name || '').replace(/\{\{email\}\}/g, c.email),
        status: 'queued' as const,
      }));

      const { error: msgErr } = await supabase.from('email_messages').insert(messages);
      if (msgErr) throw msgErr;

      const { error: updateErr } = await supabase
        .from('email_campaigns')
        .update({ status: 'sending', started_at: new Date().toISOString() })
        .eq('id', campaignId);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast.success('Campaign launched! Messages queued.');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Template</Label>
                  <Select value={form.template_id} onValueChange={v => setForm(f => ({ ...f, template_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createCampaign.mutate()} disabled={!form.name} className="w-full">Create Campaign</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No campaigns yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c: any) => {
            const stats = c.stats || {};
            return (
              <Card key={c.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{c.name}</h3>
                        <Badge className={statusColors[c.status] || ''}>{c.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.email_templates?.name || 'No template'} • {format(new Date(c.created_at), 'MMM d')}
                      </p>
                      {c.status !== 'draft' && (
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Sent: {stats.sent || 0}</span>
                          <span>Delivered: {stats.delivered || 0}</span>
                          <span>Failed: {stats.failed || 0}</span>
                        </div>
                      )}
                    </div>
                    {c.status === 'draft' && canEdit && (
                      <Button size="sm" variant="default" onClick={() => launchCampaign.mutate(c.id)}>
                        <Send className="h-3.5 w-3.5 mr-1" /> Launch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
