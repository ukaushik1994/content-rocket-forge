import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

interface SmartActionHandlerProps {
  onActionExecuted?: (action: string, result: any) => void;
}

export const useSmartActionHandler = ({ onActionExecuted }: SmartActionHandlerProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const contentBuilder = useContentBuilder();

  const executeSmartAction = useCallback(async (action: string, data?: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform this action",
        variant: "destructive"
      });
      return;
    }

    try {
      let result: any = null;

      switch (action) {
        // Navigation actions
        case 'navigate:/content-builder':
          navigate('/ai-chat');
          result = { navigated: true, route: '/ai-chat' };
          break;

        case 'navigate:/solutions':
        case 'navigate:/offerings':
          navigate('/offerings');
          result = { navigated: true, route: '/offerings' };
          break;

        case 'navigate:/analytics':
          navigate('/analytics');
          result = { navigated: true, route: '/analytics' };
          break;

        case 'navigate:/settings':
          navigate('/ai-settings');
          result = { navigated: true, route: '/ai-settings' };
          break;

        // Content Builder integration
        case 'create-content-from-strategy':
          if (data?.strategy) {
            // Set main keyword from strategy
            if (data.strategy.primaryKeyword) {
              contentBuilder.setMainKeyword(data.strategy.primaryKeyword);
            }
            
            // Set content type and format
            if (data.strategy.contentType) {
              contentBuilder.setContentType(data.strategy.contentType);
            }
            
            // Set title if provided
            if (data.strategy.title) {
              contentBuilder.setContentTitle(data.strategy.title);
            }
            
            // Navigate to content builder
            navigate('/content-builder');
            
            result = { 
              contentBuilderInitialized: true, 
              strategy: data.strategy 
            };
            
            toast({
              title: "Content Builder Initialized",
              description: "Strategy data has been loaded into the Content Builder",
            });
          }
          break;

        case 'create-calendar-from-strategy':
          if (data?.recommendations) {
            try {
              // Create calendar entries from strategy recommendations
              const calendarEntries = data.recommendations.map((rec: any, index: number) => ({
                user_id: user.id,
                title: rec.title || `Content Task ${index + 1}`,
                description: rec.description,
                content_type: rec.contentType || 'blog',
                status: 'planned',
                priority: rec.priority === 'high' ? 'high' : rec.priority === 'low' ? 'low' : 'medium',
                scheduled_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(), // Weekly schedule
                metadata: {
                  source: 'ai-strategy',
                  strategy_id: data.strategyId
                }
              }));

              const { data: insertedEntries, error } = await supabase
                .from('content_calendar')
                .insert(calendarEntries)
                .select();

              if (error) throw error;

              result = { 
                calendarEntriesCreated: insertedEntries?.length || 0,
                entries: insertedEntries 
              };
              
              toast({
                title: "Calendar Created",
                description: `${insertedEntries?.length || 0} calendar entries created from strategy`,
              });
            } catch (error) {
              console.error('Failed to create calendar entries:', error);
              toast({
                title: "Calendar Creation Failed",
                description: "Failed to create calendar entries",
                variant: "destructive"
              });
            }
          }
          break;

        // Solution optimization
        case 'optimize-solution-visibility':
          if (data?.solutionId) {
            try {
              // Get solution details
              const { data: solution, error } = await supabase
                .from('solutions')
                .select('*')
                .eq('id', data.solutionId)
                .eq('user_id', user.id)
                .single();

              if (error) throw error;

              if (solution) {
                // Initialize content builder with solution context
                contentBuilder.setMainKeyword(solution.name);
                contentBuilder.setContentType('blog');
                contentBuilder.setContentTitle(`How to Use ${solution.name} Effectively`);
                
                navigate('/content-builder');
                
                result = {
                  solutionOptimized: true,
                  solution: solution.name,
                  contentBuilderInitialized: true
                };
                
                toast({
                  title: "Solution Optimization Started",
                  description: `Creating content to boost visibility for ${solution.name}`,
                });
              }
            } catch (error) {
              console.error('Failed to optimize solution:', error);
              toast({
                title: "Optimization Failed",
                description: "Failed to start solution optimization",
                variant: "destructive"
              });
            }
          }
          break;

        // Export actions
        case 'export-strategy-report':
          if (data?.reportData) {
            const reportContent = JSON.stringify(data.reportData, null, 2);
            const blob = new Blob([reportContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `strategy-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            result = { exported: true, filename: link.download };
            
            toast({
              title: "Report Exported",
              description: "Strategy report has been downloaded",
            });
          }
          break;

        case 'export-chart-data':
          if (data?.chartData) {
            const csvContent = convertToCSV(data.chartData);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chart-data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            result = { exported: true, filename: link.download };
            
            toast({
              title: "Chart Data Exported",
              description: "Chart data has been downloaded as CSV",
            });
          }
          break;

        // Analytics actions
        case 'create-performance-dashboard':
          navigate('/analytics');
          result = { navigated: true, route: '/analytics' };
          
          toast({
            title: "Analytics Dashboard",
            description: "View your performance metrics and insights",
          });
          break;

        // Workflow actions
        case 'view-workflow-history':
          navigate('/workflows/history');
          result = { navigated: true, route: '/workflows/history' };
          
          toast({
            title: "Workflow History",
            description: "View your intelligent workflow executions",
          });
          break;

        case 'analyze-workflow-patterns':
          navigate('/workflows/history');
          result = { navigated: true, route: '/workflows/history', action: 'analyze-patterns' };
          
          toast({
            title: "Workflow Pattern Analysis",
            description: "Analyzing your workflow success patterns",
          });
          break;

        case 'export-workflow-analytics':
          if (data?.workflowData) {
            const reportContent = JSON.stringify(data.workflowData, null, 2);
            const blob = new Blob([reportContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `workflow-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            result = { exported: true, filename: link.download };
            
            toast({
              title: "Workflow Analytics Exported",
              description: "Workflow analytics data has been downloaded",
            });
          }
          break;

        // AI workflow actions
        case 'create-follow-up-workflow':
          if (data?.workflowType && data?.context) {
            // Store workflow context for follow-up
            localStorage.setItem(`workflow_followup_${user.id}`, JSON.stringify({
              originalWorkflow: data.workflowType,
              context: data.context,
              timestamp: Date.now()
            }));
            
            result = { 
              followUpPrepared: true, 
              originalWorkflow: data.workflowType 
            };
            
            toast({
              title: "Follow-up Workflow Ready",
              description: "Context saved for next workflow execution",
            });
          }
          break;

        // Default fallback
        default:
          console.warn('Unknown smart action:', action);
          result = { 
            executed: false, 
            reason: 'Unknown action',
            action 
          };
          break;
      }

      // Notify parent component
      onActionExecuted?.(action, result);
      
      return result;

    } catch (error) {
      console.error('Smart action execution failed:', error);
      toast({
        title: "Action Failed",
        description: `Failed to execute ${action}`,
        variant: "destructive"
      });
      
      const errorResult = { 
        executed: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        action 
      };
      
      onActionExecuted?.(action, errorResult);
      return errorResult;
    }
  }, [navigate, toast, user, contentBuilder, onActionExecuted]);

  return { executeSmartAction };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' ? `"${val}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// Component wrapper for direct usage
export const SmartActionHandler: React.FC<SmartActionHandlerProps> = (props) => {
  useSmartActionHandler(props);
  return null;
};

export default SmartActionHandler;