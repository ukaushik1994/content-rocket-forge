import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Trash2, Eye, Variable, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

const VARIABLES = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'unsubscribe_link', label: 'Unsubscribe Link' },
];

export const TemplatesList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body_html: '' });
  const [editorTab, setEditorTab] = useState('code');
  const [showTestSend, setShowTestSend] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      const variables = (form.body_html.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''));
      const { error } = await supabase.from('email_templates').insert({
        workspace_id: currentWorkspaceId!,
        name: form.name,
        subject: form.subject,
        body_html: form.body_html,
        body_text: form.body_html.replace(/<[^>]*>/g, ''),
        variables: [...new Set(variables)],
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowCreate(false);
      setForm({ name: '', subject: '', body_html: '' });
      toast.success('Template created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted');
    },
  });

  const testSend = useMutation({
    mutationFn: async (templateId: string) => {
      const template = templates.find((t: any) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const { error } = await supabase.from('email_messages').insert({
        workspace_id: currentWorkspaceId!,
        to_email: testEmail,
        subject: `[TEST] ${template.subject}`,
        body_html: template.body_html,
        status: 'queued',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setShowTestSend(null);
      setTestEmail('');
      toast.success('Test email queued! It will be sent on the next job run.');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const insertVariable = (key: string) => {
    setForm(f => ({ ...f, body_html: f.body_html + `{{${key}}}` }));
  };

  const getPreviewHtml = (html: string) => {
    let preview = html
      .replace(/\{\{first_name\}\}/g, 'John')
      .replace(/\{\{last_name\}\}/g, 'Doe')
      .replace(/\{\{email\}\}/g, 'john@example.com')
      .replace(/\{\{unsubscribe_link\}\}/g, '#');
    return DOMPurify.sanitize(preview);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{templates.length} templates</p>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Email Template</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Subject *</Label>
                  <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Use {{first_name}} for variables" />
                </div>

                {/* Variable Inserter */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Insert Variable</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {VARIABLES.map(v => (
                      <Button key={v.key} variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => insertVariable(v.key)}>
                        <Variable className="h-3 w-3" /> {v.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Code / Preview Tabs */}
                <Tabs value={editorTab} onValueChange={setEditorTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <Textarea
                      value={form.body_html}
                      onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))}
                      rows={12}
                      className="font-mono text-xs"
                      placeholder="<h1>Hello {{first_name}}</h1><p>Welcome...</p>"
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border border-border rounded-lg p-4 min-h-[200px] bg-background">
                      {form.body_html ? (
                        <div dangerouslySetInnerHTML={{ __html: getPreviewHtml(form.body_html) }} />
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-8">Write some HTML to see a preview</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={() => createTemplate.mutate()} disabled={!form.name || !form.subject} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No templates yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t: any) => (
            <Card key={t.id} className="bg-card border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">Subject: {t.subject}</p>
                  </div>
                  <div className="flex gap-1">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowTestSend(t.id); setTestEmail(''); }}>
                          <Send className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTemplate.mutate(t.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {t.variables?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {t.variables.map((v: string) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{`{{${v}}}`}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Send Modal */}
      <Dialog open={!!showTestSend} onOpenChange={() => setShowTestSend(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Send Test Email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Recipient Email</Label><Input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" /></div>
            <Button onClick={() => showTestSend && testSend.mutate(showTestSend)} disabled={!testEmail || testSend.isPending} className="w-full">
              <Send className="h-3.5 w-3.5 mr-1" /> Send Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
