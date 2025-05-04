
import { useEffect } from 'react';

/**
 * Custom hook for debug logging
 */
export const useDebugLogging = (metaTitle: string | null, contentTitle: string | null) => {
  // Debug logs for tracking state
  useEffect(() => {
    console.log("[useFinalReview] Meta title state:", metaTitle);
    console.log("[useFinalReview] Content title state:", contentTitle);
  }, [metaTitle, contentTitle]);
};
