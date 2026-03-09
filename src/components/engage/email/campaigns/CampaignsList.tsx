import React, { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Send, Megaphone, MoreVertical, Trash2, Mail, CheckCircle, Clock, AlertTriangle, ChevronRight, ChevronLeft, Copy, Pencil, Users, CalendarIcon, BarChart3, X, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { EngageButton } from '../../shared/EngageButton';
import { EngageDialogHeader } from '../../shared/EngageDialogHeader';

const statusConfig: Record<string, { class: string; icon: any; dot: string }> = {
  draft: { class: 'bg-muted/50 text-muted-foreground border-border/50', icon: Clock, dot: 'bg-muted-foreground' },
  scheduled: { class: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Clock, dot: 'bg-blue-400' },
  sending: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Send, dot: 'bg-amber-400' },
  complete: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle, dot: 'bg-emerald-400' },
  failed: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle, dot: 'bg-destructive' },
};

type AudienceType = 'all' | 'segment' | 'tags';

interface WizardForm {
  name: string;
  template_id: string;
  audience_type: AudienceType;
  segment_id: string;
  tags: string;
  schedule_type: 'now' | 'later';
  scheduled_at: string;
}

const defaultForm: WizardForm = {
  name: '', template_id: '', audience_type: 'all', segment_id: '', tags: '', schedule_type: 'now', scheduled_at: '',
};

interface CampaignsListProps {
  openWizardOnMount?: boolean;
  onWizardOpened?: () => void;
}

