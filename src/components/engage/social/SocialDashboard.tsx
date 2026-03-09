import React, { useState, useMemo, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialInbox } from './SocialInbox';
import { SocialAnalytics } from './SocialAnalytics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { EngageFilterBar } from '../shared/EngageFilterBar';
import { EngageSkeletonCards } from '../shared/EngageSkeletonCards';
import { EngageStatGrid } from '../shared/EngageStatCard';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import {
  Plus, Share2, Calendar, List, Twitter, Linkedin, Instagram, Facebook,
  Clock, CheckCircle2, Zap, Send, Image, Hash, X, Search, ListOrdered, Trash2, Link2, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { EngageButton } from '../shared/EngageButton';
import { format, formatDistanceToNow, isFuture } from 'date-fns';
import { SocialCalendar } from './SocialCalendar';
import { SocialPostCard } from './SocialPostCard';
import { AISocialWriterDialog } from './AISocialWriterDialog';

const providers = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
];

const charLimits: Record<string, number> = {
  twitter: 280, linkedin: 3000, instagram: 2200, facebook: 63206,
};

const commonHashtags = ['#marketing', '#socialmedia', '#growth', '#brand', '#content', '#digital', '#strategy'];

const statusFilters = ['all', 'draft', 'scheduled', 'posted', 'failed'] as const;

import { engageStagger } from '../shared/engageAnimations';
const stagger = engageStagger;

