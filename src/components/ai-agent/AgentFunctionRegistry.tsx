
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Settings, 
  Users, 
  Workflow,
  Database,
  Code
} from 'lucide-react';

const functionCategories = {
  'Content Management': {
    icon: FileText,
    functions: [
      'createContent', 'updateContent', 'deleteContent', 'publishContent',
      'listContent', 'optimizeContent', 'generateOutline'
    ]
  },
  'SEO & Analysis': {
    icon: Search,
    functions: [
      'analyzeKeyword', 'analyzeSERP', 'getCompetitorAnalysis'
    ]
  },
  'Analytics': {
    icon: BarChart3,
    functions: [
      'getAnalytics', 'getPerformanceReport'
    ]
  },
  'Workflow Management': {
    icon: Workflow,
    functions: [
      'startApprovalWorkflow', 'reviewContent', 'executeWorkflow'
    ]
  },
  'Solution Management': {
    icon: Settings,
    functions: [
      'createSolution', 'listSolutions'
    ]
  },
  'Platform': {
    icon: Code,
    functions: [
      'getRepositoryInfo'
    ]
  }
};

export const AgentFunctionRegistry = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available AI Agent Functions</h3>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {Object.entries(functionCategories).map(([category, config]) => {
            const Icon = config.icon;
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {config.functions.map(func => (
                      <Badge key={func} variant="secondary" className="text-xs">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="text-sm text-muted-foreground">
        The AI agent can execute any of these functions through natural conversation.
        Just ask what you want to accomplish and the agent will handle the rest.
      </div>
    </div>
  );
};