export const CampaignsList = ({ openWizardOnMount, onWizardOpened }: CampaignsListProps) => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [form, setForm] = useState<WizardForm>({ ...defaultForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [detailCampaign, setDetailCampaign] = useState<any>(null);

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

  const { data: segments = [] } = useQuery({
    queryKey: ['engage-segments-select', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('engage_segments').select('id, name').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  // Campaign detail messages
  const { data: detailMessages = [] } = useQuery({
    queryKey: ['campaign-messages', detailCampaign?.id],
    queryFn: async () => {
      const { data } = await supabase.from('email_messages')
        .select('id, to_email, subject, status, sent_at, error')
        .eq('campaign_id', detailCampaign!.id)
        .order('queued_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!detailCampaign?.id,
  });

  const estimateRecipients = async (audienceType: AudienceType, segmentId?: string, tags?: string) => {
    try {
      if (audienceType === 'all') {
        const { count } = await supabase.from('engage_contacts').select('*', { count: 'exact', head: true })
          .eq('workspace_id', currentWorkspaceId!).eq('unsubscribed', false);
        setRecipientCount(count || 0);
      } else if (audienceType === 'segment' && segmentId) {
        const { count } = await supabase.from('engage_segment_memberships').select('*', { count: 'exact', head: true })
          .eq('segment_id', segmentId);
        setRecipientCount(count || 0);
      } else if (audienceType === 'tags' && tags) {
        const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagArr.length) {
          const { count } = await supabase.from('engage_contacts').select('*', { count: 'exact', head: true })
            .eq('workspace_id', currentWorkspaceId!).eq('unsubscribed', false).overlaps('tags', tagArr);
          setRecipientCount(count || 0);
        } else {
          setRecipientCount(0);
        }
      } else {
        setRecipientCount(null);
      }
    } catch { setRecipientCount(null); }
  };

  const openWizard = (campaign?: any) => {
    if (campaign) {
      setEditingId(campaign.id);
      const audienceDef = campaign.audience_definition || {};
      setForm({
        name: campaign.name,
        template_id: campaign.template_id || '',
        audience_type: audienceDef.type || 'all',
        segment_id: audienceDef.segment_id || '',
        tags: (audienceDef.tags || []).join(', '),
        schedule_type: campaign.scheduled_at ? 'later' : 'now',
        scheduled_at: campaign.scheduled_at ? format(new Date(campaign.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
      });
    } else {
      setEditingId(null);
      setForm({ ...defaultForm });
    }
    setWizardStep(1);
    setRecipientCount(null);
    setShowWizard(true);
  };

  const saveCampaign = useMutation({
    mutationFn: async () => {
      const audienceDef: any = { type: form.audience_type };
      if (form.audience_type === 'segment') audienceDef.segment_id = form.segment_id;
      if (form.audience_type === 'tags') audienceDef.tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      const payload: any = {
        name: form.name,
        template_id: form.template_id || null,
        audience_definition: audienceDef,
        scheduled_at: form.schedule_type === 'later' && form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        status: form.schedule_type === 'later' && form.scheduled_at ? 'scheduled' : 'draft',
      };

      if (editingId) {
        const { error } = await supabase.from('email_campaigns').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_campaigns').insert({
          ...payload, workspace_id: currentWorkspaceId!, created_by: user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setShowWizard(false);
      toast.success(editingId ? 'Campaign updated' : 'Campaign created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateCampaign = useMutation({
    mutationFn: async (campaign: any) => {
      const { error } = await supabase.from('email_campaigns').insert({
        workspace_id: currentWorkspaceId!,
        name: `${campaign.name} (Copy)`,
        template_id: campaign.template_id,
        audience_definition: campaign.audience_definition,
        status: 'draft',
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast.success('Campaign duplicated');
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

  const cancelCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      // Delete queued messages
      await supabase.from('email_messages').delete().eq('campaign_id', campaignId).eq('status', 'queued');
      // Update campaign status
      const { error } = await supabase.from('email_campaigns').update({ status: 'failed' }).eq('id', campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-messages'] });
      toast.success('Campaign cancelled');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const launchCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      if (!campaign?.template_id) { toast.error('No template selected'); return; }

      const { data: template } = await supabase.from('email_templates').select('*').eq('id', campaign.template_id).single();
      const audienceDef = (campaign.audience_definition || { type: 'all' }) as any;

      let contacts: any[] = [];
      if (audienceDef.type === 'segment' && audienceDef.segment_id) {
        const { data: memberships } = await supabase.from('engage_segment_memberships')
          .select('contact_id').eq('segment_id', audienceDef.segment_id);
        const contactIds = (memberships || []).map((m: any) => m.contact_id);
        if (contactIds.length) {
          const { data } = await supabase.from('engage_contacts').select('id, email, first_name, last_name')
            .in('id', contactIds).eq('unsubscribed', false);
          contacts = data || [];
        }
      } else if (audienceDef.type === 'tags' && audienceDef.tags?.length) {
        const { data } = await supabase.from('engage_contacts').select('id, email, first_name, last_name')
          .eq('workspace_id', currentWorkspaceId!).eq('unsubscribed', false).overlaps('tags', audienceDef.tags);
        contacts = data || [];
      } else {
        const { data } = await supabase.from('engage_contacts').select('id, email, first_name, last_name')
          .eq('workspace_id', currentWorkspaceId!).eq('unsubscribed', false);
        contacts = data || [];
      }

      if (!contacts.length) { toast.error('No active contacts match audience'); return; }

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

  // Campaign detail stats
  const getDetailStats = (campaign: any) => {
    const s = campaign?.stats || {};
    const sent = s.sent || 0;
    const delivered = s.delivered || 0;
    const opened = s.opened || 0;
    const clicked = s.clicked || 0;
    const bounced = s.bounced || 0;
    const failed = s.failed || 0;
    const total = sent || 1;
    return { sent, delivered, opened, clicked, bounced, failed, total,
      deliveryRate: Math.round((delivered / total) * 100),
      openRate: Math.round((opened / total) * 100),
      clickRate: Math.round((opened ? clicked / opened : 0) * 100),
    };
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
          <EngageButton size="sm" onClick={() => openWizard()}><Plus className="h-4 w-4 mr-1" /> New Campaign</EngageButton>
        )}
      </div>

      {/* Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-lg">
          <EngageDialogHeader icon={Megaphone} title={editingId ? 'Edit Campaign' : 'Create Campaign'} gradientFrom="from-blue-400" gradientTo="to-cyan-400" iconColor="text-blue-400" />
          <div>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= wizardStep ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>

          {wizardStep === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium">Step 1: Name & Template</p>
              <div><Label>Campaign Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div>
                <Label>Template</Label>
                <Select value={form.template_id} onValueChange={v => setForm(f => ({ ...f, template_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>{templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={() => setWizardStep(2)} disabled={!form.name} className="w-full gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Users className="h-3 w-3" /> Step 2: Audience</p>
              <RadioGroup value={form.audience_type} onValueChange={(v: AudienceType) => { setForm(f => ({ ...f, audience_type: v })); estimateRecipients(v, form.segment_id, form.tags); }}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="aud-all" /><Label htmlFor="aud-all">All contacts</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="segment" id="aud-seg" /><Label htmlFor="aud-seg">Specific segment</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="tags" id="aud-tags" /><Label htmlFor="aud-tags">Filter by tags</Label></div>
              </RadioGroup>
              {form.audience_type === 'segment' && (
                <Select value={form.segment_id} onValueChange={v => { setForm(f => ({ ...f, segment_id: v })); estimateRecipients('segment', v); }}>
                  <SelectTrigger><SelectValue placeholder="Pick segment" /></SelectTrigger>
                  <SelectContent>{segments.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {form.audience_type === 'tags' && (
                <Input placeholder="e.g. newsletter, vip" value={form.tags} onChange={e => { setForm(f => ({ ...f, tags: e.target.value })); estimateRecipients('tags', undefined, e.target.value); }} />
              )}
              {recipientCount !== null && (
                <p className="text-xs text-muted-foreground">Estimated recipients: <span className="font-semibold text-foreground">{recipientCount}</span></p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setWizardStep(1)} className="flex-1 gap-1"><ChevronLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={() => setWizardStep(3)} className="flex-1 gap-1">Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Step 3: Schedule</p>
              <RadioGroup value={form.schedule_type} onValueChange={(v: 'now' | 'later') => setForm(f => ({ ...f, schedule_type: v }))}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="now" id="sch-now" /><Label htmlFor="sch-now">Save as draft (launch manually)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="later" id="sch-later" /><Label htmlFor="sch-later">Schedule for later</Label></div>
              </RadioGroup>
              {form.schedule_type === 'later' && (
                <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setWizardStep(2)} className="flex-1 gap-1"><ChevronLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={() => saveCampaign.mutate()} disabled={saveCampaign.isPending} className="flex-1">
                  {editingId ? 'Update' : 'Create'} Campaign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!detailCampaign} onOpenChange={() => setDetailCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <EngageDialogHeader icon={BarChart3} title={`${detailCampaign?.name || 'Campaign'} — Stats`} gradientFrom="from-violet-400" gradientTo="to-purple-400" iconColor="text-violet-400" />
          {detailCampaign && (() => {
            const ds = getDetailStats(detailCampaign);
            return (
              <div className="space-y-4">
                {/* Stat bars */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Sent', value: ds.sent, color: 'text-blue-400' },
                    { label: 'Delivered', value: ds.delivered, pct: ds.deliveryRate, color: 'text-emerald-400' },
                    { label: 'Opened', value: ds.opened, pct: ds.openRate, color: 'text-violet-400' },
                  ].map(s => (
                    <GlassCard key={s.label} className="p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      {s.pct !== undefined && <Progress value={s.pct} className="h-1 mt-1" />}
                    </GlassCard>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Clicked', value: ds.clicked, pct: ds.clickRate, color: 'text-cyan-400' },
                    { label: 'Bounced', value: ds.bounced, color: 'text-amber-400' },
                    { label: 'Failed', value: ds.failed, color: 'text-destructive' },
                  ].map(s => (
                    <GlassCard key={s.label} className="p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      {s.pct !== undefined && <Progress value={s.pct} className="h-1 mt-1" />}
                    </GlassCard>
                  ))}
                </div>

                {/* Message log */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Message Log ({detailMessages.length})</h4>
                  {detailMessages.length > 0 ? (
                    <GlassCard className="overflow-hidden max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/30">
                            <TableHead className="text-xs">Recipient</TableHead>
                            <TableHead className="text-xs">Subject</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailMessages.map((m: any) => (
                            <TableRow key={m.id} className="border-border/20">
                              <TableCell className="text-xs">{m.to_email}</TableCell>
                              <TableCell className="text-xs truncate max-w-[200px]">{m.subject}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-[10px] ${
                                  m.status === 'delivered' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                  m.status === 'failed' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                                  m.status === 'sent' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                                  'text-muted-foreground'
                                }`}>{m.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </GlassCard>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No messages recorded</p>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

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
          {canEdit && <Button size="sm" onClick={() => openWizard()}><Plus className="h-4 w-4 mr-1" /> Create First Campaign</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c: any, i: number) => {
            const sc = statusConfig[c.status] || statusConfig.draft;
            const campaignStats = c.stats || {};
            const isClickable = c.status !== 'draft';
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard
                  className={`p-4 hover:border-primary/30 hover:scale-[1.01] transition-all duration-200 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && setDetailCampaign(c)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <h3 className="font-medium text-foreground">{c.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${sc.class}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {c.status}
                        </Badge>
                        {isClickable && <BarChart3 className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.email_templates?.name || 'No template'} • {format(new Date(c.created_at), 'MMM d, yyyy')}
                        {(() => {
                          const ad = c.audience_definition as any;
                          if (ad?.type && ad.type !== 'all') {
                            return <> • Audience: {ad.type === 'segment' ? 'Segment' : `Tags: ${ad.tags?.join(', ')}`}</>;
                          }
                          return null;
                        })()}
                      </p>
                      {c.status !== 'draft' && (
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Sent: {campaignStats.sent || 0}</span>
                          <span>Delivered: {campaignStats.delivered || 0}</span>
                          <span>Failed: {campaignStats.failed || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {c.status === 'draft' && canEdit && (
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => launchCampaign.mutate(c.id)}>
                          <Send className="h-3 w-3 mr-1" /> Launch
                        </Button>
                      )}
                      {c.status === 'sending' && canEdit && (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => cancelCampaign.mutate(c.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      )}
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {c.status === 'draft' && (
                              <DropdownMenuItem onClick={() => openWizard(c)}>
                                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => duplicateCampaign.mutate(c)}>
                              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                            </DropdownMenuItem>
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