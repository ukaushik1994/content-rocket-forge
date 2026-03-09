import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Zap, Search, Download, Eye, CheckCircle2, XCircle, Clock, Timer, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { EngageButton } from '../shared/EngageButton';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { engageStagger } from '../shared/engageAnimations';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

export const AutomationRuns = () => {
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [retrying, setRetrying] = useState<string | null>(null);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['automation-runs', currentWorkspaceId, statusFilter, dateRange, page],
    queryFn: async () => {
      let q = supabase
        .from('automation_runs')
        .select('*, engage_automations(name), engage_contacts(email, first_name)')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('created_at', subDays(new Date(), parseInt(dateRange)).toISOString())
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  // Volume chart data
  const { data: volumeData = [] } = useQuery({
    queryKey: ['automation-runs-volume', currentWorkspaceId, dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const since = subDays(new Date(), days).toISOString();
      const { data } = await supabase
        .from('automation_runs')
        .select('created_at, status')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('created_at', since);
      const dayMap: Record<string, { day: string; total: number; failed: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM d');
        dayMap[d] = { day: d, total: 0, failed: 0 };
      }
      (data || []).forEach((r: any) => {
        const d = format(new Date(r.created_at), 'MMM d');
        if (dayMap[d]) {
          dayMap[d].total++;
          if (r.status === 'failed') dayMap[d].failed++;
        }
      });
      return Object.values(dayMap);
    },
    enabled: !!currentWorkspaceId,
  });

  const filtered = runs.filter((r: any) =>
    !search || (r.engage_automations as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.engage_contacts as any)?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: runs.length,
    success: runs.filter((r: any) => r.status === 'success').length,
    failed: runs.filter((r: any) => r.status === 'failed').length,
    avgDuration: runs.length > 0 ? Math.round(runs.reduce((sum: number, r: any) => sum + (r.duration_ms || 0), 0) / runs.length) : 0,
  }), [runs]);

  const retryRun = async (run: any) => {
    setRetrying(run.id);
    try {
      const { data, error } = await supabase.functions.invoke('engage-job-runner', { method: 'POST' });
      if (error) throw error;
      toast.success('Retry triggered successfully');
      queryClient.invalidateQueries({ queryKey: ['automation-runs'] });
    } catch (e: any) {
      toast.error(`Retry failed: ${e.message}`);
    } finally {
      setRetrying(null);
    }
  };

  const exportCSV = () => {
    const rows = [['Timestamp', 'Automation', 'Contact', 'Status', 'Duration (ms)', 'Error']];
    filtered.forEach((r: any) => {
      rows.push([
        format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
        (r.engage_automations as any)?.name || r.automation_id,
        (r.engage_contacts as any)?.email || '',
        r.status, String(r.duration_ms || 0), r.error || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'automation-runs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngageHero
        icon={Zap}
        title="Automation Runs"
        subtitle="Execution audit trail"
        gradientFrom="from-amber-400"
        gradientTo="to-orange-400"
        glowFrom="from-amber-500/30"
        glowTo="to-orange-500/10"
        actions={
          <div className="flex items-center gap-2">
            <EngageButton size="sm" variant="outline" gradient={false} onClick={() => window.history.back()}>
              ← Back
            </EngageButton>
            <EngageButton size="sm" variant="outline" gradient={false} onClick={exportCSV} disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </EngageButton>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={engageStagger.item} className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Runs', value: stats.total, icon: Zap, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400' },
          { label: 'Successful', value: stats.success, icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'from-red-500/20 to-red-500/5', text: 'text-destructive' },
          { label: 'Avg Duration', value: `${stats.avgDuration}ms`, icon: Timer, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' },
        ].map(s => (
          <GlassCard key={s.label} className={`p-3 bg-gradient-to-br ${s.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
              </div>
              <s.icon className={`h-4 w-4 ${s.text} opacity-50`} />
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Volume Chart */}
      {volumeData.some(d => d.total > 0) && (
        <motion.div variants={engageStagger.item}>
          <GlassCard className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Run Volume</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={volumeData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="failed" stroke="hsl(0, 84%, 60%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={engageStagger.item} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={v => { setDateRange(v); setPage(0); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24h</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Runs List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-amber-400" />
          </div>
          <p className="text-muted-foreground">No automation runs yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((run: any, i: number) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => setSelectedRun(run)}
            >
              {run.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {(run.engage_automations as any)?.name || 'Unknown'}
                  </span>
                  {(run.engage_contacts as any)?.email && (
                    <span className="text-xs text-muted-foreground">→ {(run.engage_contacts as any).email}</span>
                  )}
                </div>
                {run.error && <p className="text-xs text-destructive truncate">{run.error}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {run.status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={(e) => { e.stopPropagation(); retryRun(run); }}
                    disabled={retrying === run.id}
                  >
                    <RotateCw className={`h-2.5 w-2.5 mr-0.5 ${retrying === run.id ? 'animate-spin' : ''}`} /> Retry
                  </Button>
                )}
                {run.duration_ms && (
                  <Badge variant="outline" className="text-[10px]">
                    <Clock className="h-2.5 w-2.5 mr-0.5" /> {run.duration_ms}ms
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(run.created_at), 'MMM d, HH:mm')}
                </span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {runs.length > 0 && (
        <motion.div variants={engageStagger.item} className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="h-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">Page {page + 1}</span>
          <Button variant="outline" size="sm" className="h-7" disabled={runs.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </motion.div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-lg">
          <EngageDialogHeader icon={Zap} title="Run Details" gradientFrom="from-amber-400" gradientTo="to-orange-400" iconColor="text-amber-400" />
          {selectedRun && (
            <div className="space-y-3">
              <GlassCard className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Automation:</span> <span className="text-foreground">{(selectedRun.engage_automations as any)?.name || '—'}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={`text-[10px] ${selectedRun.status === 'success' ? 'text-emerald-400' : 'text-destructive'}`}>{selectedRun.status}</Badge></div>
                  <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{(selectedRun.engage_contacts as any)?.email || '—'}</span></div>
                  <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{selectedRun.duration_ms || 0}ms</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{format(new Date(selectedRun.created_at), 'PPpp')}</span></div>
                </div>
              </GlassCard>
              {selectedRun.error && (
                <div>
                  <Label className="text-xs text-destructive">Error</Label>
                  <p className="text-sm text-destructive mt-1 bg-destructive/5 rounded-lg p-3">{selectedRun.error}</p>
                </div>
              )}
              {selectedRun.trigger_event && (
                <div>
                  <Label className="text-xs text-muted-foreground">Trigger Event</Label>
                  <pre className="text-xs bg-muted/30 rounded-lg p-3 mt-1 overflow-auto max-h-[150px] text-foreground">
                    {JSON.stringify(selectedRun.trigger_event, null, 2)}
                  </pre>
                </div>
              )}
              {selectedRun.actions_executed && (
                <div>
                  <Label className="text-xs text-muted-foreground">Actions Executed</Label>
                  <pre className="text-xs bg-muted/30 rounded-lg p-3 mt-1 overflow-auto max-h-[150px] text-foreground">
                    {JSON.stringify(selectedRun.actions_executed, null, 2)}
                  </pre>
                </div>
              )}
              {selectedRun.status === 'failed' && (
                <EngageButton size="sm" variant="outline" gradient={false} onClick={() => retryRun(selectedRun)} disabled={retrying === selectedRun.id} className="w-full">
                  <RotateCw className={`h-3.5 w-3.5 mr-1 ${retrying === selectedRun.id ? 'animate-spin' : ''}`} /> Retry This Run
                </EngageButton>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
