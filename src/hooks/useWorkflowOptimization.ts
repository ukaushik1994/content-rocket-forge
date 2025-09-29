import { useState, useCallback } from 'react';
import { workflowOptimizationService, WorkflowSuggestion, ContentComplexityAnalysis } from '@/services/workflowOptimizationService';
import { toast } from 'sonner';

export function useWorkflowOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [workflowSuggestion, setWorkflowSuggestion] = useState<WorkflowSuggestion | null>(null);
  const [priorityScore, setPriorityScore] = useState<number>(50);

  const optimizeWorkflow = useCallback(async (
    contentType: string,
    keywords: string[],
    targetWordCount: number,
    requirements: string[] = []
  ) => {
    if (!contentType || keywords.length === 0) {
      toast.error('Content type and keywords are required');
      return null;
    }

    setIsOptimizing(true);
    try {
      const suggestion = await workflowOptimizationService.suggestWorkflow(
        contentType,
        keywords,
        targetWordCount,
        requirements
      );

      // Calculate priority score
      const priority = await workflowOptimizationService.calculatePriorityScore(
        keywords[0],
        contentType
      );

      suggestion.priorityScore = priority;
      setPriorityScore(priority);
      setWorkflowSuggestion(suggestion);

      toast.success('Workflow optimized successfully');
      return suggestion;
    } catch (error) {
      console.error('Workflow optimization failed:', error);
      toast.error('Failed to optimize workflow');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const calculatePriority = useCallback(async (
    keyword: string,
    contentType: string,
    searchVolume?: number,
    competitionLevel?: string
  ) => {
    try {
      const priority = await workflowOptimizationService.calculatePriorityScore(
        keyword,
        contentType,
        searchVolume,
        competitionLevel
      );

      setPriorityScore(priority);
      return priority;
    } catch (error) {
      console.error('Priority calculation failed:', error);
      return 50;
    }
  }, []);

  const predictDeadline = useCallback(async (
    contentType: string,
    complexity: ContentComplexityAnalysis,
    teamCapacity: number = 1
  ) => {
    try {
      const deadline = await workflowOptimizationService.predictDeadline(
        contentType,
        complexity,
        teamCapacity
      );

      if (workflowSuggestion) {
        setWorkflowSuggestion({
          ...workflowSuggestion,
          deadlineSuggestion: deadline,
        });
      }

      return deadline;
    } catch (error) {
      console.error('Deadline prediction failed:', error);
      return null;
    }
  }, [workflowSuggestion]);

  return {
    isOptimizing,
    workflowSuggestion,
    priorityScore,
    optimizeWorkflow,
    calculatePriority,
    predictDeadline,
  };
}
