import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTimes: Record<string, number>;
  errorCount: number;
  memoryUsage?: number;
  networkRequests: number;
  coreWebVitals: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  };
}

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
}

/**
 * Hook for comprehensive performance monitoring and error tracking
 */
export const usePerformanceMonitoring = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    renderTime: 0,
    apiResponseTimes: {},
    errorCount: 0,
    networkRequests: 0,
    coreWebVitals: {}
  });
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const startTime = useRef<number>(Date.now());

  // Initialize performance monitoring
  useEffect(() => {
    startPerformanceMonitoring();
    setupErrorTracking();
    measureCoreWebVitals();

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, []);

  const startPerformanceMonitoring = useCallback(() => {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        setMetrics(prev => ({
          ...prev,
          pageLoadTime: nav.loadEventEnd - nav.navigationStart,
          renderTime: nav.domContentLoadedEventEnd - nav.navigationStart
        }));
      }
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            setMetrics(prev => ({
              ...prev,
              networkRequests: prev.networkRequests + 1
            }));
          }
          
          if (entry.entryType === 'measure') {
            const apiMatch = entry.name.match(/api-(\w+)/);
            if (apiMatch) {
              setMetrics(prev => ({
                ...prev,
                apiResponseTimes: {
                  ...prev.apiResponseTimes,
                  [apiMatch[1]]: entry.duration
                }
              }));
            }
          }
        });
      });

      performanceObserver.current.observe({ 
        entryTypes: ['resource', 'measure', 'navigation'] 
      });
    }
  }, []);

  const setupErrorTracking = useCallback(() => {
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent
      };

      setErrors(prev => [...prev, errorInfo]);
      setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));

      // Show toast for critical errors
      if (event.error?.name === 'ChunkLoadError' || event.message.includes('Loading chunk')) {
        toast({
          title: "Loading Error Detected",
          description: "Some resources failed to load. Try refreshing the page.",
          variant: "destructive"
        });
      }

      console.error('[Performance Monitor] Error tracked:', errorInfo);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      setErrors(prev => [...prev, errorInfo]);
      setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));

      console.error('[Performance Monitor] Promise rejection tracked:', errorInfo);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [toast]);

  const measureCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          setMetrics(prev => ({
            ...prev,
            coreWebVitals: {
              ...prev.coreWebVitals,
              lcp: lastEntry.startTime
            }
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          setMetrics(prev => ({
            ...prev,
            coreWebVitals: {
              ...prev.coreWebVitals,
              cls: clsValue
            }
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Core Web Vitals monitoring not supported:', error);
      }
    }
  }, []);

  // Measure API call performance
  const measureApiCall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Create a performance measure
      performance.mark(`api-${apiName}-start`);
      performance.mark(`api-${apiName}-end`);
      performance.measure(`api-${apiName}`, `api-${apiName}-start`, `api-${apiName}-end`);

      setMetrics(prev => ({
        ...prev,
        apiResponseTimes: {
          ...prev.apiResponseTimes,
          [apiName]: duration
        }
      }));

      // Alert if API is slow
      if (duration > 5000) {
        toast({
          title: "Slow API Response",
          description: `${apiName} took ${Math.round(duration)}ms to respond`,
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      setErrors(prev => [...prev, {
        message: `API Error in ${apiName}: ${error}`,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }]);

      setMetrics(prev => ({ 
        ...prev, 
        errorCount: prev.errorCount + 1,
        apiResponseTimes: {
          ...prev.apiResponseTimes,
          [apiName]: duration
        }
      }));

      throw error;
    }
  }, [toast]);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize
      }));
      return memory;
    }
    return null;
  }, []);

  // Generate performance report
  const generateReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      errors: errors.slice(-10), // Last 10 errors
      memoryInfo: getMemoryUsage(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('[Performance Report]', report);
    return report;
  }, [metrics, errors, getMemoryUsage]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setMetrics(prev => ({ ...prev, errorCount: 0 }));
  }, []);

  return {
    metrics,
    errors,
    measureApiCall,
    generateReport,
    clearErrors,
    getMemoryUsage
  };
};

export default usePerformanceMonitoring;