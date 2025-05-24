
import { useState, useEffect, useCallback } from 'react';
import { realTimeOptimizationEngine, OptimizationResult } from '@/services/optimization/realTimeOptimizationEngine';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const useRealTimeOptimization = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, serpData } = state;
  
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Set up the callback for optimization results
  useEffect(() => {
    realTimeOptimizationEngine.setCallback((result: OptimizationResult) => {
      setOptimizationResult(result);
      setIsOptimizing(false);
    });
  }, []);

  // Trigger optimization when content or keywords change
  useEffect(() => {
    if (content && mainKeyword && content.length > 100) {
      setIsOptimizing(true);
      
      // Extract competitor data from SERP data
      const competitors = serpData?.topResults?.map(result => ({
        title: result.title,
        wordCount: result.snippet?.split(' ').length || 0,
        headings: [], // Would be extracted from full content analysis
      })) || [];
      
      realTimeOptimizationEngine.optimize(content, mainKeyword, competitors);
    }
  }, [content, mainKeyword, serpData]);

  const manualOptimize = useCallback(() => {
    if (content && mainKeyword) {
      setIsOptimizing(true);
      
      const competitors = serpData?.topResults?.map(result => ({
        title: result.title,
        wordCount: result.snippet?.split(' ').length || 0,
        headings: [],
      })) || [];
      
      realTimeOptimizationEngine.optimize(content, mainKeyword, competitors);
    }
  }, [content, mainKeyword, serpData]);

  const applyAutoFix = useCallback((suggestionId: string) => {
    if (!optimizationResult || !content) return;
    
    const suggestion = optimizationResult.suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !suggestion.autoFixAvailable) return;
    
    // Apply specific auto-fixes based on suggestion type
    let optimizedContent = content;
    
    switch (suggestion.id) {
      case 'structure-missing-h1':
        if (!content.includes('# ')) {
          optimizedContent = `# ${mainKeyword}\n\n${content}`;
        }
        break;
      case 'readability-long-sentences':
        // Simple sentence splitting logic
        optimizedContent = content.replace(/([.!?])\s+/g, '$1\n\n');
        break;
      case 'readability-difficult':
        // Replace some complex words with simpler alternatives
        const replacements: { [key: string]: string } = {
          'utilize': 'use',
          'commence': 'start',
          'terminate': 'end',
          'demonstrate': 'show',
          'facilitate': 'help'
        };
        
        Object.entries(replacements).forEach(([complex, simple]) => {
          const regex = new RegExp(`\\b${complex}\\b`, 'gi');
          optimizedContent = optimizedContent.replace(regex, simple);
        });
        break;
    }
    
    return optimizedContent;
  }, [optimizationResult, content, mainKeyword]);

  return {
    optimizationResult,
    isOptimizing,
    manualOptimize,
    applyAutoFix,
    hasValidData: !!(content && mainKeyword && optimizationResult)
  };
};
