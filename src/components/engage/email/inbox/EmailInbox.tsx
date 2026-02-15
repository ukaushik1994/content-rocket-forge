import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThreadList } from './ThreadList';
import { ThreadReader } from './ThreadReader';
import { ThreadContext } from './ThreadContext';
import { ComposeDialog } from './ComposeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenSquare, Search, Inbox, Clock, CheckCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmailInbox = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['email-threads', currentWorkspaceId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('email_threads')
        .select('*, engage_contacts(id, email, first_name, last_name)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('last_activity_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter((t: any) =>
      t.subject?.toLowerCase().includes(q) ||
      t.engage_contacts?.email?.toLowerCase().includes(q) ||
      t.engage_contacts?.first_name?.toLowerCase().includes(q) ||
      t.engage_contacts?.last_name?.toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  const selectedThread = useMemo(() =>
    threads.find((t: any) => t.id === selectedThreadId),
    [threads, selectedThreadId]
  );

  const statusCounts = useMemo(() => ({
    all: threads.length,
    needs_reply: threads.filter((t: any) => t.status === 'needs_reply').length,
    waiting: threads.filter((t: any) => t.status === 'waiting').length,
    closed: threads.filter((t: any) => t.status === 'closed').length,
  }), [threads]);

  const updateThreadStatus = useMutation({
    mutationFn: async ({ threadId, status }: { threadId: string; status: string }) => {
      const { error } = await supabase.from('email_threads').update({ status }).eq('id', threadId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-threads'] }),
  });

  const statusFilters = [
    { value: 'all', label: 'All', icon: Inbox },
    { value: 'needs_reply', label: 'Needs Reply', icon: Clock },
    { value: 'waiting', label: 'Waiting', icon: Clock },
    { value: 'closed', label: 'Closed', icon: CheckCircle },
  ];

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search threads..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-background/40" />
        </div>
        <div className="flex gap-1">
          {statusFilters.map(f => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => setStatusFilter(f.value)}
            >
              <f.icon className="h-3 w-3" />
              {f.label}
              {statusCounts[f.value as keyof typeof statusCounts] > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                  {statusCounts[f.value as keyof typeof statusCounts]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowCompose(true)}>
          <PenSquare className="h-4 w-4 mr-1" /> Compose
        </Button>
      </div>

      {/* 3-panel layout */}
      <div className="grid grid-cols-12 gap-3 min-h-[500px]">
        {/* Thread list */}
        <div className="col-span-4 border border-border/30 rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
          <ThreadList
            threads={filteredThreads}
            selectedId={selectedThreadId}
            onSelect={setSelectedThreadId}
            isLoading={isLoading}
          />
        </div>

        {/* Thread reader */}
        <div className="col-span-5 border border-border/30 rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
          {selectedThread ? (
            <ThreadReader
              thread={selectedThread}
              onStatusChange={(status) => updateThreadStatus.mutate({ threadId: selectedThread.id, status })}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <Inbox className="h-10 w-10 mx-auto opacity-30" />
                <p>Select a thread to read</p>
              </div>
            </div>
          )}
        </div>

        {/* Context panel */}
        <div className="col-span-3 border border-border/30 rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
          {selectedThread ? (
            <ThreadContext thread={selectedThread} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
              Contact details will appear here
            </div>
          )}
        </div>
      </div>

      <ComposeDialog open={showCompose} onOpenChange={setShowCompose} />
    </div>
  );
};
