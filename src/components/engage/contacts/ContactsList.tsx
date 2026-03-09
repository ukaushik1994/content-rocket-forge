import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, Users, UserCheck, UserX, Trash2, Upload, Download, Tag, ArrowUpDown, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactDetailDialog } from './ContactDetailDialog';
import { EngageButton } from '../shared/EngageButton';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { EngageFilterBar } from '../shared/EngageFilterBar';
import { EngageSkeletonCards } from '../shared/EngageSkeletonCards';
import { engageStagger } from '../shared/engageAnimations';

type SortField = 'email' | 'first_name' | 'created_at';
type SortDir = 'asc' | 'desc';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);
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

  const { data: activeCount = 0 } = useQuery({
    queryKey: ['engage-contacts-active-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase
        .from('engage_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', currentWorkspaceId!)
        .eq('unsubscribed', false);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: unsubCount = 0 } = useQuery({
    queryKey: ['engage-contacts-unsub-count', currentWorkspaceId],
    queryFn: async () => {
      const { count } = await supabase
        .from('engage_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', currentWorkspaceId!)
        .eq('unsubscribed', true);
      return count || 0;
    },
    enabled: !!currentWorkspaceId,
  });
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
      const rows = lines.map(line => {
        const [email, first_name, last_name, tags] = line.split(',').map(s => s.trim());
        return {
          workspace_id: currentWorkspaceId!,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          tags: tags ? tags.split(';').map(t => t.trim()) : [],
        };
      }).filter(c => c.email);
      const { error } = await supabase.from('engage_contacts').insert(rows);
      if (error) throw error;
      return rows.length;
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

  const bulkDelete = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('engage_contacts').delete().in('id', ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['engage-contacts-count'] });
      setSelectedIds(new Set());
      toast.success(`${count} contacts deleted`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkAddTag = useMutation({
    mutationFn: async (tag: string) => {
      const ids = Array.from(selectedIds);
      const contactsToUpdate = contacts.filter((c: any) => ids.includes(c.id));
      for (const c of contactsToUpdate) {
        const existing = c.tags || [];
        if (!existing.includes(tag)) {
          await supabase.from('engage_contacts').update({ tags: [...existing, tag] }).eq('id', c.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-contacts'] });
      setBulkTagInput('');
      toast.success('Tag added to selected contacts');
    },
  });

  const exportContacts = (contactsToExport: any[]) => {
    const rows = [['Email', 'First Name', 'Last Name', 'Phone', 'Tags', 'Status']];
    contactsToExport.forEach(c => {
      rows.push([c.email, c.first_name || '', c.last_name || '', c.phone || '', (c.tags || []).join(';'), c.unsubscribed ? 'Unsubscribed' : 'Active']);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'contacts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = contacts
    .filter((c: any) => {
      const matchesSearch = !search ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        (c.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesTags = tagFilter.length === 0 || tagFilter.some(f => (c.tags || []).includes(f));
      return matchesSearch && matchesTags;
    })
    .sort((a: any, b: any) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((c: any) => c.id)));
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const visibleTags = showAllTags ? allTags : allTags.slice(0, 5);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngagePageHero
        icon={Users}
        badge="Contact Management"
        title="Contacts"
        titleAccent="Hub"
        subtitle={`${totalCount} contacts in your workspace — manage, segment, and engage`}
        gradientFrom="from-emerald-400"
        gradientTo="to-teal-400"
        stats={[
          { icon: Users, label: 'Total', value: totalCount },
          { icon: UserCheck, label: 'Active', value: activeCount },
          { icon: UserX, label: 'Unsubscribed', value: unsubCount },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportContacts(filtered)} className="bg-background/40 border-border/50">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            {canEdit && (
              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild>
                  <EngageButton size="sm"><Plus className="h-4 w-4 mr-1" /> Add Contact</EngageButton>
                </DialogTrigger>
                <DialogContent>
                  <EngageDialogHeader icon={Users} title="Add Contacts" gradientFrom="from-emerald-400" gradientTo="to-teal-400" iconColor="text-emerald-400" />
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
                      <EngageButton onClick={() => addContact.mutate()} disabled={!form.email} className="w-full">Add Contact</EngageButton>
                    </TabsContent>
                    <TabsContent value="bulk" className="mt-3 space-y-3">
                      <div>
                        <Label>Upload CSV File</Label>
                        <label
                          className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files[0];
                            if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setCsvText(ev.target?.result as string || '');
                              reader.readAsText(file);
                            } else {
                              toast.error('Please upload a .csv file');
                            }
                          }}
                        >
                          <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Drop a .csv file here or click to browse</span>
                          <input
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setCsvText(ev.target?.result as string || '');
                                reader.readAsText(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div>
                        <Label>CSV Data</Label>
                        <p className="text-[10px] text-muted-foreground mb-1">Format: email, first_name, last_name, tags (semicolon-separated)</p>
                        <Textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} className="font-mono text-xs" placeholder={"john@example.com, John, Doe, lead;newsletter\njane@example.com, Jane, Smith, customer"} />
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
        }
      />

      {/* Filter Bar */}
      <EngageFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by email, name, or tag..."
        extraActions={
          allTags.length > 0 ? (
            <div className="flex gap-1 items-center flex-wrap">
              {visibleTags.map(tag => (
                <Badge
                  key={tag}
                  variant={tagFilter.includes(tag) ? 'default' : 'outline'}
                  className="text-xs cursor-pointer"
                  onClick={() => setTagFilter(f => f.includes(tag) ? f.filter(t => t !== tag) : [...f, tag])}
                >
                  {tag}
                </Badge>
              ))}
              {allTags.length > 5 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setShowAllTags(v => !v)}>
                  {showAllTags ? 'Less' : `+${allTags.length - 5} more`}
                </Button>
              )}
              {tagFilter.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setTagFilter([])}>Clear</Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <GlassCard className="p-3 flex items-center gap-3 bg-primary/5 border-primary/20">
              <span className="text-xs font-medium text-foreground">{selectedIds.size} selected</span>
              <div className="flex gap-2 flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Tag className="h-3 w-3" /> Add Tag</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="flex gap-1">
                      <Input className="h-7 text-xs" value={bulkTagInput} onChange={e => setBulkTagInput(e.target.value)} placeholder="Tag name" />
                      <Button size="sm" className="h-7 text-xs" onClick={() => bulkTagInput && bulkAddTag.mutate(bulkTagInput)}>Add</Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => exportContacts(contacts.filter((c: any) => selectedIds.has(c.id)))}>
                  <Download className="h-3 w-3" /> Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-7 text-xs gap-1"><Trash2 className="h-3 w-3" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedIds.size} contacts?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => bulkDelete.mutate()} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <EngageSkeletonCards count={5} layout="list" />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="text-center py-20 space-y-4">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 blur-xl" />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/[0.08] flex items-center justify-center">
                <Users className="h-9 w-9 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">No contacts yet</p>
              <p className="text-sm text-muted-foreground">Import your contacts to start engaging</p>
            </div>
            {canEdit && <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-shadow" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Add First Contact</Button>}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    {canEdit && (
                      <TableHead className="w-10">
                        <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} />
                      </TableHead>
                    )}
                    <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort('email')}>
                      <span className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort('first_name')}>
                      <span className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="text-xs">Tags</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    {canEdit && <TableHead className="text-xs w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: any) => (
                     <TableRow
                      key={c.id}
                      className="border-border/20 cursor-pointer hover:bg-white/[0.04] hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.1)] transition-all duration-200"
                      onClick={() => setSelectedContact(c)}
                    >
                      {canEdit && (
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                        </TableCell>
                      )}
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
                          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                            </span>
                            Active
                          </Badge>
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
              <div className="flex justify-center items-center gap-3 mt-6">
                <Button variant="outline" size="sm" className="bg-background/40 border-border/50 hover:bg-background/60" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(Math.ceil(totalCount / PAGE_SIZE), 5) }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="bg-background/40 border-border/50 hover:bg-background/60" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= totalCount}>Next</Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Detail Dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={open => { if (!open) setSelectedContact(null); }}
      />
    </motion.div>
  );
};