export const SocialDashboard = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<'list' | 'calendar' | 'queue'>('list');
  const [form, setForm] = useState({ content: '', scheduled_at: '', channels: [] as string[], media_urls: [] as string[] });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof statusFilters[number]>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [linkForm, setLinkForm] = useState({ provider: '', account_name: '', access_token: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAIWriter, setShowAIWriter] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['social-posts', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, social_post_targets(*)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('social_accounts').select('*').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter !== 'all') result = result.filter((p: any) => p.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => p.content?.toLowerCase().includes(q));
    }
    return result;
  }, [posts, statusFilter, searchQuery]);

  const queuePosts = useMemo(() => {
    return posts
      .filter((p: any) => p.status === 'scheduled' && p.scheduled_at && isFuture(new Date(p.scheduled_at)))
      .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [posts]);

  const toggleChannel = (ch: string) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('social-media').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('social-media').getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      setForm(f => ({ ...f, media_urls: [...f.media_urls, ...newUrls] }));
      toast.success(`${newUrls.length} file(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (url: string) => setForm(f => ({ ...f, media_urls: f.media_urls.filter(u => u !== url) }));

  const insertHashtag = (tag: string) => {
    setForm(f => ({ ...f, content: f.content + (f.content.endsWith(' ') || !f.content ? '' : ' ') + tag + ' ' }));
    setShowHashtags(false);
    textareaRef.current?.focus();
  };

  const savePost = useMutation({
    mutationFn: async () => {
      if (editingPostId) {
        const { error } = await supabase.from('social_posts').update({
          content: form.content, scheduled_at: form.scheduled_at || null,
          status: form.scheduled_at ? 'scheduled' : 'draft',
          media_urls: form.media_urls.length > 0 ? form.media_urls : null,
        }).eq('id', editingPostId);
        if (error) throw error;
        await supabase.from('social_post_targets').delete().eq('post_id', editingPostId);
        if (form.channels.length) {
          await supabase.from('social_post_targets').insert(
            form.channels.map(ch => ({ workspace_id: currentWorkspaceId!, post_id: editingPostId, provider: ch, status: 'scheduled' as const }))
          );
        }
      } else {
        const { data: post, error } = await supabase.from('social_posts').insert({
          workspace_id: currentWorkspaceId!, content: form.content,
          scheduled_at: form.scheduled_at || null, status: form.scheduled_at ? 'scheduled' : 'draft',
          created_by: user?.id, media_urls: form.media_urls.length > 0 ? form.media_urls : null,
        }).select().single();
        if (error) throw error;
        if (form.channels.length && post) {
          await supabase.from('social_post_targets').insert(
            form.channels.map(ch => ({ workspace_id: currentWorkspaceId!, post_id: post.id, provider: ch, status: 'scheduled' as const }))
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      setShowCreate(false); setForm({ content: '', scheduled_at: '', channels: [], media_urls: [] }); setEditingPostId(null);
      toast.success(editingPostId ? 'Post updated' : 'Post created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from('social_post_targets').delete().eq('post_id', postId);
      const { error } = await supabase.from('social_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); toast.success('Post deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkDeletePosts = useMutation({
    mutationFn: async () => {
      for (const postId of selectedPosts) {
        await supabase.from('social_post_targets').delete().eq('post_id', postId);
        await supabase.from('social_posts').delete().eq('id', postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      setSelectedPosts(new Set());
      toast.success(`${selectedPosts.size} post(s) deleted`);
    },
  });

  const linkAccount = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('social_accounts').insert({
        workspace_id: currentWorkspaceId!,
        provider: linkForm.provider,
        display_name: linkForm.account_name,
        auth_data: linkForm.access_token ? { access_token: linkForm.access_token } : {},
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      setShowLinkAccount(false);
      setLinkForm({ provider: '', account_name: '', access_token: '' });
      toast.success('Account linked');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicatePost = (post: any) => {
    setEditingPostId(null);
    setForm({ content: post.content, scheduled_at: '', channels: post.social_post_targets?.map((t: any) => t.provider) || [], media_urls: post.media_urls || [] });
    setShowCreate(true);
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const stats = useMemo(() => ({
    scheduled: posts.filter((p: any) => p.status === 'scheduled').length,
    posted: posts.filter((p: any) => p.status === 'posted').length,
    connected: accounts.length,
  }), [posts, accounts]);

  const activeCharLimit = form.channels.length > 0 ? Math.min(...form.channels.map(ch => charLimits[ch] || 99999)) : 0;

  const handleDayClick = (date: Date) => {
    setEditingPostId(null);
    setForm(f => ({ ...f, scheduled_at: format(date, "yyyy-MM-dd'T'HH:mm"), media_urls: [] }));
    setShowCreate(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowCreate(open);
    if (!open) { setEditingPostId(null); setForm({ content: '', scheduled_at: '', channels: [], media_urls: [] }); }
  };

  const statCards = [
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Posted', value: stats.posted, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Connected', value: stats.connected, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const [mainTab, setMainTab] = useState('publish');

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <CompactPageHeader
        icon={Share2}
        title="Social Media"
        subtitle="Schedule and manage social posts"
        stats={[
          { icon: Clock, label: 'Scheduled', value: stats.scheduled },
          { icon: CheckCircle2, label: 'Posted', value: stats.posted },
          { icon: Zap, label: 'Connected', value: stats.connected },
        ]}
        quickFilters={[
          { key: 'publish', label: 'Publish' },
          { key: 'inbox', label: 'Inbox' },
          { key: 'analytics', label: 'Analytics' },
        ]}
        activeFilter={mainTab}
        onFilterChange={setMainTab}
      />

      {mainTab === 'inbox' && <SocialInbox />}
      {mainTab === 'analytics' && <SocialAnalytics />}

      {mainTab === 'publish' && <React.Fragment>

      <motion.div variants={engageStagger.item} className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-background/40 backdrop-blur-sm">
            {[
              { key: 'list' as const, icon: List },
              { key: 'calendar' as const, icon: Calendar },
              { key: 'queue' as const, icon: ListOrdered },
            ].map(v => (
              <Button key={v.key} variant={view === v.key ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-8" onClick={() => setView(v.key)}>
                <v.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <EngageButton size="sm" className="gap-1.5" onClick={() => setEditingPostId(null)}><Plus className="h-4 w-4" /> New Post</EngageButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <EngageDialogHeader icon={Share2} title={editingPostId ? 'Edit Post' : 'Create Social Post'} gradientFrom="from-pink-400" gradientTo="to-purple-400" iconColor="text-pink-400" />
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Content *</Label>
                      <div className="flex gap-1">
                        <EngageButton variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowAIWriter(true)}>
                          <Sparkles className="h-3 w-3" /> AI Writer
                        </EngageButton>
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowHashtags(!showHashtags)}>
                          <Hash className="h-3 w-3" /> Hashtags
                      </Button>
                      </div>
                    </div>
                    {showHashtags && (
                      <div className="flex gap-1 flex-wrap mt-1 mb-1">
                        {commonHashtags.map(tag => (
                          <button key={tag} onClick={() => insertHashtag(tag)} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <Textarea ref={textareaRef} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} className="mt-1 bg-background/50" placeholder="What's on your mind?" />
                    {activeCharLimit > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs ${form.content.length > activeCharLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {form.content.length}/{activeCharLimit}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Image className="h-3 w-3" /> Media</Label>
                    <div className="mt-1">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/50 cursor-pointer hover:border-primary/50 transition-colors">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleMediaUpload} disabled={uploading} />
                      </label>
                    </div>
                    {form.media_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {form.media_urls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg border border-border/50" />
                            <button onClick={() => removeMedia(url)} className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className="mt-1 bg-background/50" />
                  </div>
                  <div>
                    <Label>Channels</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {providers.map(p => {
                        const selected = form.channels.includes(p.id);
                        return (
                          <button key={p.id} onClick={() => toggleChannel(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                              selected ? `${p.bg} ${p.color} border-current/30 scale-105` : 'bg-background/40 text-muted-foreground border-border/50 hover:border-border'
                            }`}
                          >
                            <p.icon className="h-3.5 w-3.5" /> {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <EngageButton onClick={() => savePost.mutate()} disabled={!form.content || savePost.isPending} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {editingPostId ? 'Update Post' : (form.scheduled_at ? 'Schedule Post' : 'Save as Draft')}
                  </EngageButton>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <EngageStatGrid
        stats={[
          { label: 'Scheduled', count: stats.scheduled, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', icon: Clock },
          { label: 'Posted', count: stats.posted, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Connected', count: stats.connected, color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', icon: Zap },
        ]}
      />

      {/* Connected Accounts */}
      <motion.div variants={stagger.item}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Connected Accounts</h3>
            {canEdit && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowLinkAccount(true)}>
                <Link2 className="h-3 w-3" /> Link Account
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {providers.map(p => {
              const connected = accounts.find((a: any) => a.provider === p.id);
              return (
                <GlassCard key={p.id} className={`px-3 py-2 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 ${connected ? 'border-green-500/30 hover:border-green-500/50' : 'hover:border-white/[0.12]'}`}>
                  <div className={`p-1.5 rounded-lg ${p.bg}`}><p.icon className={`h-3.5 w-3.5 ${p.color}`} /></div>
                  <span className="text-xs font-medium text-foreground">{p.label}</span>
                  {connected ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Not linked</Badge>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Link Account Dialog */}
      <Dialog open={showLinkAccount} onOpenChange={setShowLinkAccount}>
        <DialogContent className="max-w-sm">
          <EngageDialogHeader icon={Link2} title="Link Social Account" gradientFrom="from-pink-400" gradientTo="to-purple-400" iconColor="text-pink-400" />
          <div className="space-y-3">
            <div>
              <Label>Platform *</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {providers.map(p => (
                  <button key={p.id} onClick={() => setLinkForm(f => ({ ...f, provider: p.id }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      linkForm.provider === p.id ? `${p.bg} ${p.color} border-current/30` : 'bg-background/40 text-muted-foreground border-border/50'
                    }`}
                  >
                    <p.icon className="h-3.5 w-3.5" /> {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div><Label>Account Name *</Label><Input value={linkForm.account_name} onChange={e => setLinkForm(f => ({ ...f, account_name: e.target.value }))} placeholder="@yourhandle" /></div>
            <div><Label>Access Token (optional)</Label><Input value={linkForm.access_token} onChange={e => setLinkForm(f => ({ ...f, access_token: e.target.value }))} placeholder="For API access" type="password" /></div>
            <Button onClick={() => linkAccount.mutate()} disabled={!linkForm.provider || !linkForm.account_name} className="w-full">Link Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search & Filters (for list view) */}
      {view === 'list' && (
        <motion.div variants={stagger.item}>
          <EngageFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search posts..."
            extraActions={
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-background/40">
                  {statusFilters.map(s => (
                    <Button key={s} variant={statusFilter === s ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-7 text-xs capitalize" onClick={() => setStatusFilter(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
                {selectedPosts.size > 0 && (
                  <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={() => bulkDeletePosts.mutate()}>
                    <Trash2 className="h-3 w-3" /> Delete {selectedPosts.size} selected
                  </Button>
                )}
              </div>
            }
          />
        </motion.div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <motion.div variants={stagger.item}><EngageSkeletonCards count={4} layout="list" /></motion.div>
      ) : view === 'calendar' ? (
        <motion.div variants={stagger.item}>
          <SocialCalendar posts={posts} onDayClick={handleDayClick} />
        </motion.div>
      ) : view === 'queue' ? (
        <motion.div variants={stagger.item} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Upcoming Queue</h3>
          {queuePosts.length === 0 ? (
            <GlassCard className="py-12 text-center">
              <p className="text-muted-foreground text-sm">No upcoming scheduled posts</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {queuePosts.map((p: any, i: number) => (
                <GlassCard key={p.id} className="p-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 w-32">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>{formatDistanceToNow(new Date(p.scheduled_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {(p.social_post_targets || []).map((t: any) => {
                      const prov = providers.find(pr => pr.id === t.provider);
                      return prov ? <prov.icon key={t.id} className={`h-3.5 w-3.5 ${prov.color}`} /> : null;
                    })}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      ) : filteredPosts.length === 0 ? (
        <motion.div variants={stagger.item}>
          <GlassCard className="py-20 flex flex-col items-center justify-center space-y-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }} className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/[0.08]">
                <Share2 className="h-9 w-9 text-pink-400" />
              </div>
            </motion.div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">{searchQuery || statusFilter !== 'all' ? 'No matching posts' : 'No posts yet'}</p>
              <p className="text-sm text-muted-foreground">Create your first social post to get started</p>
            </div>
            {!searchQuery && statusFilter === 'all' && (
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-shadow" onClick={() => { setEditingPostId(null); setShowCreate(true); }}>
                <Plus className="h-4 w-4" /> Create First Post
              </Button>
            )}
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={stagger.item} className="grid gap-3">
          {filteredPosts.map((p: any, i: number) => (
            <div key={p.id} className="flex items-start gap-2">
              {canEdit && (
                <Checkbox
                  checked={selectedPosts.has(p.id)}
                  onCheckedChange={() => togglePostSelection(p.id)}
                  className="mt-4"
                />
              )}
              <div className="flex-1">
                <SocialPostCard
                  post={p} index={i}
                  onEdit={(post) => {
                    setEditingPostId(post.id);
                    setForm({
                      content: post.content,
                      scheduled_at: post.scheduled_at ? format(new Date(post.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
                      channels: post.social_post_targets?.map((t: any) => t.provider) || [],
                      media_urls: post.media_urls || [],
                    });
                    setShowCreate(true);
                  }}
                  onDelete={(id) => deletePost.mutate(id)}
                  onDuplicate={duplicatePost}
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}
      </React.Fragment>}
      <AISocialWriterDialog
        open={showAIWriter}
        onOpenChange={setShowAIWriter}
        onInsert={(content) => {
          setForm(prev => ({ ...prev, content }));
          setShowCreate(true);
        }}
      />
    </motion.div>
  );
};
