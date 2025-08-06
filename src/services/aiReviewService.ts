
import { ContentItemType } from '@/contexts/content/types';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

export interface AIReviewAnalysis {
  overallScore: number; // 0-100
  qualityScore: number;
  seoScore: number;
  brandComplianceScore: number;
  readabilityScore: number;
  recommendation: 'approve' | 'needs_minor_changes' | 'needs_major_changes' | 'reject';
  issues: AIReviewIssue[];
  suggestions: AIReviewSuggestion[];
  summary: string;
}

export interface AIReviewIssue {
  id: string;
  type: 'critical' | 'major' | 'minor';
  category: 'seo' | 'brand' | 'quality' | 'compliance' | 'readability';
  title: string;
  description: string;
  location?: string; // Section or paragraph where the issue was found
  autoFixable: boolean;
}

export interface AIReviewSuggestion {
  id: string;
  type: 'improvement' | 'enhancement' | 'optimization';
  category: 'seo' | 'brand' | 'quality' | 'engagement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

/**
 * Analyze content using AI for review assistance
 */
export async function analyzeContentForReview(
  content: ContentItemType,
  provider: AiProvider = 'openai'
): Promise<AIReviewAnalysis | null> {
  try {
    console.log('Starting AI review analysis for content:', content.id);
    
    const analysisPrompt = createReviewAnalysisPrompt(content);
    
    const response = await AIServiceController.generate({
      input: analysisPrompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 2000
    });

    if (!response?.content) {
      throw new Error('No response from AI service');
    }

    const analysisText = response.content;
    return parseAIAnalysisResponse(analysisText, content);
    
  } catch (error) {
    console.error('Error in AI review analysis:', error);
    toast.error('AI review analysis failed. Please try again.');
    return null;
  }
}

/**
 * Create a comprehensive prompt for AI content analysis
 */
function createReviewAnalysisPrompt(content: ContentItemType): string {
  const wordCount = content.content ? content.content.split(/\s+/).length : 0;
  const keywords = content.keywords?.join(', ') || 'None specified';
  
  return `Please analyze this content for review approval. Provide a detailed assessment in JSON format.

CONTENT TO ANALYZE:
Title: ${content.title}
Content: ${content.content || 'No content provided'}
Keywords: ${keywords}
SEO Score: ${content.seo_score || 0}
Word Count: ${wordCount}
Status: ${content.status}
Metadata: ${JSON.stringify(content.metadata || {})}

ANALYSIS REQUIREMENTS:
1. Evaluate content quality (0-100 score)
2. Assess SEO optimization (0-100 score)
3. Check brand compliance (0-100 score)
4. Analyze readability (0-100 score)
5. Calculate overall score (0-100)
6. Provide recommendation: "approve", "needs_minor_changes", "needs_major_changes", or "reject"
7. List specific issues (critical/major/minor)
8. Suggest improvements
9. Provide executive summary

Please respond in this exact JSON format:
{
  "overallScore": 85,
  "qualityScore": 80,
  "seoScore": 90,
  "brandComplianceScore": 85,
  "readabilityScore": 75,
  "recommendation": "approve",
  "issues": [
    {
      "id": "seo_1",
      "type": "minor",
      "category": "seo",
      "title": "Missing meta description",
      "description": "The content lacks a meta description which is important for SEO",
      "location": "metadata",
      "autoFixable": true
    }
  ],
  "suggestions": [
    {
      "id": "quality_1",
      "type": "improvement",
      "category": "quality",
      "title": "Add more examples",
      "description": "Including practical examples would improve reader engagement",
      "impact": "medium",
      "effort": "low"
    }
  ],
  "summary": "Overall good content with minor SEO improvements needed. Ready for approval with suggested enhancements."
}`;
}

/**
 * Parse AI response and convert to structured analysis
 */
function parseAIAnalysisResponse(analysisText: string, content: ContentItemType): AIReviewAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure all required fields exist
    return {
      overallScore: Math.max(0, Math.min(100, parsed.overallScore || 50)),
      qualityScore: Math.max(0, Math.min(100, parsed.qualityScore || 50)),
      seoScore: Math.max(0, Math.min(100, parsed.seoScore || 50)),
      brandComplianceScore: Math.max(0, Math.min(100, parsed.brandComplianceScore || 50)),
      readabilityScore: Math.max(0, Math.min(100, parsed.readabilityScore || 50)),
      recommendation: ['approve', 'needs_minor_changes', 'needs_major_changes', 'reject'].includes(parsed.recommendation) 
        ? parsed.recommendation 
        : 'needs_minor_changes',
      issues: Array.isArray(parsed.issues) ? parsed.issues.map((issue: any, index: number) => ({
        id: issue.id || `issue_${index}`,
        type: ['critical', 'major', 'minor'].includes(issue.type) ? issue.type : 'minor',
        category: ['seo', 'brand', 'quality', 'compliance', 'readability'].includes(issue.category) ? issue.category : 'quality',
        title: issue.title || 'Issue found',
        description: issue.description || 'No description provided',
        location: issue.location,
        autoFixable: Boolean(issue.autoFixable)
      })) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map((suggestion: any, index: number) => ({
        id: suggestion.id || `suggestion_${index}`,
        type: ['improvement', 'enhancement', 'optimization'].includes(suggestion.type) ? suggestion.type : 'improvement',
        category: ['seo', 'brand', 'quality', 'engagement'].includes(suggestion.category) ? suggestion.category : 'quality',
        title: suggestion.title || 'Suggestion',
        description: suggestion.description || 'No description provided',
        impact: ['high', 'medium', 'low'].includes(suggestion.impact) ? suggestion.impact : 'medium',
        effort: ['low', 'medium', 'high'].includes(suggestion.effort) ? suggestion.effort : 'medium'
      })) : [],
      summary: parsed.summary || 'Analysis completed.'
    };
  } catch (error) {
    console.error('Error parsing AI analysis response:', error);
    
    // Fallback analysis if parsing fails
    return {
      overallScore: 60,
      qualityScore: 60,
      seoScore: 60,
      brandComplianceScore: 60,
      readabilityScore: 60,
      recommendation: 'needs_minor_changes',
      issues: [{
        id: 'parse_error',
        type: 'minor',
        category: 'quality',
        title: 'Analysis parsing failed',
        description: 'Unable to parse AI analysis response completely',
        autoFixable: false
      }],
      suggestions: [],
      summary: 'Basic analysis completed. Manual review recommended.'
    };
  }
}

/**
 * Generate smart approval recommendation based on analysis
 */
export function generateApprovalRecommendation(analysis: AIReviewAnalysis): {
  action: 'approve' | 'request_changes' | 'reject';
  confidence: number;
  reasoning: string;
} {
  const criticalIssues = analysis.issues.filter(issue => issue.type === 'critical').length;
  const majorIssues = analysis.issues.filter(issue => issue.type === 'major').length;
  
  // Decision logic based on scores and issues
  if (criticalIssues > 0) {
    return {
      action: 'reject',
      confidence: 90,
      reasoning: `Content has ${criticalIssues} critical issue(s) that require significant revision.`
    };
  }
  
  if (analysis.overallScore >= 85 && majorIssues === 0) {
    return {
      action: 'approve',
      confidence: Math.min(95, analysis.overallScore),
      reasoning: 'Content meets quality standards with minimal issues.'
    };
  }
  
  if (analysis.overallScore >= 70 || majorIssues <= 2) {
    return {
      action: 'request_changes',
      confidence: 80,
      reasoning: `Content is good but needs ${majorIssues} major improvement(s) to meet standards.`
    };
  }
  
  return {
    action: 'reject',
    confidence: 75,
    reasoning: 'Content requires substantial improvements before approval.'
  };
}
