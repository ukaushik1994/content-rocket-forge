import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Mail, GitBranch, Zap, Share2, Search, CalendarDays } from 'lucide-react';
import { format, subDays } from 'date-fns';

const channelIcons: Record<string, any> = {
  email: Mail,
  journey: GitBranch,
  automation: Zap,
  social: Share2,
  system: Activity,
};

const channelColors: Record<string, string> = {
  email: 'bg-info/20 text-info',
  journey: 'bg-primary/20 text-primary',
  automation: 'bg-warning/20 text-warning',
  social: 'bg-success/20 text-success',
  system: 'bg-muted text-muted-foreground',
};

export const ActivityLog = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [channelFilter, setChannelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('7');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['engage-activity-log', currentWorkspaceId, channelFilter, dateRange],
    queryFn: async () => {
      let q = supabase
        .from('engage_activity_log')
        .select('*, engage_contacts(first_name, last_name, email)')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('created_at', subDays(new Date(), parseInt(dateRange)).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (channelFilter !== 'all') q = q.eq('channel', channelFilter);

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filtered = logs.filter((l: any) =>
    !search || l.message?.toLowerCase().includes(search.toLowerCase()) || l.type?.toLowerCase().includes(search.toLowerCase())
  );

  const getContactName = (log: any) => {
    const c = log.engage_contacts;
    if (!c) return null;
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ');
    return name || c.email;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Activity Log</h2>
        <p className="text-sm text-muted-foreground">Everything that happened, in one timeline</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="journey">Journey</SelectItem>
            <SelectItem value="automation">Automation</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <CalendarDays className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24h</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log: any) => {
            const Icon = channelIcons[log.channel] || Activity;
            const contactName = getContactName(log);
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`p-1.5 rounded-md ${channelColors[log.channel] || channelColors.system}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{log.message}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{log.type}</Badge>
                    {contactName && (
                      <span className="text-xs text-primary/80">→ {contactName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{format(new Date(log.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
