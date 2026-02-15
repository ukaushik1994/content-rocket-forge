import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Send, Megaphone, MoreVertical, Trash2, Mail, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { class: string; icon: any; dot: string }> = {
  draft: { class: 'bg-muted/50 text-muted-foreground border-border/50', icon: Clock, dot: 'bg-muted-foreground' },
  scheduled: { class: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Clock, dot: 'bg-blue-400' },
  sending: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Send, dot: 'bg-amber-400' },
  complete: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle, dot: 'bg-emerald-400' },
  failed: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle, dot: 'bg-destructive' },
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
      const { data } = await supabase.from('email_templates').select('id, name').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('email_campaigns').insert({
        workspace_id: currentWorkspaceId!, name: form.name, template_id: form.template_id || null, created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setShowCreate(false); setForm({ name: '', template_id: '' }); toast.success('Campaign created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-campaigns'] }); toast.success('Campaign deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const launchCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      if (!campaign?.template_id) { toast.error('No template selected'); return; }

      const { data: template } = await supabase.from('email_templates').select('*').eq('id', campaign.template_id).single();
      const { data: contacts } = await supabase.from('engage_contacts').select('id, email, first_name, last_name')
        .eq('workspace_id', currentWorkspaceId!).eq('unsubscribed', false);

      if (!contacts?.length) { toast.error('No active contacts'); return; }

      const messages = contacts.map((c: any) => ({
        workspace_id: currentWorkspaceId!, campaign_id: campaignId, contact_id: c.id, to_email: c.email,
        subject: (template?.subject || '').replace(/\{\{first_name\}\}/g, c.first_name || '').replace(/\{\{last_name\}\}/g, c.last_name || ''),
        body_html: (template?.body_html || '').replace(/\{\{first_name\}\}/g, c.first_name || '').replace(/\{\{last_name\}\}/g, c.last_name || '').replace(/\{\{email\}\}/g, c.email),
        status: 'queued' as const,
      }));

      const { error: msgErr } = await supabase.from('email_messages').insert(messages);
      if (msgErr) throw msgErr;

      const { error: updateErr } = await supabase.from('email_campaigns')
        .update({ status: 'sending', started_at: new Date().toISOString() }).eq('id', campaignId);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-campaigns'] }); toast.success('Campaign launched!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const stats = {
    draft: campaigns.filter((c: any) => c.status === 'draft').length,
    sending: campaigns.filter((c: any) => c.status === 'sending').length,
    complete: campaigns.filter((c: any) => c.status === 'complete').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Campaigns</h2>
          <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
              <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Template</Label>
                  <Select value={form.template_id} onValueChange={v => setForm(f => ({ ...f, template_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                    <SelectContent>{templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createCampaign.mutate()} disabled={!form.name} className="w-full">Create Campaign</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Draft', count: stats.draft, color: 'from-muted/40 to-muted/10', text: 'text-muted-foreground', icon: Clock },
            { label: 'Sending', count: stats.sending, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', icon: Send },
            { label: 'Complete', count: stats.complete, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: CheckCircle },
          ].map((s, i) => (
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
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : campaigns.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
            <Megaphone className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-muted-foreground">No campaigns yet</p>
          {canEdit && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create First Campaign</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c: any, i: number) => {
            const sc = statusConfig[c.status] || statusConfig.draft;
            const campaignStats = c.stats || {};
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-4 hover:border-primary/30 hover:scale-[1.01] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <h3 className="font-medium text-foreground">{c.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${sc.class}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.email_templates?.name || 'No template'} • {format(new Date(c.created_at), 'MMM d, yyyy')}
                      </p>
                      {c.status !== 'draft' && (
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Sent: {campaignStats.sent || 0}</span>
                          <span>Delivered: {campaignStats.delivered || 0}</span>
                          <span>Failed: {campaignStats.failed || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {c.status === 'draft' && canEdit && (
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => launchCampaign.mutate(c.id)}>
                          <Send className="h-3 w-3 mr-1" /> Launch
                        </Button>
                      )}
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteCampaign.mutate(c.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
