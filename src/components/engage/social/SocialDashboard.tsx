import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Share2, Calendar, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const providers = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
];

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-info/20 text-info',
  posted: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
};

export const SocialDashboard = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ content: '', scheduled_at: '', channels: [] as string[] });

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

  const createPost = useMutation({
    mutationFn: async () => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      setShowCreate(false);
      setForm({ content: '', scheduled_at: '', channels: [] });
      toast.success('Post created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Social</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage social posts</p>
        </div>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Social Post</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Content *</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} /></div>
                <div><Label>Schedule</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>
                <div>
                  <Label>Channels</Label>
                  <div className="flex gap-3 mt-1">
                    {providers.map(p => (
                      <label key={p.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <Checkbox checked={form.channels.includes(p.id)} onCheckedChange={() => toggleChannel(p.id)} />
                        <p.icon className="h-3.5 w-3.5" /> {p.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={() => createPost.mutate()} disabled={!form.content} className="w-full">Create Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Connected Accounts */}
      <Card className="bg-card border-border">
        <CardHeader className="py-3"><CardTitle className="text-sm">Connected Accounts</CardTitle></CardHeader>
        <CardContent className="pb-3">
          <div className="flex gap-2 flex-wrap">
            {providers.map(p => {
              const connected = accounts.find((a: any) => a.provider === p.id);
              return (
                <Badge key={p.id} variant={connected ? 'default' : 'outline'} className="gap-1 cursor-pointer">
                  <p.icon className="h-3 w-3" /> {p.label} {connected ? '✓' : '— Connect'}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Share2 className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No posts scheduled</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((p: any) => (
            <Card key={p.id} className="bg-card border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                  <Badge className={statusColors[p.status] || ''}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {p.scheduled_at ? format(new Date(p.scheduled_at), 'MMM d, HH:mm') : 'Not scheduled'}
                  {p.social_post_targets?.map((t: any) => (
                    <Badge key={t.id} variant="outline" className="text-xs">{t.provider}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
