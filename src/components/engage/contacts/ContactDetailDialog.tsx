import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Save, Mail, Activity, X, UserCheck, UserX, Tag, Route, Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ContactDetailDialogProps {
  contact: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactDetailDialog = ({ contact, open, onOpenChange }: ContactDetailDialogProps) => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', tags: '' });
  const [newTag, setNewTag] = useState('');
  const [showJourneyPicker, setShowJourneyPicker] = useState(false);
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  useEffect(() => {
    if (contact) {
      setForm({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        phone: contact.phone || '',
        tags: (contact.tags || []).join(', '),
      });
    }
  }, [contact]);

  const { data: events = [] } = useQuery({
    queryKey: ['contact-events', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_events').select('*')
        .eq('contact_id', contact!.id)
        .order('occurred_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['contact-activity', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_activity_log').select('*')
        .eq('contact_id', contact!.id)
        .order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  const { data: emails = [] } = useQuery({
    queryKey: ['contact-emails', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_messages').select('id, to_email, subject, status, sent_at, queued_at')
        .eq('contact_id', contact!.id)
        .order('queued_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  const { data: segmentMemberships = [] } = useQuery({
    queryKey: ['contact-segments', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_segment_memberships')
        .select('segment_id, computed_at, engage_segments(name)')
        .eq('contact_id', contact!.id);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  const { data: activeJourneys = [] } = useQuery({
    queryKey: ['active-journeys-for-enroll', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('journeys').select('id, name')
        .eq('workspace_id', currentWorkspaceId!).eq('status', 'active');
      return data || [];
    },
    enabled: !!currentWorkspaceId && showJourneyPicker,
  });

  const updateContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('engage_contacts').update({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone: form.phone || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }).eq('id', contact.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      toast.success('Contact updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateAttributes = useMutation({
    mutationFn: async (attrs: Record<string, any>) => {
      const { error } = await supabase.from('engage_contacts').update({ attributes: attrs }).eq('id', contact.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      toast.success('Attributes updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleUnsubscribe = useMutation({
    mutationFn: async () => {
      const newVal = !contact.unsubscribed;
      const { error } = await supabase.from('engage_contacts').update({
        unsubscribed: newVal,
        unsubscribed_at: newVal ? new Date().toISOString() : null,
      }).eq('id', contact.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      toast.success(contact.unsubscribed ? 'Contact resubscribed' : 'Contact unsubscribed');
    },
  });

  const enrollInJourney = useMutation({
    mutationFn: async (journey: any) => {
      // Create enrollment and get back the ID
      const { data: enrollment, error: enrollErr } = await supabase.from('journey_enrollments').insert({
        workspace_id: currentWorkspaceId!,
        journey_id: journey.id,
        contact_id: contact.id,
        status: 'active',
      }).select('id').single();
      if (enrollErr) throw enrollErr;

      // Query journey_nodes for the trigger node
      const { data: nodes } = await supabase.from('journey_nodes').select('id, type, config')
        .eq('journey_id', journey.id).eq('workspace_id', currentWorkspaceId!);
      
      const triggerNode = (nodes || []).find((n: any) => n.type === 'triggerNode' || n.type === 'trigger');
      if (triggerNode && enrollment) {
        await supabase.from('journey_steps').insert({
          workspace_id: currentWorkspaceId!,
          enrollment_id: enrollment.id,
          node_id: triggerNode.id,
          status: 'pending',
          scheduled_for: new Date().toISOString(),
          output: {},
        });
      }
    },
    onSuccess: () => {
      setShowJourneyPicker(false);
      toast.success('Contact enrolled in journey');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!contact) return null;

  const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const removeTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag).join(', ');
    setForm(f => ({ ...f, tags: updated }));
  };
  const addTag = () => {
    if (!newTag.trim()) return;
    const updated = [...tags, newTag.trim()].join(', ');
    setForm(f => ({ ...f, tags: updated }));
    setNewTag('');
  };

  const attributes = contact.attributes || {};
  const addAttribute = () => {
    if (!attrKey.trim()) return;
    const updated = { ...attributes, [attrKey.trim()]: attrVal };
    updateAttributes.mutate(updated);
    setAttrKey('');
    setAttrVal('');
  };
  const removeAttribute = (key: string) => {
    const updated = { ...attributes };
    delete updated[key];
    updateAttributes.mutate(updated);
  };

  const emailStatusColors: Record<string, string> = {
    queued: 'bg-muted/50 text-muted-foreground',
    sent: 'bg-blue-500/10 text-blue-400',
    delivered: 'bg-emerald-500/10 text-emerald-400',
    failed: 'bg-destructive/10 text-destructive',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-md opacity-40 bg-gradient-to-br from-emerald-400 to-teal-400" />
              <div className="relative p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <Mail className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{contact.email}</span>
          </DialogTitle>
          <div className="h-px mt-2 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20" />
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="h-8">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activity ({activity.length})</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="emails" className="text-xs">Emails ({emails.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {contact.unsubscribed ? (
                <Badge variant="destructive" className="text-xs gap-1"><UserX className="h-3 w-3" /> Unsubscribed</Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 text-emerald-400 border-emerald-500/30 bg-emerald-500/10"><UserCheck className="h-3 w-3" /> Active</Badge>
              )}
              {canEdit && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toggleUnsubscribe.mutate()}>
                  {contact.unsubscribed ? 'Resubscribe' : 'Unsubscribe'}
                </Button>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">First Name</Label><Input className="h-9 mt-1" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} disabled={!canEdit} /></div>
              <div><Label className="text-xs">Last Name</Label><Input className="h-9 mt-1" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} disabled={!canEdit} /></div>
            </div>
            <div><Label className="text-xs">Phone</Label><Input className="h-9 mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!canEdit} /></div>

            {/* Tags */}
            <div>
              <Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" /> Tags</Label>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    {tag}
                    {canEdit && <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />}
                  </Badge>
                ))}
              </div>
              {canEdit && (
                <div className="flex gap-2 mt-2">
                  <Input className="h-8 text-xs" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === 'Enter' && addTag()} />
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addTag}>Add</Button>
                </div>
              )}
            </div>

            {/* Segment Memberships */}
            {segmentMemberships.length > 0 && (
              <div>
                <Label className="text-xs flex items-center gap-1"><Layers className="h-3 w-3" /> Segments</Label>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {segmentMemberships.map((m: any) => (
                    <Badge key={m.segment_id} variant="outline" className="text-xs text-violet-400 border-violet-500/30 bg-violet-500/10">
                      {(m.engage_segments as any)?.name || 'Unknown'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes Editor */}
            <div>
              <Label className="text-xs">Custom Attributes</Label>
              {Object.keys(attributes).length > 0 && (
                <div className="space-y-1 mt-2">
                  {Object.entries(attributes).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground min-w-[80px]">{key}:</span>
                      <span className="text-foreground flex-1 truncate">{String(val)}</span>
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeAttribute(key)}>
                          <Trash2 className="h-2.5 w-2.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {canEdit && (
                <div className="flex gap-2 mt-2">
                  <Input className="h-8 text-xs flex-1" value={attrKey} onChange={e => setAttrKey(e.target.value)} placeholder="Key" />
                  <Input className="h-8 text-xs flex-1" value={attrVal} onChange={e => setAttrVal(e.target.value)} placeholder="Value" onKeyDown={e => e.key === 'Enter' && addAttribute()} />
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addAttribute}><Plus className="h-3 w-3" /></Button>
                </div>
              )}
            </div>

            {/* Enroll in Journey */}
            {canEdit && (
              <Popover open={showJourneyPicker} onOpenChange={setShowJourneyPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <Route className="h-3.5 w-3.5" /> Enroll in Journey
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Active Journeys</p>
                  {activeJourneys.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">No active journeys</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {activeJourneys.map((j: any) => (
                        <button
                          key={j.id}
                          onClick={() => enrollInJourney.mutate(j)}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted/50 transition-colors"
                          disabled={enrollInJourney.isPending}
                        >
                          {j.name}
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* Metadata */}
            <GlassCard className="p-3">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Created: {format(new Date(contact.created_at), 'MMM d, yyyy HH:mm')}</div>
                <div>Updated: {format(new Date(contact.updated_at), 'MMM d, yyyy HH:mm')}</div>
              </div>
            </GlassCard>

            {canEdit && (
              <Button onClick={() => updateContact.mutate()} disabled={updateContact.isPending} size="sm" className="w-full">
                <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
              </Button>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            {activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No activity recorded
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {activity.map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{a.channel}</Badge>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(a.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No events recorded</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {events.map((e: any) => (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                    <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{e.type}</p>
                      <pre className="text-[10px] text-muted-foreground mt-1 overflow-hidden text-ellipsis">{JSON.stringify(e.payload, null, 2).slice(0, 200)}</pre>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(e.occurred_at), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="emails" className="mt-4">
            {emails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No emails sent
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {emails.map((e: any) => (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                    <Mail className="h-3.5 w-3.5 mt-0.5 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{e.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] ${emailStatusColors[e.status] || ''}`}>{e.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(e.sent_at || e.queued_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};