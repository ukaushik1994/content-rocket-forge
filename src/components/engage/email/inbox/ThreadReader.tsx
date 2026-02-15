import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Reply, Forward, Tag, StickyNote, CheckCircle, Clock, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface ThreadReaderProps {
  thread: any;
  onStatusChange: (status: string) => void;
}

export const ThreadReader: React.FC<ThreadReaderProps> = ({ thread, onStatusChange }) => {
  const { currentWorkspaceId } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNote, setShowNote] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ['thread-messages', thread.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_thread_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!thread.id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['thread-notes', thread.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_thread_notes')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!thread.id,
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!replyContent.trim()) return;
      // Create thread message
      await supabase.from('email_thread_messages').insert({
        workspace_id: currentWorkspaceId!,
        thread_id: thread.id,
        direction: 'outbound',
        from_email: '', // Will be filled by provider
        to_email: thread.engage_contacts?.email || '',
        subject: `Re: ${thread.subject}`,
        body_html: `<p>${replyContent.replace(/\n/g, '<br/>')}</p>`,
        body_text: replyContent,
      });
      // Queue actual email
      await supabase.from('email_messages').insert({
        workspace_id: currentWorkspaceId!,
        thread_id: thread.id,
        contact_id: thread.contact_id,
        to_email: thread.engage_contacts?.email || '',
        subject: `Re: ${thread.subject}`,
        body_html: `<p>${replyContent.replace(/\n/g, '<br/>')}</p>`,
        status: 'queued',
      });
      // Update thread
      await supabase.from('email_threads').update({
        status: 'waiting',
        last_activity_at: new Date().toISOString(),
      }).eq('id', thread.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-messages', thread.id] });
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      setReplyContent('');
      setShowReply(false);
      toast.success('Reply sent');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      if (!noteContent.trim()) return;
      await supabase.from('email_thread_notes').insert({
        workspace_id: currentWorkspaceId!,
        thread_id: thread.id,
        user_id: user?.id!,
        content: noteContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-notes', thread.id] });
      setNoteContent('');
      setShowNote(false);
      toast.success('Note added');
    },
  });

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{thread.subject || '(no subject)'}</h3>
            <p className="text-xs text-muted-foreground">{thread.engage_contacts?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <Select value={thread.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-7 text-xs w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="needs_reply">Needs Reply</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowReply(!showReply)}>
            <Reply className="h-3 w-3" /> Reply
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowNote(!showNote)}>
            <StickyNote className="h-3 w-3" /> Note
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => onStatusChange('closed')}>
            <CheckCircle className="h-3 w-3" /> Close
          </Button>
        </div>
      </div>

      {/* Messages timeline */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
        ) : (
          <>
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <GlassCard className={`p-3 max-w-[85%] ${msg.direction === 'outbound' ? 'bg-primary/5 border-primary/20' : 'bg-card/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.direction === 'inbound' ? (
                      <ArrowDown className="h-3 w-3 text-blue-400" />
                    ) : (
                      <ArrowUp className="h-3 w-3 text-emerald-400" />
                    )}
                    <span className="text-[10px] text-muted-foreground">{msg.from_email || 'You'}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                    </span>
                    {msg.tracking?.delivered && <Badge variant="secondary" className="h-3 text-[8px] px-1">delivered</Badge>}
                    {msg.tracking?.opened && <Badge variant="secondary" className="h-3 text-[8px] px-1 bg-emerald-500/10 text-emerald-400">opened</Badge>}
                  </div>
                  <div
                    className="text-sm text-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.body_html || msg.body_text || '') }}
                  />
                </GlassCard>
              </div>
            ))}
            {notes.map((note: any) => (
              <div key={note.id} className="flex justify-center">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 max-w-[70%]">
                  <div className="flex items-center gap-1 mb-1">
                    <StickyNote className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400">Internal Note</span>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-xs text-foreground">{note.content}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Reply / Note composer */}
      {showReply && (
        <div className="p-3 border-t border-border/30 space-y-2">
          <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Type your reply..." rows={3} className="text-sm" />
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>Cancel</Button>
            <Button size="sm" onClick={() => sendReply.mutate()} disabled={!replyContent.trim() || sendReply.isPending}>
              <Send className="h-3 w-3 mr-1" /> Send
            </Button>
          </div>
        </div>
      )}
      {showNote && (
        <div className="p-3 border-t border-amber-500/20 space-y-2 bg-amber-500/5">
          <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Internal note..." rows={2} className="text-sm" />
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowNote(false)}>Cancel</Button>
            <Button size="sm" variant="outline" onClick={() => addNote.mutate()} disabled={!noteContent.trim()}>
              <StickyNote className="h-3 w-3 mr-1" /> Add Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
