import React, { ReactNode } from 'react';
import { useABTestVariant } from '@/hooks/useABTestVariant';

interface ABTestVariantProps {
  testId: string;
  variants: Record<string, ReactNode>;
  fallback?: ReactNode;
  loading?: ReactNode;
  onVariantAssigned?: (variantName: string) => void;
  autoTrack?: boolean;
}

export const ABTestVariant: React.FC<ABTestVariantProps> = ({
  testId,
  variants,
  fallback,
  loading: loadingContent,
  onVariantAssigned,
  autoTrack = true
}) => {
  const { 
    variant, 
    loading, 
    error, 
    variantName 
  } = useABTestVariant({
    testId,
    autoTrack,
    onVariantAssigned: (v) => onVariantAssigned?.(v.name)
  });

  if (loading) {
    return <>{loadingContent || null}</>;
  }

  if (error || !variant) {
    return <>{fallback || null}</>;
  }

  // Render the content for the assigned variant
  const content = variants[variantName || ''] || fallback;
  
  return <>{content}</>;
};

// Convenience component for simple content switching
interface ABTestContentProps {
  testId: string;
  contentKey: string;
  fallback?: any;
  render?: (content: any) => ReactNode;
  autoTrack?: boolean;
}

export const ABTestContent: React.FC<ABTestContentProps> = ({
  testId,
  contentKey,
  fallback,
  render,
  autoTrack = true
}) => {
  const { getVariantContent, loading, error } = useABTestVariant({
    testId,
    autoTrack
  });

  if (loading || error) {
    return render ? render(fallback) : <>{fallback}</>;
  }

  const content = getVariantContent(contentKey, fallback);
  
  return render ? render(content) : <>{content}</>;
};

// Component for conditional rendering based on variant
interface ABTestConditionalProps {
  testId: string;
  variantName: string;
  children: ReactNode;
  fallback?: ReactNode;
  autoTrack?: boolean;
}

export const ABTestConditional: React.FC<ABTestConditionalProps> = ({
  testId,
  variantName,
  children,
  fallback,
  autoTrack = true
}) => {
  const { isVariant, loading, error } = useABTestVariant({
    testId,
    autoTrack
  });

  if (loading || error) {
    return <>{fallback || null}</>;
  }

  return isVariant(variantName) ? <>{children}</> : <>{fallback || null}</>;
};