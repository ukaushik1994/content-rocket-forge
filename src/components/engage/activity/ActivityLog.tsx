import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Activity, Mail, GitBranch, Zap, Share2, Search, CalendarDays, Download, Eye } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const channelIcons: Record<string, any> = {
  email: Mail,
  journey: GitBranch,
  automation: Zap,
  social: Share2,
  system: Activity,
};

const channelColors: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  journey: 'bg-primary/20 text-primary border-primary/30',
  automation: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  social: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  system: 'bg-muted text-muted-foreground border-border/30',
};

const chartColors: Record<string, string> = {
  email: 'hsl(210, 80%, 60%)',
  journey: 'hsl(270, 60%, 60%)',
  automation: 'hsl(40, 80%, 55%)',
  social: 'hsl(150, 60%, 50%)',
  system: 'hsl(0, 0%, 55%)',
};

export const ActivityLog = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [channelFilter, setChannelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [selectedLog, setSelectedLog] = useState<any>(null);

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

  // Chart data
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l: any) => { counts[l.channel] = (counts[l.channel] || 0) + 1; });
    return Object.entries(counts).map(([channel, count]) => ({
      channel, count, fill: chartColors[channel] || chartColors.system,
    }));
  }, [logs]);

  const emailCount = logs.filter((l: any) => l.channel === 'email').length;
  const journeyCount = logs.filter((l: any) => l.channel === 'journey').length;
  const totalCount = logs.length;

  const exportCSV = () => {
    const rows = [['Timestamp', 'Channel', 'Type', 'Message', 'Contact']];
    filtered.forEach((l: any) => {
      rows.push([
        format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss'),
        l.channel, l.type, l.message, getContactName(l) || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'activity-log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Activity Log</h2>
              <p className="text-sm text-muted-foreground">Everything that happened, in one timeline</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Events', count: totalCount, color: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', icon: Activity },
          { label: 'Emails', count: emailCount, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', icon: Mail },
          { label: 'Journeys', count: journeyCount, color: 'from-primary/20 to-primary/5', text: 'text-primary', icon: GitBranch },
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

      {/* Activity Distribution Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Activity by Channel</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="channel" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      )}

      {/* Filters */}
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

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto">
            <Activity className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-muted-foreground">No activity yet</p>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/50" />
          <div className="space-y-1">
            {filtered.map((log: any, i: number) => {
              const Icon = channelIcons[log.channel] || Activity;
              const contactName = getContactName(log);
              const colors = channelColors[log.channel] || channelColors.system;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer relative"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className={`p-1.5 rounded-md border ${colors} z-10 bg-card`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{log.type}</Badge>
                      {contactName && (
                        <span className="text-xs text-primary/80">→ {contactName}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                  <Eye className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payload Viewer */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader><DialogTitle>Activity Details</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-3">
              <GlassCard className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Channel:</span> <span className="text-foreground">{selectedLog.channel}</span></div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{selectedLog.type}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{format(new Date(selectedLog.created_at), 'PPpp')}</span></div>
                </div>
              </GlassCard>
              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <p className="text-sm text-foreground mt-1">{selectedLog.message}</p>
              </div>
              {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Payload</Label>
                  <pre className="text-xs bg-muted/30 rounded-lg p-3 mt-1 overflow-auto max-h-[300px] text-foreground">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};