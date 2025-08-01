
import { calculateContentQuality, calculateReadabilityMetrics } from '@/utils/contentAnalytics';

export interface SeoIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  fix?: string;
}

export interface SeoAnalysis {
  score: number;
  readability: number;
  keywordDensity: number;
  structure: number;
  recommendations: string[];
  issues?: SeoIssue[];
}

export async function analyzeSeoContent(
  content: string,
  targetKeyword?: string,
  existingMeta?: { title?: string; description?: string }
): Promise<SeoAnalysis> {
  try {
    if (!content || content.trim().length === 0) {
      return {
        score: 0,
        readability: 0,
        keywordDensity: 0,
        structure: 0,
        recommendations: ['Add content to analyze'],
        issues: [{ type: 'error', message: 'No content provided for analysis' }]
      };
    }

    const wordCount = content.split(/\s+/).length;
    const readabilityMetrics = calculateReadabilityMetrics(content);
    const qualityMetrics = calculateContentQuality(content, targetKeyword ? [targetKeyword] : []);
    
    // Calculate keyword density
    let keywordDensity = 0;
    if (targetKeyword) {
      const keywordCount = (content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
      keywordDensity = (keywordCount / wordCount) * 100;
    }

    // Structure analysis
    const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
    const structureScore = Math.min(100, Math.max(0, headingCount * 20 + (wordCount > 300 ? 20 : 0)));

    // Overall score calculation
    const score = Math.round(
      (qualityMetrics.overallScore * 0.4) +
      (readabilityMetrics.readabilityScore * 0.3) +
      (Math.min(keywordDensity * 33, 100) * 0.2) +
      (structureScore * 0.1)
    );

    // Generate recommendations and issues
    const recommendations: string[] = [];
    const issues: SeoIssue[] = [];

    if (wordCount < 300) {
      recommendations.push('Increase content length to at least 300 words for better SEO');
      issues.push({
        type: 'warning',
        message: 'Content is too short for optimal SEO',
        fix: 'Add more detailed information and examples'
      });
    }

    if (headingCount === 0) {
      recommendations.push('Add headings to improve content structure');
      issues.push({
        type: 'error',
        message: 'No headings found in content',
        fix: 'Use H2 and H3 tags to organize your content'
      });
    }

    if (targetKeyword && keywordDensity < 0.5) {
      recommendations.push(`Increase usage of target keyword "${targetKeyword}"`);
      issues.push({
        type: 'suggestion',
        message: 'Target keyword density is low',
        fix: 'Include your target keyword naturally throughout the content'
      });
    } else if (keywordDensity > 4) {
      recommendations.push('Reduce keyword density to avoid over-optimization');
      issues.push({
        type: 'warning',
        message: 'Keyword density is too high',
        fix: 'Use synonyms and related terms instead of repeating the same keyword'
      });
    }

    if (readabilityMetrics.readabilityScore < 50) {
      recommendations.push('Improve readability with shorter sentences and simpler words');
      issues.push({
        type: 'suggestion',
        message: 'Content readability could be improved',
        fix: 'Break up long sentences and use more common words'
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      readability: readabilityMetrics.readabilityScore,
      keywordDensity: Math.round(keywordDensity * 10) / 10,
      structure: structureScore,
      recommendations,
      issues
    };

  } catch (error) {
    console.error('SEO analysis error:', error);
    return {
      score: 0,
      readability: 0,
      keywordDensity: 0,
      structure: 0,
      recommendations: ['Analysis failed. Please try again.'],
      issues: [{ type: 'error', message: 'Analysis failed due to technical error' }]
    };
  }
}

export async function generateSeoRecommendations(analysis: SeoAnalysis): Promise<string[]> {
  const recommendations = [...analysis.recommendations];
  
  if (analysis.score < 60) {
    recommendations.push('Consider comprehensive content revision for better SEO performance');
  }
  
  return recommendations;
}
