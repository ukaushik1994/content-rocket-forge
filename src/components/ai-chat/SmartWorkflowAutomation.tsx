import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  isActive: boolean;
  schedule?: string;
  lastRun?: Date;
  nextRun?: Date;
  successCount: number;
  totalRuns: number;
}

interface AutomationTrigger {
  type: 'schedule' | 'performance_threshold' | 'content_status' | 'user_action';
  condition: string;
  value?: any;
}

interface SmartWorkflowAutomationProps {
  onWorkflowTriggered?: (workflow: WorkflowAutomation) => void;
}

export const SmartWorkflowAutomation: React.FC<SmartWorkflowAutomationProps> = ({
  onWorkflowTriggered
}) => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<WorkflowAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAutomations();
      initializeDefaultAutomations();
    }
  }, [user]);

  const loadAutomations = async () => {
    try {
      // Load existing automations from database
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('user_id', user?.id)
        .eq('workflow_type', 'automation');

      if (data && data.length > 0) {
        const workflows = data.map(item => {
          const workflowData = item.workflow_data as any;
          return {
            id: item.id,
            name: workflowData.name || 'Unnamed Workflow',
            description: workflowData.description || '',
            triggers: workflowData.triggers || [],
            actions: workflowData.actions || [],
            isActive: workflowData.isActive || false,
            schedule: workflowData.schedule,
            lastRun: workflowData.lastRun ? new Date(workflowData.lastRun) : undefined,
            nextRun: workflowData.nextRun ? new Date(workflowData.nextRun) : undefined,
            successCount: workflowData.successCount || 0,
            totalRuns: workflowData.totalRuns || 0
          };
        });
        setAutomations(workflows);
      }
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultAutomations = async () => {
    const defaultAutomations: Partial<WorkflowAutomation>[] = [
      {
        name: 'Content Performance Monitor',
        description: 'Automatically analyze content performance and suggest optimizations',
        triggers: ['performance_threshold'],
        actions: ['analyze_performance', 'suggest_optimizations'],
        isActive: true,
        schedule: 'daily',
        successCount: 0,
        totalRuns: 0
      },
      {
        name: 'SEO Optimization Alert',
        description: 'Monitor SEO scores and alert when content needs optimization',
        triggers: ['seo_score_below_70'],
        actions: ['send_notification', 'create_seo_task'],
        isActive: true,
        successCount: 0,
        totalRuns: 0
      },
      {
        name: 'Content Publishing Scheduler',
        description: 'Automatically schedule content publishing based on optimal times',
        triggers: ['content_ready_for_publish'],
        actions: ['schedule_publish', 'notify_team'],
        isActive: false,
        schedule: 'on_trigger',
        successCount: 0,
        totalRuns: 0
      },
      {
        name: 'Weekly Performance Report',
        description: 'Generate and send weekly performance analytics reports',
        triggers: ['weekly_schedule'],
        actions: ['generate_report', 'send_email'],
        isActive: true,
        schedule: 'weekly',
        successCount: 0,
        totalRuns: 0
      }
    ];

    // Check if default automations exist, if not create them
    try {
      for (const automation of defaultAutomations) {
        const { error } = await supabase
          .from('ai_workflow_states')
          .upsert({
            user_id: user?.id,
            workflow_type: 'automation',
            current_step: 'active',
            workflow_data: {
              ...automation,
              lastRun: automation.lastRun?.toISOString(),
              nextRun: automation.nextRun?.toISOString()
            } as any
          });

        if (error) console.error('Error creating automation:', error);
      }
      
      // Reload automations after creating defaults
      await loadAutomations();
    } catch (error) {
      console.error('Error initializing default automations:', error);
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const updatedAutomations = automations.map(automation =>
        automation.id === id ? { ...automation, isActive } : automation
      );
      setAutomations(updatedAutomations);

      // Update in database
      await supabase
        .from('ai_workflow_states')
        .update({
          workflow_data: { 
            ...updatedAutomations.find(a => a.id === id),
            isActive,
            lastRun: updatedAutomations.find(a => a.id === id)?.lastRun?.toISOString(),
            nextRun: updatedAutomations.find(a => a.id === id)?.nextRun?.toISOString()
          } as any
        })
        .eq('id', id);

    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const executeAutomation = async (automation: WorkflowAutomation) => {
    try {
      // Simulate automation execution
      const updatedAutomation = {
        ...automation,
        lastRun: new Date(),
        totalRuns: automation.totalRuns + 1,
        successCount: automation.successCount + 1
      };

      const updatedAutomations = automations.map(a =>
        a.id === automation.id ? updatedAutomation : a
      );
      setAutomations(updatedAutomations);

      // Update in database
      await supabase
        .from('ai_workflow_states')
        .update({
          workflow_data: {
            ...updatedAutomation,
            lastRun: updatedAutomation.lastRun.toISOString(),
            nextRun: updatedAutomation.nextRun?.toISOString()
          } as any
        })
        .eq('id', automation.id);

      onWorkflowTriggered?.(updatedAutomation);
    } catch (error) {
      console.error('Error executing automation:', error);
    }
  };

  const getSuccessRate = (automation: WorkflowAutomation) => {
    return automation.totalRuns > 0 
      ? Math.round((automation.successCount / automation.totalRuns) * 100)
      : 0;
  };

  const getStatusColor = (automation: WorkflowAutomation) => {
    if (!automation.isActive) return 'secondary';
    const successRate = getSuccessRate(automation);
    if (successRate >= 80) return 'default';
    if (successRate >= 60) return 'secondary';
    return 'destructive';
  };

  const getNextRunText = (automation: WorkflowAutomation) => {
    if (!automation.isActive) return 'Inactive';
    if (automation.schedule === 'on_trigger') return 'On trigger';
    if (automation.nextRun) {
      const diff = automation.nextRun.getTime() - Date.now();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      }
      return 'Due now';
    }
    return 'Not scheduled';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Smart Workflow Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {automations.map((automation, index) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{automation.name}</h4>
                        <Badge variant={getStatusColor(automation)}>
                          {automation.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {automation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>Triggers: {automation.triggers.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Success: {getSuccessRate(automation)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Next: {getNextRunText(automation)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeAutomation(automation)}
                        disabled={!automation.isActive}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {automation.totalRuns > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Success Rate</span>
                        <span>{automation.successCount}/{automation.totalRuns}</span>
                      </div>
                      <Progress value={getSuccessRate(automation)} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {automations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No automations configured yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={initializeDefaultAutomations}
            >
              Setup Default Automations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};