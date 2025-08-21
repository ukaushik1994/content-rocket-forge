import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Save,
  Target
} from 'lucide-react';

interface StrategyStatusIndicatorProps {
  proposal: any;
}

export function StrategyStatusIndicator({ proposal }: StrategyStatusIndicatorProps) {
  const { state } = useContentBuilder();

  const getOverallProgress = () => {
    let completed = 0;
    const total = 5;

    if (state.selectedSolution) completed++;
    if (state.serpSelections.some(item => item.selected)) completed++;
    if (state.outline.length > 0) completed++;
    if (state.content && state.content.length > 100) completed++;
    if (state.metaTitle && state.metaDescription) completed++;

    return { completed, total, percentage: (completed / total) * 100 };
  };

  const progress = getOverallProgress();

  const statusItems = [
    {
      label: 'Solution Selected',
      completed: !!state.selectedSolution,
      icon: Target,
      value: state.selectedSolution?.name || 'None'
    },
    {
      label: 'SERP Research',
      completed: state.serpSelections.some(item => item.selected),
      icon: Sparkles,
      value: `${state.serpSelections.filter(item => item.selected).length} items selected`
    },
    {
      label: 'Content Outline',
      completed: state.outline.length > 0,
      icon: FileText,
      value: `${state.outline.length} sections`
    },
    {
      label: 'Content Generated',
      completed: !!state.content && state.content.length > 100,
      icon: FileText,
      value: state.content ? `${state.content.split(/\s+/).length} words` : 'Not generated'
    },
    {
      label: 'Ready to Save',
      completed: !!state.content && !!state.metaTitle,
      icon: Save,
      value: state.isSaving ? 'Saving...' : (state.content ? 'Ready' : 'Not ready')
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Strategy Progress</CardTitle>
          <Badge variant="outline" className="text-xs">
            {Math.round(progress.percentage)}% Complete
          </Badge>
        </div>
        {proposal && (
          <div className="text-xs text-muted-foreground">
            <strong>{proposal.primary_keyword}</strong> • {proposal.title}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : state.isAnalyzing || state.isGenerating || state.isSaving ? (
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}