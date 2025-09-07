import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProgressStep {
  step: number;
  stepName: string;
  progressPercentage: number;
  status: 'active' | 'completed' | 'error';
  stepData?: Record<string, any>;
}

interface UseProgressPollingProps {
  sessionId: string;
  onComplete?: (finalData?: any) => void;
  onError?: (error: string) => void;
  pollInterval?: number;
}

export function useProgressPolling({ 
  sessionId, 
  onComplete, 
  onError, 
  pollInterval = 2000 
}: UseProgressPollingProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startPolling = async () => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const pollProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('strategy_generation_progress')
          .select('*')
          .eq('session_id', sessionId)
          .order('step', { ascending: true });

        if (error) {
          console.error('Error polling progress:', error);
          onError?.('Failed to fetch progress');
          return;
        }

        if (data && data.length > 0) {
          const progressSteps: ProgressStep[] = data.map(item => ({
            step: item.step,
            stepName: item.step_name,
            progressPercentage: item.progress_percentage,
            status: item.status as 'active' | 'completed' | 'error',
            stepData: item.step_data as Record<string, any> || {}
          }));

          setSteps(progressSteps);
          
          const latestStep = data[data.length - 1];
          setCurrentStep(latestStep.step);

          // Check if all steps are completed or if there's an error
          const hasError = data.some(item => item.status === 'error');
          const allCompleted = data.length > 0 && data.every(item => item.status === 'completed');

          if (hasError) {
            setIsPolling(false);
            const errorStep = data.find(item => item.status === 'error');
            const errorData = errorStep?.step_data as Record<string, any>;
            onError?.(errorData?.error || 'Generation failed');
            return;
          }

          if (allCompleted) {
            setIsPolling(false);
            const finalStepData = latestStep?.step_data;
            onComplete?.(finalStepData);
            return;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        onError?.('Connection error while checking progress');
        setIsPolling(false);
      }
    };

    // Initial poll
    await pollProgress();
    
    // Set up interval polling
    intervalRef.current = setInterval(pollProgress, pollInterval);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    steps,
    currentStep,
    isPolling,
    startPolling,
    stopPolling
  };
}