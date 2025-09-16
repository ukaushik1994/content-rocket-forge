import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface AnalysisState {
  isAnalyzing: boolean;
  analysisProgress: number;
  currentStep: string;
  error: string | null;
  abortController: AbortController | null;
}

interface AnalysisOptions {
  timeout?: number;
  enableCaching?: boolean;
  maxRetries?: number;
}

export const useOptimizedAnalysis = (content: string, options: AnalysisOptions = {}) => {
  const { timeout = 30000, enableCaching = true, maxRetries = 2 } = options;
  
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    analysisProgress: 0,
    currentStep: '',
    error: null,
    abortController: null
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.abortController) {
        state.abortController.abort();
      }
    };
  }, [state.abortController]);

  const startAnalysis = useCallback(async (
    analysisFunction: (content: string, signal?: AbortSignal) => Promise<any[]>
  ) => {
    if (state.isAnalyzing) {
      toast.error('Analysis already in progress');
      return [];
    }

    const controller = new AbortController();
    
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisProgress: 0,
      error: null,
      abortController: controller,
      currentStep: 'Starting analysis...'
    }));

    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        setState(prev => ({
          ...prev,
          error: 'Analysis timed out',
          isAnalyzing: false,
          abortController: null
        }));
      }, timeout);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          analysisProgress: Math.min(prev.analysisProgress + 10, 90)
        }));
      }, 1000);

      const result = await analysisFunction(content, controller.signal);
      
      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisProgress: 100,
        currentStep: 'Analysis complete',
        abortController: null
      }));

      return result;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: 'Analysis was cancelled',
          abortController: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: error.message || 'Analysis failed',
          abortController: null
        }));
        toast.error('Analysis failed. Please try again.');
      }
      return [];
    }
  }, [state.isAnalyzing, timeout]);

  const cancelAnalysis = useCallback(() => {
    if (state.abortController) {
      state.abortController.abort();
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: 'Analysis cancelled',
        abortController: null
      }));
    }
  }, [state.abortController]);

  const resetAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      analysisProgress: 0,
      currentStep: '',
      error: null,
      abortController: null
    });
  }, []);

  return {
    ...state,
    startAnalysis,
    cancelAnalysis,
    resetAnalysis
  };
};