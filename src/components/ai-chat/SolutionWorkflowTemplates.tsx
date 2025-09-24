import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Target, 
  Zap,
  Calendar,
  BarChart3,
  PenTool,
  Lightbulb
} from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: string[];
  solutionTypes: string[];
  tags: string[];
}

interface SolutionWorkflowTemplatesProps {
  solution: Solution;
  onSelectTemplate: (templateId: string, solutionId: string) => void;
  className?: string;
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-strategy',
    name: 'Content Strategy Development',
    description: 'Create a comprehensive content strategy highlighting solution benefits and use cases',
    icon: <PenTool className="h-4 w-4" />,
    estimatedTime: '15-20 min',
    difficulty: 'Intermediate',
    steps: [
      'Analyze solution features and benefits',
      'Identify target audience pain points',
      'Create content themes and topics',
      'Develop messaging framework',
      'Plan content calendar'
    ],
    solutionTypes: ['all'],
    tags: ['strategy', 'content', 'marketing']
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Positioning Analysis',
    description: 'Analyze competitive landscape and develop unique positioning strategy',
    icon: <BarChart3 className="h-4 w-4" />,
    estimatedTime: '25-30 min',
    difficulty: 'Advanced',
    steps: [
      'Identify key competitors',
      'Analyze feature comparisons',
      'Map competitive advantages',
      'Develop differentiation strategy',
      'Create positioning statements'
    ],
    solutionTypes: ['all'],
    tags: ['analysis', 'competitive', 'positioning']
  },
  {
    id: 'audience-segmentation',
    name: 'Audience Segmentation & Personas',
    description: 'Define detailed audience segments and create buyer personas',
    icon: <Users className="h-4 w-4" />,
    estimatedTime: '20-25 min',
    difficulty: 'Intermediate',
    steps: [
      'Analyze target audience data',
      'Segment by demographics and needs',
      'Create detailed buyer personas',
      'Map customer journey stages',
      'Develop persona-specific messaging'
    ],
    solutionTypes: ['all'],
    tags: ['audience', 'personas', 'segmentation']
  },
  {
    id: 'roi-calculator',
    name: 'ROI & Value Proposition Builder',
    description: 'Calculate potential ROI and build compelling value propositions',
    icon: <TrendingUp className="h-4 w-4" />,
    estimatedTime: '15-20 min',
    difficulty: 'Beginner',
    steps: [
      'Identify key value drivers',
      'Calculate potential cost savings',
      'Estimate productivity gains',
      'Build ROI scenarios',
      'Create value proposition statements'
    ],
    solutionTypes: ['data', 'analytics', 'enterprise'],
    tags: ['roi', 'value', 'business-case']
  },
  {
    id: 'campaign-planning',
    name: 'Marketing Campaign Planning',
    description: 'Plan and structure comprehensive marketing campaigns',
    icon: <Calendar className="h-4 w-4" />,
    estimatedTime: '30-35 min',
    difficulty: 'Advanced',
    steps: [
      'Define campaign objectives',
      'Select target channels',
      'Create campaign timeline',
      'Develop creative assets plan',
      'Set success metrics and KPIs'
    ],
    solutionTypes: ['all'],
    tags: ['campaign', 'marketing', 'planning']
  },
  {
    id: 'feature-showcase',
    name: 'Feature Demonstration Content',
    description: 'Create engaging content that showcases key product features',
    icon: <Zap className="h-4 w-4" />,
    estimatedTime: '10-15 min',
    difficulty: 'Beginner',
    steps: [
      'Select key features to highlight',
      'Create feature benefit mapping',
      'Develop demonstration scenarios',
      'Write feature descriptions',
      'Plan visual content needs'
    ],
    solutionTypes: ['all'],
    tags: ['features', 'demo', 'showcase']
  }
];

export const SolutionWorkflowTemplates: React.FC<SolutionWorkflowTemplatesProps> = ({
  solution,
  onSelectTemplate,
  className = ""
}) => {
  // Filter templates based on solution category and type
  const getRelevantTemplates = (): WorkflowTemplate[] => {
    const solutionCategory = solution.category?.toLowerCase() || '';
    const solutionName = solution.name.toLowerCase();
    
    return WORKFLOW_TEMPLATES.filter(template => {
      // Always include 'all' templates
      if (template.solutionTypes.includes('all')) return true;
      
      // Check if template applies to this solution type
      return template.solutionTypes.some(type => 
        solutionCategory.includes(type) || solutionName.includes(type)
      );
    }).sort((a, b) => {
      // Prioritize beginner templates
      const difficultyWeight = { 'Beginner': 3, 'Intermediate': 2, 'Advanced': 1 };
      return difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty];
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const relevantTemplates = getRelevantTemplates();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Workflow Templates for {solution.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pre-built workflows to help you create content and strategies for this solution
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {relevantTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.estimatedTime}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Steps:</h5>
                        <ul className="text-xs space-y-1">
                          {template.steps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                          {template.steps.length > 3 && (
                            <li className="text-xs text-muted-foreground/70">
                              +{template.steps.length - 3} more steps
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => onSelectTemplate(template.id, solution.id)}
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        Start Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {relevantTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-muted-foreground mb-1">No Templates Available</h3>
              <p className="text-sm text-muted-foreground/70">
                Workflow templates for this solution are coming soon.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};