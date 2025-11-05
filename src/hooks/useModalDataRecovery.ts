import { useState, useEffect, useCallback } from 'react';
import { ChartConfiguration } from '@/types/enhancedChat';

/**
 * Hook to handle data recovery for charts when modal opens
 * Automatically fetches missing data by sending intelligent prompts to AI
 */
export const useModalDataRecovery = (
  charts: ChartConfiguration[],
  onSendMessage?: (msg: string) => void,
  originalQuery?: string
) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastRecoveryAttempt, setLastRecoveryAttempt] = useState(0);

  // Detect which charts need recovery
  const chartsNeedingRecovery = charts.filter(chart => 
    !chart.data || !Array.isArray(chart.data) || chart.data.length === 0
  );

  const validCharts = charts.filter(chart => 
    chart.data && Array.isArray(chart.data) && chart.data.length > 0
  );

  /**
   * Attempts to recover data by sending intelligent follow-up to AI
   */
  const attemptRecovery = useCallback(async () => {
    if (!onSendMessage) {
      console.warn('⚠️ Cannot attempt recovery: onSendMessage not provided');
      return false;
    }

    // Debounce - prevent duplicate attempts within 2 seconds
    const now = Date.now();
    if (now - lastRecoveryAttempt < 2000) {
      console.log('🔄 Skipping recovery - debounced (too soon)');
      return false;
    }

    if (chartsNeedingRecovery.length === 0) {
      console.log('✅ No charts need recovery');
      return false;
    }

    setLastRecoveryAttempt(now);
    setIsRecovering(true);

    // Build recovery prompt for all invalid charts
    const chartTitles = chartsNeedingRecovery.map(c => c.title || 'Chart').join(', ');
    const prompt = originalQuery 
      ? `Please provide the data for these visualizations: ${chartTitles}. Original context: ${originalQuery}`
      : `The following charts need data: ${chartTitles}. Please fetch and display the missing data.`;

    console.log('🔄 Attempting automatic data recovery:', {
      chartsNeedingRecovery: chartsNeedingRecovery.length,
      prompt
    });

    try {
      // Send recovery prompt to AI
      onSendMessage(prompt);
      
      // Recovery will be handled by the normal message flow
      // Keep recovering state for a bit to show loading
      setTimeout(() => setIsRecovering(false), 3000);
      return true;
    } catch (error) {
      console.error('❌ Failed to attempt recovery:', error);
      setIsRecovering(false);
      return false;
    }
  }, [chartsNeedingRecovery, onSendMessage, originalQuery, lastRecoveryAttempt]);

  // Auto-trigger recovery when modal opens with invalid charts
  useEffect(() => {
    if (chartsNeedingRecovery.length > 0 && onSendMessage && !isRecovering) {
      console.log('🔄 Modal opened with invalid charts - attempting auto-recovery');
      attemptRecovery();
    }
  }, [chartsNeedingRecovery.length, onSendMessage]);

  return {
    isRecovering,
    chartsNeedingRecovery: chartsNeedingRecovery.length,
    validCharts,
    attemptRecovery
  };
};
