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
import { Plus, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const TemplatesList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body_html: '' });

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{templates.length} templates</p>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Email Template</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Subject *</Label>
                  <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Use {{first_name}} for variables" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Body (HTML)</Label>
                    <span className="text-xs text-muted-foreground">Variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{email}}'}</span>
                  </div>
                  <Textarea
                    value={form.body_html}
                    onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))}
                    rows={10}
                    placeholder="<h1>Hello {{first_name}}</h1><p>Welcome...</p>"
                  />
                </div>
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
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => deleteTemplate.mutate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
