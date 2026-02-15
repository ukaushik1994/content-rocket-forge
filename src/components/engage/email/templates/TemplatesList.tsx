import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Trash2, Eye, Variable, Send, Copy, Bold, Italic, Link, Heading, Image } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const VARIABLES = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'unsubscribe_link', label: 'Unsubscribe Link' },
];

const HTML_TOOLS = [
  { icon: Bold, tag: 'b', label: 'Bold' },
  { icon: Italic, tag: 'i', label: 'Italic' },
  { icon: Heading, tag: 'h2', label: 'Heading' },
  { icon: Link, tag: 'a', label: 'Link', wrap: (sel: string) => `<a href="#">${sel || 'Link text'}</a>` },
  { icon: Image, tag: 'img', label: 'Image', wrap: () => `<img src="" alt="image" style="max-width:100%;" />` },
];

export const TemplatesList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body_html: '' });
  const [editorTab, setEditorTab] = useState('code');
  const [showTestSend, setShowTestSend] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Usage counts
  const { data: usageCounts = {} } = useQuery({
    queryKey: ['template-usage-counts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_campaigns').select('template_id').eq('workspace_id', currentWorkspaceId!);
      const counts: Record<string, number> = {};
      (data || []).forEach((c: any) => { if (c.template_id) counts[c.template_id] = (counts[c.template_id] || 0) + 1; });
      return counts;
    },
    enabled: !!currentWorkspaceId,
  });

  const openEditor = (template?: any) => {
    if (template) {
      setEditingId(template.id);
      setForm({ name: template.name, subject: template.subject, body_html: template.body_html || '' });
    } else {
      setEditingId(null);
      setForm({ name: '', subject: '', body_html: '' });
    }
    setEditorTab('code');
    setShowEditor(true);
  };

  const saveTemplate = useMutation({
    mutationFn: async () => {
      const variables = (form.body_html.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''));
      const payload = {
        workspace_id: currentWorkspaceId!,
        name: form.name,
        subject: form.subject,
        body_html: form.body_html,
        body_text: form.body_html.replace(/<[^>]*>/g, ''),
        variables: [...new Set(variables)],
      };
      if (editingId) {
        const { error } = await supabase.from('email_templates').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_templates').insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowEditor(false);
      toast.success(editingId ? 'Template updated' : 'Template created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template: any) => {
      const { error } = await supabase.from('email_templates').insert({
        workspace_id: currentWorkspaceId!,
        name: `${template.name} (Copy)`,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        variables: template.variables,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template duplicated');
    },
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
      toast.success('Test email queued!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const insertVariable = (key: string) => {
    insertAtCursor(`{{${key}}}`);
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = form.body_html.substring(0, start);
      const after = form.body_html.substring(end);
      setForm(f => ({ ...f, body_html: before + text + after }));
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + text.length;
        ta.focus();
      }, 0);
    } else {
      setForm(f => ({ ...f, body_html: f.body_html + text }));
    }
  };

  const insertHtmlTag = (tool: typeof HTML_TOOLS[0]) => {
    const ta = textareaRef.current;
    const selected = ta ? form.body_html.substring(ta.selectionStart, ta.selectionEnd) : '';
    if (tool.wrap) {
      insertAtCursor(tool.wrap(selected));
    } else {
      insertAtCursor(`<${tool.tag}>${selected || 'text'}</${tool.tag}>`);
    }
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
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-1" /> New Template
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : templates.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7 text-blue-400" />
          </div>
          <p className="text-muted-foreground">No templates yet</p>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t: any, i: number) => {
            const usage = usageCounts[t.id] || 0;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard
                  className="p-4 space-y-2 cursor-pointer hover:border-primary/30 hover:scale-[1.01] transition-all duration-200"
                  onClick={() => canEdit && openEditor(t)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">Subject: {t.subject}</p>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateTemplate.mutate(t)}>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.variables?.length > 0 && t.variables.map((v: string) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{`{{${v}}}`}</span>
                    ))}
                    {usage > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Used in {usage} campaign{usage > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Template' : 'Create Email Template'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Use {{first_name}} for variables" />
            </div>
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
            <Tabs value={editorTab} onValueChange={setEditorTab}>
              <TabsList className="h-8">
                <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="code">
                {/* HTML Toolbar */}
                <div className="flex gap-1 mb-2 p-1 rounded-lg bg-muted/30 border border-border/30">
                  {HTML_TOOLS.map(tool => (
                    <Button key={tool.tag} variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertHtmlTag(tool)} title={tool.label}>
                      <tool.icon className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                </div>
                <Textarea ref={textareaRef} value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))} rows={12} className="font-mono text-xs" placeholder="<h1>Hello {{first_name}}</h1><p>Welcome...</p>" />
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
            <Button onClick={() => saveTemplate.mutate()} disabled={!form.name || !form.subject} className="w-full">
              {editingId ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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