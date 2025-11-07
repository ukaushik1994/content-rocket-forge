import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { ContentType, ContentFormat } from '@/contexts/content-builder/types/content-types';

interface WordCountEstimationParams {
  title: string;
  outline: OutlineSection[];
  contentType: ContentType;
  contentFormat: ContentFormat;
  serpData?: any;
  selectedKeywords: string[];
}

/**
 * Estimates optimal word count based on multiple factors:
 * - Content title
 * - Outline structure (number of sections, depth)
 * - SERP data (average content length from top results)
 * - Content type (blog, landing page, etc.)
 * - Content format (long-form, listicle, etc.)
 */
export async function estimateOptimalWordCount(params: WordCountEstimationParams): Promise<number> {
  // Base estimates by content type
  const baseEstimates: Record<string, number> = {
    'blog': 1500,
    'social-twitter': 280,
    'social-linkedin': 1300,
    'social-facebook': 500,
    'social-instagram': 300,
    'script': 2000,
    'email': 600,
    'glossary': 800,
    'meme': 50,
    'carousel': 400
  };
  
  let estimate = baseEstimates[params.contentType] || 1500;
  
  // For non-blog content, use base estimates without heavy calculation
  if (params.contentType !== 'blog') {
    return Math.round(estimate / 100) * 100;
  }
  
  // Blog-specific calculation
  // Adjust based on outline sections (200-400 words per section)
  const sectionCount = params.outline.length;
  const wordsPerSection = 300;
  const outlineBasedEstimate = Math.max(sectionCount * wordsPerSection, 800);
  
  // Adjust based on content format
  const formatMultipliers: Record<string, number> = {
    'long-form': 1.5,
    'short-form': 0.6,
    'listicle': 0.8,
    'how-to': 1.3,
    'list': 0.8
  };
  
  estimate = outlineBasedEstimate * (formatMultipliers[params.contentFormat] || 1);
  
  // Factor in SERP data if available
  if (params.serpData) {
    // Try to extract average content length from SERP data
    let serpAverage = null;
    
    // Check if serpData has topResults with contentLength
    if (params.serpData.topResults && Array.isArray(params.serpData.topResults)) {
      const lengths = params.serpData.topResults
        .map((result: any) => result.contentLength || result.wordCount)
        .filter((length: any) => typeof length === 'number' && length > 0);
      
      if (lengths.length > 0) {
        serpAverage = lengths.reduce((sum: number, len: number) => sum + len, 0) / lengths.length;
      }
    }
    
    // Blend SERP average with our estimate (60% SERP, 40% calculated)
    if (serpAverage && serpAverage > 0) {
      estimate = (serpAverage * 0.6) + (estimate * 0.4);
    }
  }
  
  // Ensure minimum and maximum bounds
  estimate = Math.max(800, Math.min(estimate, 5000));
  
  // Round to nearest 100
  return Math.round(estimate / 100) * 100;
}
