import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { optimizationCache } from '@/services/optimizationCacheService';
import { adaptivePromptService } from '@/services/adaptivePromptService';

interface BackgroundAnalyzerProps {
  content: string;
  onAnalysisComplete?: (results: any) => void;
  debounceMs?: number;
  enabled?: boolean;
}

interface AnalysisResult {
  contentHash: string;
  suggestions: any[];
  qualityScore: number;
  timestamp: number;
  fromCache: boolean;
}

export function BackgroundAnalyzer({ 
  content, 
  onAnalysisComplete, 
  debounceMs = 2000,
  enabled = true 
}: BackgroundAnalyzerProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastAnalyzedHash = useRef<string>('');
  const isAnalyzing = useRef(false);

  // Generate content hash for comparison
  const generateContentHash = useCallback((text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }, []);

  // Perform background analysis
  const analyzeContent = useCallback(async (contentToAnalyze: string): Promise<AnalysisResult | null> => {
    if (!contentToAnalyze.trim() || isAnalyzing.current) return null;

    const contentHash = generateContentHash(contentToAnalyze);
    
    // Skip if content hasn't changed significantly
    if (contentHash === lastAnalyzedHash.current) return null;

    try {
      isAnalyzing.current = true;

      // Check cache first
      const cachedResult = optimizationCache.getCachedAnalysis(contentToAnalyze);
      if (cachedResult) {
        const result: AnalysisResult = {
          contentHash,
          suggestions: [...cachedResult.suggestions, ...cachedResult.qualitySuggestions],
          qualityScore: Math.random() * 30 + 70, // Mock quality score
          timestamp: Date.now(),
          fromCache: true
        };

        lastAnalyzedHash.current = contentHash;
        return result;
      }

      // Simulate AI analysis (replace with actual AI calls in production)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock suggestions based on content characteristics
      const suggestions = generateSmartSuggestions(contentToAnalyze);
      const qualityScore = calculateQualityScore(contentToAnalyze);

      const result: AnalysisResult = {
        contentHash,
        suggestions,
        qualityScore,
        timestamp: Date.now(),
        fromCache: false
      };

      // Cache the results
      optimizationCache.setCachedAnalysis(contentToAnalyze, suggestions.filter(s => s.category !== 'quality'), suggestions.filter(s => s.category === 'quality'));

      lastAnalyzedHash.current = contentHash;
      return result;

    } catch (error) {
      console.error('Background analysis failed:', error);
      return null;
    } finally {
      isAnalyzing.current = false;
    }
  }, [generateContentHash]);

  // Generate smart suggestions based on content analysis
  const generateSmartSuggestions = (text: string) => {
    const suggestions = [];
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    // Content length suggestions
    if (wordCount < 50) {
      suggestions.push({
        id: 'content-too-short',
        title: 'Content appears too short',
        description: 'Consider expanding with more detailed information',
        type: 'content',
        priority: 'medium',
        category: 'content',
        autoFixable: false
      });
    }

    // Readability suggestions
    if (avgSentenceLength > 25) {
      suggestions.push({
        id: 'long-sentences',
        title: 'Some sentences are too long',
        description: 'Break down complex sentences for better readability',
        type: 'content',
        priority: 'high',
        category: 'quality',
        autoFixable: true
      });
    }

    // SEO suggestions
    const hasHeaders = /^#{1,6}\s+/m.test(text);
    if (!hasHeaders && wordCount > 100) {
      suggestions.push({
        id: 'missing-headers',
        title: 'Missing headers for better structure',
        description: 'Add H2 and H3 headers to improve content organization',
        type: 'seo',
        priority: 'medium',
        category: 'seo',
        autoFixable: true
      });
    }

    // AI detection suggestions
    const repetitivePatterns = detectRepetitivePatterns(text);
    if (repetitivePatterns > 3) {
      suggestions.push({
        id: 'repetitive-content',
        title: 'Content shows repetitive patterns',
        description: 'Vary sentence structure and word choice for more natural flow',
        type: 'humanization',
        priority: 'low',
        category: 'content',
        autoFixable: true
      });
    }

    return suggestions;
  };

  // Calculate quality score based on various factors
  const calculateQualityScore = (text: string): number => {
    let score = 100;
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Penalize very short content
    if (wordCount < 50) score -= 20;
    
    // Penalize very long sentences
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgSentenceLength > 30) score -= 15;

    // Reward good structure
    const hasHeaders = /^#{1,6}\s+/m.test(text);
    if (hasHeaders) score += 5;

    // Reward balanced paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    if (avgParagraphLength > 20 && avgParagraphLength < 100) score += 5;

    return Math.max(0, Math.min(100, score));
  };

  // Detect repetitive patterns that might indicate AI-generated content
  const detectRepetitivePatterns = (text: string): number => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let repetitiveCount = 0;

    // Check for repeated sentence starters
    const starters = sentences.map(s => s.trim().split(' ').slice(0, 3).join(' '));
    const starterCounts: { [key: string]: number } = {};
    
    starters.forEach(starter => {
      starterCounts[starter] = (starterCounts[starter] || 0) + 1;
    });

    Object.values(starterCounts).forEach(count => {
      if (count > 2) repetitiveCount += count - 1;
    });

    return repetitiveCount;
  };

  // Debounced analysis effect
  useEffect(() => {
    if (!enabled || !content) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced analysis
    timeoutRef.current = setTimeout(async () => {
      const result = await analyzeContent(content);
      
      if (result && onAnalysisComplete) {
        onAnalysisComplete(result);
        
        // Show subtle notification if analysis found issues
        if (!result.fromCache && result.suggestions.length > 0) {
          toast.info(`Background analysis complete`, {
            description: `Found ${result.suggestions.length} optimization opportunities`,
            duration: 3000,
          });
        }
      }
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, enabled, debounceMs, analyzeContent, onAnalysisComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isAnalyzing.current = false;
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

export type { AnalysisResult };