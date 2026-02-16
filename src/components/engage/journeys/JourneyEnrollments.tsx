import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Play, Pause, SkipForward, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface JourneyEnrollmentsProps {
  journeyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JourneyEnrollments: React.FC<JourneyEnrollmentsProps> = ({ journeyId, open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['journey-enrollments-list', journeyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_enrollments')
        .select('*, engage_contacts(email, first_name, last_name)')
        .eq('journey_id', journeyId)
        .order('enrolled_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!journeyId,
  });

  const { data: stepsMap = {} } = useQuery<Record<string, any[]>>({
    queryKey: ['journey-enrollment-steps', journeyId, expandedEnrollment],
    queryFn: async () => {
      if (!expandedEnrollment) return {};
      const { data } = await supabase
        .from('journey_steps' as any)
        .select('*')
        .eq('enrollment_id', expandedEnrollment)
        .order('scheduled_for', { ascending: true });
      return { [expandedEnrollment]: (data as any[]) || [] };
    },
    enabled: !!expandedEnrollment,
  });

  const updateEnrollment = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('journey_enrollments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-enrollments-list'] });
      toast.success('Enrollment updated');
    },
  });

  const retryStep = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await (supabase.from('journey_steps' as any) as any)
        .update({ status: 'pending', error: null })
        .eq('id', stepId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-enrollment-steps'] });
      toast.success('Step queued for retry');
    },
  });

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    completed: 'bg-blue-500/10 text-blue-400',
    exited: 'bg-muted/50 text-muted-foreground',
  };

  const stepStatusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    running: 'bg-blue-500/10 text-blue-400',
    done: 'bg-emerald-500/10 text-emerald-400',
    failed: 'bg-destructive/10 text-destructive',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <EngageDialogHeader icon={Users} title="Journey Enrollments" gradientFrom="from-purple-400" gradientTo="to-blue-400" iconColor="text-purple-400" />

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active', count: enrollments.filter((e: any) => e.status === 'active').length, color: 'text-emerald-400' },
            { label: 'Completed', count: enrollments.filter((e: any) => e.status === 'completed').length, color: 'text-blue-400' },
            { label: 'Exited', count: enrollments.filter((e: any) => e.status === 'exited').length, color: 'text-muted-foreground' },
          ].map(s => (
            <GlassCard key={s.label} className="p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Enrollments table */}
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Loading...</p>
        ) : enrollments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No enrollments yet</p>
        ) : (
          <div className="space-y-1">
            {enrollments.map((enrollment: any) => {
              const contact = enrollment.engage_contacts;
              const name = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email : 'Unknown';
              const isExpanded = expandedEnrollment === enrollment.id;
              const steps = stepsMap[enrollment.id] || [];

              return (
                <div key={enrollment.id}>
                  <GlassCard className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedEnrollment(isExpanded ? null : enrollment.id)}>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                        <div>
                          <p className="text-sm font-medium text-foreground">{name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Enrolled {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-[10px] h-5 ${statusColor[enrollment.status] || ''}`}>{enrollment.status}</Badge>
                        {enrollment.status === 'active' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateEnrollment.mutate({ id: enrollment.id, status: 'exited' })} title="Pause">
                              <Pause className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateEnrollment.mutate({ id: enrollment.id, status: 'completed' })} title="Skip to end">
                              <SkipForward className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Steps */}
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1 mb-2">
                      {steps.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2">No steps executed yet</p>
                      ) : steps.map((step: any) => (
                        <div key={step.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/20">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[9px] h-4 ${stepStatusColor[step.status] || ''}`}>{step.status}</Badge>
                            <span className="text-xs text-foreground">{step.node_id}</span>
                            {step.executed_at && (
                              <span className="text-[10px] text-muted-foreground">{format(new Date(step.executed_at), 'h:mm a')}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {step.error && <span className="text-[10px] text-destructive truncate max-w-[100px]">{step.error}</span>}
                            {step.status === 'failed' && (
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => retryStep.mutate(step.id)} title="Retry">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
