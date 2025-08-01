
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { unifiedDataService } from '@/services/unifiedDataService';
import { toast } from 'sonner';

interface StrategyWorkflowActionsProps {
  selectedKeywords?: string[];
  contentGaps?: string[];
}

export const StrategyWorkflowActions: React.FC<StrategyWorkflowActionsProps> = ({
  selectedKeywords = [],
  contentGaps = []
}) => {
  const navigate = useNavigate();
  const { currentStrategy, createPipelineItem } = useContentStrategy();

  const handleCreateContent = () => {
    if (!currentStrategy) {
      toast.error('Please create a strategy first');
      return;
    }

    const url = unifiedDataService.createContentFromStrategy(
      currentStrategy,
      selectedKeywords[0]
    );
    navigate(url);
  };

  const handleAddToPipeline = async () => {
    if (!currentStrategy) {
      toast.error('Please create a strategy first');
      return;
    }

    if (contentGaps.length === 0) {
      toast.error('No content gaps selected');
      return;
    }

    try {
      const items = contentGaps.slice(0, 3).map(gap => ({
        title: `Content for: ${gap}`,
        stage: 'idea',
        content_type: 'blog',
        priority: 'medium',
        target_keyword: selectedKeywords[0],
        notes: `Created from content gap analysis`
      }));

      for (const item of items) {
        await createPipelineItem(item);
      }

      toast.success(`Added ${items.length} items to pipeline`);
    } catch (error) {
      toast.error('Failed to add items to pipeline');
    }
  };

  const handleScheduleContent = () => {
    navigate('/research/content-strategy?tab=calendar');
  };

  const handleAnalyzeKeywords = () => {
    navigate('/ai-chat', { 
      state: { 
        message: `Analyze these keywords for my content strategy: ${selectedKeywords.join(', ')}`,
        context: 'keyword-analysis'
      }
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleCreateContent}
          className="w-full justify-between bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={!currentStrategy}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Create Content
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          onClick={handleAddToPipeline}
          variant="outline"
          className="w-full justify-between border-white/20 text-white hover:bg-white/10"
          disabled={contentGaps.length === 0}
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Add to Pipeline ({contentGaps.length})
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          onClick={handleScheduleContent}
          variant="outline"
          className="w-full justify-between border-white/20 text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Content
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        {selectedKeywords.length > 0 && (
          <Button
            onClick={handleAnalyzeKeywords}
            variant="outline"
            className="w-full justify-between border-white/20 text-white hover:bg-white/10"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Keyword Analysis
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
