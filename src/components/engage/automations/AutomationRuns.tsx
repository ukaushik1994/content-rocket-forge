import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Zap, Search, Download, Eye, CheckCircle2, XCircle, Clock, Timer } from 'lucide-react';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

export const AutomationRuns = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [selectedRun, setSelectedRun] = useState<any>(null);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['automation-runs', currentWorkspaceId, statusFilter, dateRange],
    queryFn: async () => {
      let q = supabase
        .from('automation_runs')
        .select('*, engage_automations(name), engage_contacts(email, first_name)')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('created_at', subDays(new Date(), parseInt(dateRange)).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filtered = runs.filter((r: any) =>
    !search || (r.engage_automations as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.engage_contacts as any)?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: runs.length,
    success: runs.filter((r: any) => r.status === 'success').length,
    failed: runs.filter((r: any) => r.status === 'failed').length,
    avgDuration: runs.length > 0 ? Math.round(runs.reduce((sum: number, r: any) => sum + (r.duration_ms || 0), 0) / runs.length) : 0,
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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => window.history.back()}>
              ← Back
            </Button>
            <div>
              <h3 className="text-lg font-bold text-foreground">Automation Runs</h3>
              <p className="text-sm text-muted-foreground">Execution audit trail</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Runs', value: stats.total, icon: Zap, color: 'text-amber-400' },
          { label: 'Successful', value: stats.success, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-destructive' },
          { label: 'Avg Duration', value: `${stats.avgDuration}ms`, icon: Timer, color: 'text-blue-400' },
        ].map(s => (
          <GlassCard key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-4 w-4 ${s.color} opacity-50`} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24h</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
