import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Variable } from 'lucide-react';
import { toast } from 'sonner';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VARIABLES = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
];

export const ComposeDialog: React.FC<ComposeDialogProps> = ({ open, onOpenChange }) => {
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates-compose', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_templates').select('id, name, subject, body_html').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: open && !!currentWorkspaceId,
  });

  const sendEmail = useMutation({
    mutationFn: async () => {
      if (!to.trim() || !subject.trim()) throw new Error('To and Subject required');

      // Find or create contact
      let contactId: string | null = null;
      const { data: existingContact } = await supabase
        .from('engage_contacts')
        .select('id')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('email', to.trim())
        .single();

      if (existingContact) {
        contactId = existingContact.id;
      }

      // Create thread
      const { data: thread, error: threadErr } = await supabase
        .from('email_threads')
        .insert({
          workspace_id: currentWorkspaceId!,
          contact_id: contactId,
          subject,
          status: 'waiting',
        })
        .select()
        .single();
      if (threadErr) throw threadErr;

      const bodyHtml = body ? `<p>${body.replace(/\n/g, '<br/>')}</p>` : '';

      // Create thread message
      await supabase.from('email_thread_messages').insert({
        workspace_id: currentWorkspaceId!,
        thread_id: thread.id,
        direction: 'outbound',
        from_email: '',
        to_email: to.trim(),
        subject,
        body_html: bodyHtml,
        body_text: body,
      });

      // Queue email
      await supabase.from('email_messages').insert({
        workspace_id: currentWorkspaceId!,
        thread_id: thread.id,
        contact_id: contactId,
        to_email: to.trim(),
        subject,
        body_html: bodyHtml,
        status: 'queued',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      onOpenChange(false);
      setTo(''); setSubject(''); setBody(''); setTemplateId('');
      toast.success('Email queued for delivery');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((t: any) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body_html?.replace(/<[^>]*>/g, '') || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">To *</Label>
            <Input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Template (optional)</Label>
            <Select value={templateId} onValueChange={applyTemplate}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose template..." /></SelectTrigger>
              <SelectContent>
                {templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Subject *</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Body</Label>
            <div className="flex gap-1 mb-1">
              {VARIABLES.map(v => (
                <Button key={v.key} variant="outline" size="sm" className="h-6 text-[10px] gap-0.5" onClick={() => setBody(b => b + `{{${v.key}}}`)}>
                  <Variable className="h-2.5 w-2.5" /> {v.label}
                </Button>
              ))}
            </div>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="text-sm" placeholder="Write your message..." />
          </div>
          <Button onClick={() => sendEmail.mutate()} disabled={!to.trim() || !subject.trim() || sendEmail.isPending} className="w-full">
            <Send className="h-4 w-4 mr-1" /> Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
