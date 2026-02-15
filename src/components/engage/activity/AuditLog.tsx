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
import { Shield, Search, Download, Eye, User, FileText, Zap, Settings } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

const resourceIcons: Record<string, any> = {
  template: FileText,
  journey: Zap,
  automation: Zap,
  contact: User,
  segment: Settings,
  campaign: FileText,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  update: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  delete: 'bg-destructive/10 text-destructive border-destructive/30',
  publish: 'bg-primary/10 text-primary border-primary/30',
  pause: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  export: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export const AuditLog = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['engage-audit-log', currentWorkspaceId, resourceFilter, dateRange],
    queryFn: async () => {
      let q = supabase
        .from('engage_audit_log')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .gte('created_at', subDays(new Date(), parseInt(dateRange)).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);
      if (resourceFilter !== 'all') q = q.eq('resource_type', resourceFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filtered = logs.filter((l: any) =>
    !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.resource_type?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [['Timestamp', 'Action', 'Resource Type', 'Resource ID', 'User ID']];
    filtered.forEach((l: any) => {
      rows.push([
        format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss'),
        l.action, l.resource_type, l.resource_id || '', l.user_id || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Audit Log
            </h3>
            <p className="text-sm text-muted-foreground">Security-grade who/what/when tracking</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search actions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="journey">Journeys</SelectItem>
            <SelectItem value="automation">Automations</SelectItem>
            <SelectItem value="contact">Contacts</SelectItem>
            <SelectItem value="campaign">Campaigns</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">No audit events recorded</p>
          <p className="text-xs text-muted-foreground">Actions like creating contacts, templates, and journeys will be tracked here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log: any, i: number) => {
            const Icon = resourceIcons[log.resource_type] || Settings;
            const colors = actionColors[log.action] || actionColors.update;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${colors}`}>{log.action}</Badge>
                    <span className="text-sm text-foreground">{log.resource_type}</span>
                    {log.resource_id && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{log.resource_id}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {format(new Date(log.created_at), 'MMM d, HH:mm')}
                </span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader><DialogTitle>Audit Event Details</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-3">
              <GlassCard className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Action:</span> <span className="text-foreground font-medium">{selectedLog.action}</span></div>
                  <div><span className="text-muted-foreground">Resource:</span> <span className="text-foreground">{selectedLog.resource_type}</span></div>
                  <div><span className="text-muted-foreground">Resource ID:</span> <span className="text-foreground font-mono">{selectedLog.resource_id || '—'}</span></div>
                  <div><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{format(new Date(selectedLog.created_at), 'PPpp')}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">User ID:</span> <span className="text-foreground font-mono text-[10px]">{selectedLog.user_id || '—'}</span></div>
                </div>
              </GlassCard>
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Details</Label>
                  <pre className="text-xs bg-muted/30 rounded-lg p-3 mt-1 overflow-auto max-h-[300px] text-foreground">
                    {JSON.stringify(selectedLog.details, null, 2)}
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
