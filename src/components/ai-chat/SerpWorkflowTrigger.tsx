import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Target, TrendingUp } from "lucide-react";
import { serpAIService } from '@/services/serpAIService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SerpWorkflowTriggerProps {
  serpData: any[];
  onWorkflowStart?: (workflowId: string) => void;
}

const SerpWorkflowTrigger: React.FC<SerpWorkflowTriggerProps> = ({
  serpData,
  onWorkflowStart
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingWorkflow, setIsCreatingWorkflow] = React.useState(false);

  const extractKeywords = (data: any[]): string[] => {
    return data.map(item => item.keyword || item.data?.keyword).filter(Boolean);
  };

  const handleCreateWorkflow = async (workflowType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create workflows.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingWorkflow(true);
    
    try {
      const keywords = extractKeywords(serpData);
      const workflowId = await serpAIService.createWorkflow(workflowType, keywords, user.id);
      
      if (workflowId) {
        // Start workflow execution
        await serpAIService.executeWorkflow(workflowId, user.id);
        
        toast({
          title: "Workflow Created",
          description: `${getWorkflowDisplayName(workflowType)} workflow started successfully.`,
        });

        onWorkflowStart?.(workflowId);
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast({
        title: "Workflow Creation Failed",
        description: "There was an error creating the workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const getWorkflowDisplayName = (type: string): string => {
    const names: Record<string, string> = {
      'keyword_analysis': 'Keyword Analysis',
      'content_planning': 'Content Planning',
      'competitor_tracking': 'Competitor Tracking',
      'trend_monitoring': 'Trend Monitoring'
    };
    return names[type] || type;
  };

  const workflowOptions = [
    {
      type: 'keyword_analysis',
      title: 'Deep Keyword Analysis',
      description: 'Comprehensive analysis of keyword opportunities and competition',
      icon: Target,
      priority: 'high' as const,
      estimatedTime: '5-10 minutes'
    },
    {
      type: 'content_planning',
      title: 'Content Strategy',
      description: 'Generate content ideas and optimization recommendations',
      icon: TrendingUp,
      priority: 'medium' as const,
      estimatedTime: '10-15 minutes'
    },
    {
      type: 'competitor_tracking',
      title: 'Competitor Analysis',
      description: 'Track competitor movements and identify opportunities',
      icon: Clock,
      priority: 'medium' as const,
      estimatedTime: '15-20 minutes'
    }
  ];

  if (!serpData || serpData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Create automated workflows based on your SERP analysis
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflowOptions.map((workflow) => {
          const Icon = workflow.icon;
          return (
            <Card key={workflow.type} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge variant={workflow.priority === 'high' ? 'default' : 'secondary'}>
                    {workflow.priority}
                  </Badge>
                </div>
                <CardTitle className="text-sm">{workflow.title}</CardTitle>
                <CardDescription className="text-xs">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {workflow.estimatedTime}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleCreateWorkflow(workflow.type)}
                    disabled={isCreatingWorkflow}
                    className="h-7 px-2"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SerpWorkflowTrigger;