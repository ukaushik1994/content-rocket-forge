
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { contentFormats } from '../formats';

interface FormatProgress {
  formatId: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface GenerationProgressProps {
  formatProgresses: FormatProgress[];
  isVisible: boolean;
  onClose?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  formatProgresses,
  isVisible,
  onClose
}) => {
  if (!isVisible || formatProgresses.length === 0) {
    return null;
  }

  const completedCount = formatProgresses.filter(f => f.status === 'completed').length;
  const totalCount = formatProgresses.length;
  const overallProgress = (completedCount / totalCount) * 100;

  const getStatusIcon = (status: FormatProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FormatProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-xs bg-green-500">Done</Badge>;
      case 'generating':
        return <Badge variant="default" className="text-xs bg-blue-500">Generating</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generation Progress</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {formatProgresses.map((formatProgress) => {
          const format = contentFormats.find(f => f.id === formatProgress.formatId);
          if (!format) return null;

          return (
            <div key={formatProgress.formatId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(formatProgress.status)}
                <div>
                  <span className="font-medium text-sm">{format.name}</span>
                  {formatProgress.error && (
                    <p className="text-xs text-red-500 mt-1">{formatProgress.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {formatProgress.status === 'generating' && formatProgress.progress && (
                  <Progress value={formatProgress.progress} className="w-16 h-2" />
                )}
                {getStatusBadge(formatProgress.status)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GenerationProgress;
