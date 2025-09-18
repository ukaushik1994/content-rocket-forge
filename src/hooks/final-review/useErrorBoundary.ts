import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  recovered: boolean;
}

/**
 * Hook to manage error boundaries and recovery in the final review system
 */
export const useErrorBoundary = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);

  const captureError = useCallback((
    error: Error,
    context: string,
    recoverable = true
  ) => {
    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      error,
      context,
      recovered: false
    };

    setErrors(prev => [...prev, errorInfo]);
    
    console.error(`[${context}] Error captured:`, error);
    
    if (recoverable) {
      toast.error(`Error in ${context}`, {
        description: error.message,
        action: {
          label: 'Retry',
          onClick: () => attemptRecovery(errorInfo.id)
        }
      });
    } else {
      toast.error(`Critical error in ${context}`, {
        description: error.message + ' - Please refresh the page',
      });
    }

    return errorInfo.id;
  }, []);

  const attemptRecovery = useCallback(async (errorId: string) => {
    setIsRecovering(true);
    try {
      // Mark error as recovered
      setErrors(prev => 
        prev.map(err => 
          err.id === errorId 
            ? { ...err, recovered: true }
            : err
        )
      );
      
      toast.success('Recovery attempted');
      return true;
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      toast.error('Recovery failed');
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    toast.info('Error history cleared');
  }, []);

  const getRecentErrors = useCallback((minutes = 5) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return errors.filter(err => err.timestamp > cutoff);
  }, [errors]);

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string,
    recoverable = true
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        captureError(error as Error, context, recoverable);
        return null;
      }
    };
  }, [captureError]);

  return {
    errors,
    isRecovering,
    captureError,
    attemptRecovery,
    clearErrors,
    getRecentErrors,
    withErrorBoundary,
    hasRecentErrors: getRecentErrors().length > 0
  };
};

export default useErrorBoundary;