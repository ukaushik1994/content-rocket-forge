import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, UserCheck, UserX, Trash2, Upload, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ContactDetailDialog } from './ContactDetailDialog';

export const ContactsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState('single');
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '', tags: '' });
  const [csvText, setCsvText] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['engage-contacts', currentWorkspaceId, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engage_contacts')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: totalCount = 0 } = useQuery({
    queryKey: ['engage-contacts-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase
        .from('engage_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', currentWorkspaceId!);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const activeCount = contacts.filter((c: any) => !c.unsubscribed).length;
  const unsubCount = contacts.filter((c: any) => c.unsubscribed).length;

  // All unique tags
  const allTags = [...new Set(contacts.flatMap((c: any) => c.tags || []))];

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
      queryClient.invalidateQueries({ queryKey: ['engage-contacts-count'] });
      setShowAdd(false);
      setForm({ email: '', first_name: '', last_name: '', phone: '', tags: '' });
      toast.success('Contact added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkImport = useMutation({
    mutationFn: async () => {
      const lines = csvText.trim().split('\n').filter(l => l.trim());
      if (!lines.length) throw new Error('No data to import');
      const contacts = lines.map(line => {
        const [email, first_name, last_name, tags] = line.split(',').map(s => s.trim());
        return {
          workspace_id: currentWorkspaceId!,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          tags: tags ? tags.split(';').map(t => t.trim()) : [],
        };
      }).filter(c => c.email);
      const { error } = await supabase.from('engage_contacts').insert(contacts);
      if (error) throw error;
      return contacts.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['engage-contacts-count'] });
      setShowAdd(false);
      setCsvText('');
      toast.success(`${count} contacts imported`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('engage_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['engage-contacts-count'] });
      toast.success('Contact deleted');
    },
  });

  const filtered = contacts.filter((c: any) => {
    const matchesSearch = !search ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      (c.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTags = tagFilter.length === 0 || tagFilter.some(f => (c.tags || []).includes(f));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Contacts</h2>
            <p className="text-sm text-muted-foreground">{totalCount} contacts in workspace</p>
          </div>
          {canEdit && (
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader><DialogTitle>Add Contacts</DialogTitle></DialogHeader>
                <Tabs value={addTab} onValueChange={setAddTab}>
                  <TabsList className="h-8 w-full">
                    <TabsTrigger value="single" className="text-xs flex-1">Single</TabsTrigger>
                    <TabsTrigger value="bulk" className="text-xs flex-1"><Upload className="h-3 w-3 mr-1" /> Bulk CSV</TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="mt-3 space-y-3">
                    <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                      <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                    </div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="lead, newsletter" /></div>
                    <Button onClick={() => addContact.mutate()} disabled={!form.email} className="w-full">Add Contact</Button>
                  </TabsContent>
                  <TabsContent value="bulk" className="mt-3 space-y-3">
                    <div>
                      <Label>CSV Data</Label>
                      <p className="text-[10px] text-muted-foreground mb-1">Format: email, first_name, last_name, tags (semicolon-separated)</p>
                      <Textarea
                        value={csvText}
                        onChange={e => setCsvText(e.target.value)}
                        rows={8}
                        className="font-mono text-xs"
                        placeholder={"john@example.com, John, Doe, lead;newsletter\njane@example.com, Jane, Smith, customer"}
                      />
                    </div>
                    <Button onClick={() => bulkImport.mutate()} disabled={!csvText.trim() || bulkImport.isPending} className="w-full">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Import Contacts
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', count: totalCount, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: Users },
          { label: 'Active', count: activeCount, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', icon: UserCheck },
          { label: 'Unsubscribed', count: unsubCount, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', icon: UserX },
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

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by email, name, or tag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-1 items-center flex-wrap">
            {allTags.slice(0, 5).map(tag => (
              <Badge
                key={tag}
                variant={tagFilter.includes(tag) ? 'default' : 'outline'}
                className="text-xs cursor-pointer"
                onClick={() => setTagFilter(f => f.includes(tag) ? f.filter(t => t !== tag) : [...f, tag])}
              >
                {tag}
              </Badge>
            ))}
            {tagFilter.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setTagFilter([])}>Clear</Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-muted-foreground">No contacts yet</p>
          {canEdit && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Add First Contact</Button>}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Tags</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {canEdit && <TableHead className="text-xs w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c: any) => (
                  <TableRow
                    key={c.id}
                    className="border-border/20 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setSelectedContact(c)}
                  >
                    <TableCell className="font-medium text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(c.tags || []).slice(0, 3).map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                        {(c.tags || []).length > 3 && <span className="text-[10px] text-muted-foreground">+{c.tags.length - 3}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.unsubscribed ? (
                        <Badge variant="destructive" className="text-[10px]">Unsubscribed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">Active</Badge>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove {c.email}.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteContact.mutate(c.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassCard>

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
              <span className="text-xs text-muted-foreground self-center">
                Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= totalCount}>Next</Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={open => { if (!open) setSelectedContact(null); }}
      />
    </div>
  );
};