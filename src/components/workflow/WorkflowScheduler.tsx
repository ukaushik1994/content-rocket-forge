import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Play, Pause, Trash2 } from 'lucide-react';
import { WorkflowSchedulerService, ScheduledWorkflow, WorkflowScheduleOptions } from '@/services/workflowSchedulerService';
import { useToast } from '@/hooks/use-toast';
import { AccessibleButton } from '@/components/ui/AccessibleButton';

interface WorkflowSchedulerProps {
  userId: string;
  availableWorkflows: Array<{ id: string; title: string; description?: string }>;
}

export const WorkflowScheduler: React.FC<WorkflowSchedulerProps> = ({
  userId,
  availableWorkflows
}) => {
  const { toast } = useToast();
  const [scheduledWorkflows, setScheduledWorkflows] = useState<ScheduledWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    workflowId: '',
    scheduleExpression: '@daily',
    timezone: 'UTC',
    maxExecutions: 0
  });

  useEffect(() => {
    loadScheduledWorkflows();
  }, [userId]);

  const loadScheduledWorkflows = async () => {
    try {
      const workflows = await WorkflowSchedulerService.getUserScheduledWorkflows(userId);
      setScheduledWorkflows(workflows);
    } catch (error) {
      console.error('Error loading scheduled workflows:', error);
      toast({
        title: "Error Loading Schedules",
        description: "Could not load your scheduled workflows",
        variant: "destructive"
      });
    }
  };

  const handleScheduleWorkflow = async () => {
    if (!newSchedule.workflowId || !newSchedule.scheduleExpression) {
      toast({
        title: "Invalid Schedule",
        description: "Please select a workflow and schedule expression",
        variant: "destructive"
      });
      return;
    }

    // Validate cron expression
    if (!WorkflowSchedulerService.validateCronExpression(newSchedule.scheduleExpression)) {
      toast({
        title: "Invalid Schedule Expression",
        description: "Please enter a valid cron expression",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const options: WorkflowScheduleOptions = {
        scheduleExpression: newSchedule.scheduleExpression,
        timezone: newSchedule.timezone,
        maxExecutions: newSchedule.maxExecutions > 0 ? newSchedule.maxExecutions : undefined,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 5000
        }
      };

      await WorkflowSchedulerService.scheduleWorkflow(userId, newSchedule.workflowId, options);
      
      // Reset form
      setNewSchedule({
        workflowId: '',
        scheduleExpression: '@daily',
        timezone: 'UTC',
        maxExecutions: 0
      });

      await loadScheduledWorkflows();
      
      toast({
        title: "Workflow Scheduled",
        description: "Your workflow has been scheduled successfully",
      });
    } catch (error) {
      console.error('Error scheduling workflow:', error);
      toast({
        title: "Scheduling Failed",
        description: "Could not schedule the workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    try {
      await WorkflowSchedulerService.cancelSchedule(scheduleId);
      await loadScheduledWorkflows();
      
      toast({
        title: "Schedule Cancelled",
        description: "The workflow schedule has been cancelled",
      });
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the schedule",
        variant: "destructive"
      });
    }
  };

  const getWorkflowTitle = (workflowId: string) => {
    const workflow = availableWorkflows.find(w => w.id === workflowId);
    return workflow?.title || 'Unknown Workflow';
  };

  const formatNextRun = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    if (diff < 60000) return 'In less than 1 minute';
    if (diff < 3600000) return `In ${Math.round(diff / 60000)} minutes`;
    if (diff < 86400000) return `In ${Math.round(diff / 3600000)} hours`;
    return `In ${Math.round(diff / 86400000)} days`;
  };

  const predefinedSchedules = [
    { value: '@daily', label: 'Daily (at midnight)' },
    { value: '@hourly', label: 'Hourly' },
    { value: '@weekly', label: 'Weekly' },
    { value: '@monthly', label: 'Monthly' },
    { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
    { value: '0 18 * * *', label: 'Daily at 6 PM' },
    { value: 'custom', label: 'Custom Expression' }
  ];

  return (
    <div className="space-y-6">
      {/* Schedule New Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workflow-select">Workflow</Label>
              <Select 
                value={newSchedule.workflowId} 
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, workflowId: value }))}
              >
                <SelectTrigger id="workflow-select">
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-select">Schedule</Label>
              <Select 
                value={newSchedule.scheduleExpression} 
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, scheduleExpression: value }))}
              >
                <SelectTrigger id="schedule-select">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedSchedules.map((schedule) => (
                    <SelectItem key={schedule.value} value={schedule.value}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {newSchedule.scheduleExpression === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="cron-expression">Custom Cron Expression</Label>
              <Input
                id="cron-expression"
                placeholder="e.g., 0 9 * * 1-5 (weekdays at 9 AM)"
                value={newSchedule.scheduleExpression}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, scheduleExpression: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month dayOfWeek
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={newSchedule.timezone} 
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-executions">Max Executions (0 = unlimited)</Label>
              <Input
                id="max-executions"
                type="number"
                min="0"
                value={newSchedule.maxExecutions}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, maxExecutions: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <AccessibleButton
            onClick={handleScheduleWorkflow}
            disabled={isLoading || !newSchedule.workflowId}
            ariaLabel="Schedule the selected workflow"
            announceOnClick
          >
            {isLoading ? 'Scheduling...' : 'Schedule Workflow'}
          </AccessibleButton>
        </CardContent>
      </Card>

      {/* Scheduled Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Workflows ({scheduledWorkflows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledWorkflows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No workflows scheduled yet. Schedule your first workflow above.
            </p>
          ) : (
            <div className="space-y-4">
              {scheduledWorkflows.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{getWorkflowTitle(schedule.workflowId)}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Schedule: {schedule.scheduleExpression}</span>
                      <span>Next run: {formatNextRun(schedule.nextRun)}</span>
                      {schedule.lastRun && (
                        <span>Last run: {schedule.lastRun.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    <AccessibleButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSchedule(schedule.id)}
                      ariaLabel={`Cancel schedule for ${getWorkflowTitle(schedule.workflowId)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </AccessibleButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};