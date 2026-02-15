import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Share2, Calendar, List, Twitter, Linkedin, Instagram, Facebook,
  Clock, CheckCircle2, Zap, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SocialCalendar } from './SocialCalendar';
import { SocialPostCard } from './SocialPostCard';

const providers = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
];

const charLimits: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
};

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export const SocialDashboard = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [form, setForm] = useState({ content: '', scheduled_at: '', channels: [] as string[] });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

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

  const toggleChannel = (ch: string) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }));
  };

  const savePost = useMutation({
    mutationFn: async () => {
      if (editingPostId) {
        // UPDATE existing post
        const { error } = await supabase.from('social_posts').update({
          content: form.content,
          scheduled_at: form.scheduled_at || null,
          status: form.scheduled_at ? 'scheduled' : 'draft',
        }).eq('id', editingPostId);
        if (error) throw error;

        // Replace targets: delete old, insert new
        await supabase.from('social_post_targets').delete().eq('post_id', editingPostId);
        if (form.channels.length) {
          const targets = form.channels.map(ch => ({
            workspace_id: currentWorkspaceId!,
            post_id: editingPostId,
            provider: ch,
            status: 'scheduled' as const,
          }));
          await supabase.from('social_post_targets').insert(targets);
        }
      } else {
        // INSERT new post
        const { data: post, error } = await supabase.from('social_posts').insert({
          workspace_id: currentWorkspaceId!,
          content: form.content,
          scheduled_at: form.scheduled_at || null,
          status: form.scheduled_at ? 'scheduled' : 'draft',
          created_by: user?.id,
        }).select().single();
        if (error) throw error;

        if (form.channels.length && post) {
          const targets = form.channels.map(ch => ({
            workspace_id: currentWorkspaceId!,
            post_id: post.id,
            provider: ch,
            status: 'scheduled' as const,
          }));
          await supabase.from('social_post_targets').insert(targets);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      setShowCreate(false);
      setForm({ content: '', scheduled_at: '', channels: [] });
      setEditingPostId(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Post deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const stats = useMemo(() => {
    const scheduled = posts.filter((p: any) => p.status === 'scheduled').length;
    const posted = posts.filter((p: any) => p.status === 'posted').length;
    const connected = accounts.length;
    return { scheduled, posted, connected };
  }, [posts, accounts]);

  const activeCharLimit = form.channels.length > 0
    ? Math.min(...form.channels.map(ch => charLimits[ch] || 99999))
    : 0;

  const handleDayClick = (date: Date) => {
    setEditingPostId(null);
    setForm(f => ({ ...f, scheduled_at: format(date, "yyyy-MM-dd'T'HH:mm") }));
    setShowCreate(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowCreate(open);
    if (!open) {
      setEditingPostId(null);
      setForm({ content: '', scheduled_at: '', channels: [] });
    }
  };

  const statCards = [
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Posted', value: stats.posted, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Connected', value: stats.connected, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger.container}>
      {/* Hero Header */}
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Social
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage social posts across all channels</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-background/40 backdrop-blur-sm">
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-8" onClick={() => setView('list')}>
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-8" onClick={() => setView('calendar')}>
              <Calendar className="h-3.5 w-3.5" />
            </Button>
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" onClick={() => setEditingPostId(null)}><Plus className="h-4 w-4" /> New Post</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {editingPostId ? 'Edit Post' : 'Create Social Post'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Content *</Label>
                    <Textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={4}
                      className="mt-1 bg-background/50"
                      placeholder="What's on your mind?"
                    />
                    {activeCharLimit > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs ${form.content.length > activeCharLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {form.content.length}/{activeCharLimit}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                      className="mt-1 bg-background/50"
                    />
                  </div>
                  <div>
                    <Label>Channels</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {providers.map(p => {
                        const selected = form.channels.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleChannel(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                              selected
                                ? `${p.bg} ${p.color} border-current/30 scale-105`
                                : 'bg-background/40 text-muted-foreground border-border/50 hover:border-border'
                            }`}
                          >
                            <p.icon className="h-3.5 w-3.5" />
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    onClick={() => savePost.mutate()}
                    disabled={!form.content || savePost.isPending}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {editingPostId ? 'Update Post' : (form.scheduled_at ? 'Schedule Post' : 'Save as Draft')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-3 gap-3">
        {statCards.map(s => (
          <GlassCard key={s.label} className="p-4 hover:scale-[1.03] transition-transform duration-300">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Connected Accounts */}
      <motion.div variants={stagger.item}>
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connected Accounts</h3>
          <div className="flex gap-2 flex-wrap">
            {providers.map(p => {
              const connected = accounts.find((a: any) => a.provider === p.id);
              return (
                <GlassCard
                  key={p.id}
                  className={`px-3 py-2 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 ${
                    connected ? 'border-green-500/30' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${p.bg}`}>
                    <p.icon className={`h-3.5 w-3.5 ${p.color}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{p.label}</span>
                  {connected ? (
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Connect</Badge>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Content Area */}
      {isLoading ? (
        <motion.div variants={stagger.item} className="text-center py-12 text-muted-foreground">
          Loading...
        </motion.div>
      ) : view === 'calendar' ? (
        <motion.div variants={stagger.item}>
          <SocialCalendar posts={posts} onDayClick={handleDayClick} />
        </motion.div>
      ) : posts.length === 0 ? (
        <motion.div variants={stagger.item}>
          <GlassCard className="py-16 flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20"
            >
              <Share2 className="h-8 w-8 text-purple-400" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground">Create your first social post to get started</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setEditingPostId(null); setShowCreate(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Create First Post
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={stagger.item} className="grid gap-3">
          {posts.map((p: any, i: number) => (
            <SocialPostCard
              key={p.id}
              post={p}
              index={i}
              onEdit={(post) => {
                setEditingPostId(post.id);
                setForm({
                  content: post.content,
                  scheduled_at: post.scheduled_at ? format(new Date(post.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
                  channels: post.social_post_targets?.map((t: any) => t.provider) || [],
                });
                setShowCreate(true);
              }}
              onDelete={(id) => deletePost.mutate(id)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
