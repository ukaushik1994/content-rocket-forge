
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  logError?: boolean;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      customMessage,
      logError = true
    } = options;

    const errorMessage = typeof error === 'string' ? error : error.message;
    
    if (logError) {
      console.error('Error handled:', error);
    }

    if (showToast) {
      const message = customMessage || errorMessage || 'An unexpected error occurred';
      toast.error(message);
    }

    // You can extend this to send to error reporting service
    // reportError(error);
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}
