import { useState, useCallback, useRef } from 'react';
import { OptimizationSuggestion } from '../types';
import { QualityCheckSuggestion } from './useContentQualityIntegration';
import { optimizationCache } from '@/services/optimizationCacheService';
import { toast } from 'sonner';

export interface OptimizationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  estimatedTime: number;
  actualTime?: number;
  suggestions?: OptimizationSuggestion[] | QualityCheckSuggestion[];
  error?: string;
}

export interface ProgressiveOptimizationState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  overallProgress: number;
  steps: OptimizationStep[];
  canCancel: boolean;
  estimatedTimeRemaining: number;
}

export function useProgressiveOptimization() {
  const [state, setState] = useState<ProgressiveOptimizationState>({
    isRunning: false,
    currentStep: 0,
    totalSteps: 0,
    overallProgress: 0,
    steps: [],
    canCancel: true,
    estimatedTimeRemaining: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const stepStartTimeRef = useRef<number>(0);
  const totalStartTimeRef = useRef<number>(0);

  const initializeSteps = useCallback((content: string) => {
    const steps: OptimizationStep[] = [
      {
        id: 'cache_check',
        name: 'Checking Cache',
        status: 'pending',
        progress: 0,
        estimatedTime: 500
      },
      {
        id: 'quality_analysis',
        name: 'Quality Analysis',
        status: 'pending',
        progress: 0,
        estimatedTime: 3000
      },
      {
        id: 'content_analysis',
        name: 'Content Structure Analysis',
        status: 'pending',
        progress: 0,
        estimatedTime: 2500
      },
      {
        id: 'ai_detection',
        name: 'AI Content Detection',
        status: 'pending',
        progress: 0,
        estimatedTime: 4000
      },
      {
        id: 'serp_analysis',
        name: 'SERP Integration Analysis',
        status: 'pending',
        progress: 0,
        estimatedTime: 3500
      },
      {
        id: 'solution_analysis',
        name: 'Solution Integration Analysis',
        status: 'pending',
        progress: 0,
        estimatedTime: 2000
      }
    ];

    const totalTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);
    
    setState(prev => ({
      ...prev,
      steps,
      totalSteps: steps.length,
      estimatedTimeRemaining: totalTime
    }));

    return steps;
  }, []);

  const updateStepProgress = useCallback((stepId: string, progress: number, suggestions?: any[]) => {
    setState(prev => {
        const updatedSteps = prev.steps.map(step => {
        if (step.id === stepId) {
          const newStatus: 'pending' | 'running' | 'completed' | 'error' = progress === 100 ? 'completed' : 'running';
          return { 
            ...step, 
            progress,
            status: newStatus,
            suggestions: suggestions || step.suggestions,
            actualTime: progress === 100 && stepStartTimeRef.current ? Date.now() - stepStartTimeRef.current : step.actualTime
          };
        }
        return step;
      });

      const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
      const currentStepIndex = updatedSteps.findIndex(s => s.status === 'running');
      const overallProgress = Math.round((completedSteps / updatedSteps.length) * 100);

      // Calculate remaining time based on actual vs estimated times
      const remainingSteps = updatedSteps.slice(currentStepIndex + 1);
      const estimatedTimeRemaining = remainingSteps.reduce((sum, step) => sum + step.estimatedTime, 0);

      return {
        ...prev,
        steps: updatedSteps,
        currentStep: currentStepIndex,
        overallProgress,
        estimatedTimeRemaining
      };
    });
  }, []);

  const completeStep = useCallback((stepId: string, suggestions?: any[]) => {
    updateStepProgress(stepId, 100, suggestions);
  }, [updateStepProgress]);

  const errorStep = useCallback((stepId: string, error: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'error', error, actualTime: Date.now() - stepStartTimeRef.current }
          : step
      ),
      isRunning: false,
      canCancel: false
    }));

    toast.error(`Optimization failed at ${stepId}: ${error}`);
  }, []);

  const startOptimization = useCallback(async (
    content: string,
    analysisCallbacks: {
      onQualityAnalysis: () => Promise<QualityCheckSuggestion[]>;
      onContentAnalysis: () => Promise<OptimizationSuggestion[]>;
      onAIDetection: () => Promise<OptimizationSuggestion[]>;
      onSerpAnalysis: () => Promise<OptimizationSuggestion[]>;
      onSolutionAnalysis: () => Promise<OptimizationSuggestion[]>;
    }
  ) => {
    // Initialize abort controller
    abortControllerRef.current = new AbortController();
    totalStartTimeRef.current = Date.now();

    const steps = initializeSteps(content);
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      canCancel: true,
      currentStep: 0,
      overallProgress: 0
    }));

    try {
      // Step 1: Check cache
      stepStartTimeRef.current = Date.now();
      updateStepProgress('cache_check', 50);
      
      const cached = optimizationCache.getCachedAnalysis(content);
      if (cached) {
        completeStep('cache_check');
        
        // Skip analysis steps if cached
        setState(prev => ({
          ...prev,
          steps: prev.steps.map(step => 
            ['quality_analysis', 'content_analysis', 'ai_detection', 'serp_analysis', 'solution_analysis'].includes(step.id)
              ? { ...step, status: 'completed', progress: 100 }
              : step
          ),
          overallProgress: 100,
          isRunning: false
        }));

        return {
          qualitySuggestions: cached.qualitySuggestions,
          contentSuggestions: cached.suggestions.filter(s => s.type === 'content'),
          aiDetectionSuggestions: cached.suggestions.filter(s => s.type === 'humanization'),
          serpIntegrationSuggestions: cached.suggestions.filter(s => s.type === 'serp_integration'),
          solutionSuggestions: cached.suggestions.filter(s => s.type === 'solution')
        };
      }

      completeStep('cache_check');

      if (abortControllerRef.current?.signal.aborted) return null;

      // Step 2: Quality Analysis
      stepStartTimeRef.current = Date.now();
      updateStepProgress('quality_analysis', 25);
      const qualitySuggestions = await analysisCallbacks.onQualityAnalysis();
      updateStepProgress('quality_analysis', 75);
      
      if (abortControllerRef.current?.signal.aborted) return null;
      completeStep('quality_analysis', qualitySuggestions);

      // Step 3: Content Analysis
      stepStartTimeRef.current = Date.now();
      updateStepProgress('content_analysis', 30);
      const contentSuggestions = await analysisCallbacks.onContentAnalysis();
      
      if (abortControllerRef.current?.signal.aborted) return null;
      completeStep('content_analysis', contentSuggestions);

      // Step 4: AI Detection
      stepStartTimeRef.current = Date.now();
      updateStepProgress('ai_detection', 40);
      const aiDetectionSuggestions = await analysisCallbacks.onAIDetection();
      
      if (abortControllerRef.current?.signal.aborted) return null;
      completeStep('ai_detection', aiDetectionSuggestions);

      // Step 5: SERP Analysis
      stepStartTimeRef.current = Date.now();
      updateStepProgress('serp_analysis', 35);
      const serpIntegrationSuggestions = await analysisCallbacks.onSerpAnalysis();
      
      if (abortControllerRef.current?.signal.aborted) return null;
      completeStep('serp_analysis', serpIntegrationSuggestions);

      // Step 6: Solution Analysis
      stepStartTimeRef.current = Date.now();
      updateStepProgress('solution_analysis', 45);
      const solutionSuggestions = await analysisCallbacks.onSolutionAnalysis();
      
      if (abortControllerRef.current?.signal.aborted) return null;
      completeStep('solution_analysis', solutionSuggestions);

      // Cache results
      const allSuggestions = [
        ...contentSuggestions,
        ...aiDetectionSuggestions,
        ...serpIntegrationSuggestions,
        ...solutionSuggestions
      ];
      
      optimizationCache.setCachedAnalysis(content, allSuggestions, qualitySuggestions);

      setState(prev => ({
        ...prev,
        isRunning: false,
        canCancel: false,
        overallProgress: 100
      }));

      const totalTime = Date.now() - totalStartTimeRef.current;
      toast.success(`Analysis completed in ${(totalTime / 1000).toFixed(1)}s`);

      return {
        qualitySuggestions,
        contentSuggestions,
        aiDetectionSuggestions,
        serpIntegrationSuggestions,
        solutionSuggestions
      };

    } catch (error) {
      const currentStepId = steps[state.currentStep]?.id || 'unknown';
      errorStep(currentStepId, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }, [initializeSteps, updateStepProgress, completeStep, errorStep, state.currentStep]);

  const cancelOptimization = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isRunning: false,
        canCancel: false
      }));
      toast.info('Optimization cancelled');
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isRunning: false,
      currentStep: 0,
      totalSteps: 0,
      overallProgress: 0,
      steps: [],
      canCancel: true,
      estimatedTimeRemaining: 0
    });
    abortControllerRef.current = null;
  }, []);

  return {
    state,
    startOptimization,
    cancelOptimization,
    resetState,
    updateStepProgress
  };
}