import { useState, useEffect } from 'react';
import { abTestService, ABTestVariant } from '@/services/abTestService';

export interface UseABTestVariantOptions {
  testId: string;
  defaultVariant?: any;
  autoTrack?: boolean;
  onVariantAssigned?: (variant: ABTestVariant) => void;
}

export const useABTestVariant = <T = any>({
  testId,
  defaultVariant,
  autoTrack = true,
  onVariantAssigned
}: UseABTestVariantOptions) => {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const getVariant = async () => {
      try {
        setLoading(true);
        setError(null);

        const assignedVariant = await abTestService.getVariantAssignment(testId);
        
        if (!mounted) return;

        if (assignedVariant) {
          setVariant(assignedVariant);
          onVariantAssigned?.(assignedVariant);

          // Auto-track exposure event
          if (autoTrack) {
            await abTestService.trackEvent(testId, 'exposure');
          }
        } else {
          setError('No variant assigned');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to get variant');
        console.error('Error getting A/B test variant:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getVariant();

    return () => {
      mounted = false;
    };
  }, [testId, autoTrack, onVariantAssigned]);

  const trackEvent = async (
    eventType: string, 
    eventValue?: number, 
    metadata: Record<string, any> = {}
  ) => {
    return await abTestService.trackEvent(testId, eventType, eventValue, metadata);
  };

  const trackConversion = async (value?: number, metadata: Record<string, any> = {}) => {
    return await trackEvent('conversion', value, metadata);
  };

  const trackClick = async (element: string, metadata: Record<string, any> = {}) => {
    return await trackEvent('click', undefined, { element, ...metadata });
  };

  const trackView = async (section: string, metadata: Record<string, any> = {}) => {
    return await trackEvent('view', undefined, { section, ...metadata });
  };

  // Get variant content with type safety
  const getVariantContent = <K extends keyof T>(key: K, fallback?: T[K]): T[K] | undefined => {
    if (!variant?.content_data) return fallback;
    return variant.content_data[key as string] ?? fallback;
  };

  // Check if this is a specific variant
  const isVariant = (variantName: string): boolean => {
    return variant?.name === variantName;
  };

  // Check if this is the control variant
  const isControl = (): boolean => {
    return variant?.is_control ?? false;
  };

  return {
    variant,
    loading,
    error,
    trackEvent,
    trackConversion,
    trackClick,
    trackView,
    getVariantContent,
    isVariant,
    isControl,
    // Convenience methods
    variantName: variant?.name,
    variantData: variant?.content_data as T,
    ready: !loading && !error && variant !== null
  };
};