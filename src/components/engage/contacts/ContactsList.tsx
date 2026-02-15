import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const ContactsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '', tags: '' });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['engage-contacts', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engage_contacts')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const addContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('engage_contacts').insert({
        workspace_id: currentWorkspaceId!,
        email: form.email,
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone: form.phone || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      setShowAdd(false);
      setForm({ email: '', first_name: '', last_name: '', phone: '', tags: '' });
      toast.success('Contact added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = contacts.filter((c: any) =>
    !search || c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contacts</h2>
          <p className="text-sm text-muted-foreground">{contacts.length} contacts in workspace</p>
        </div>
        {canEdit && (
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                  <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                </div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="lead, newsletter" /></div>
                <Button onClick={() => addContact.mutate()} disabled={!form.email} className="w-full">Add Contact</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No contacts yet</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.unsubscribed ? (
                      <Badge variant="destructive" className="text-xs">Unsubscribed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
