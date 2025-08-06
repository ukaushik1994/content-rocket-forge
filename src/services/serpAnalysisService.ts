
import AIServiceController from '@/services/aiService/AIServiceController';
import { AiProvider } from '@/services/aiService/types';

export interface SerpAnalysisResult {
  contentGaps: string[];
  competitorInsights: CompetitorInsight[];
  questionOpportunities: string[];
  entityMentions: string[];
  headingPatterns: string[];
  featuredSnippetOps: string[];
  keywordVariations: string[];
}

export interface CompetitorInsight {
  url: string;
  title: string;
  strengths: string[];
  weaknesses: string[];
  uniqueAngles: string[];
  wordCount?: number;
}

export interface ContentGapAnalysis {
  missingTopics: string[];
  shallowCoverage: string[];
  opportunityAreas: string[];
  differentiationPoints: string[];
}

/**
 * Perform advanced SERP analysis for content opportunities
 */
export async function analyzeSerpData(
  keyword: string,
  competitorData: any[],
  provider: AiProvider = 'openai'
): Promise<SerpAnalysisResult | null> {
  try {
    const analysisPrompt = createSerpAnalysisPrompt(keyword, competitorData);
    
    const response = await AIServiceController.generate({
      input: analysisPrompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 2000
    });

    if (!response?.content) {
      throw new Error('No response from SERP analysis');
    }

    return parseSerpAnalysisResponse(response.content);
    
  } catch (error) {
    console.error('Error in SERP analysis:', error);
    return null;
  }
}

function createSerpAnalysisPrompt(keyword: string, competitorData: any[]): string {
  const competitorSummary = competitorData.map((comp, index) => 
    `Competitor ${index + 1}: ${comp.title || 'Unknown Title'}\n` +
    `URL: ${comp.url || 'Unknown URL'}\n` +
    `Content Preview: ${comp.snippet || 'No snippet available'}\n` +
    `Word Count: ${comp.wordCount || 'Unknown'}\n\n`
  ).join('');

  return `Analyze the SERP landscape for the keyword "${keyword}" and provide strategic insights.

COMPETITOR DATA:
${competitorSummary}

ANALYSIS REQUIREMENTS:

1. CONTENT GAPS: Identify topics/angles that competitors are missing or covering superficially
2. COMPETITOR INSIGHTS: For each major competitor, identify their strengths, weaknesses, and unique angles
3. QUESTION OPPORTUNITIES: Based on content analysis, what questions should our content answer?
4. ENTITY MENTIONS: What key concepts, tools, or entities should be prominently featured?
5. HEADING PATTERNS: What heading structures are working well for top-ranking content?
6. FEATURED SNIPPET OPPORTUNITIES: What content formats could target featured snippets?
7. KEYWORD VARIATIONS: What related keywords and long-tail variations should be included?

Provide response in this JSON format:
{
  "contentGaps": ["Gap 1", "Gap 2"],
  "competitorInsights": [
    {
      "url": "example.com",
      "title": "Article Title",
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "uniqueAngles": ["Angle 1"],
      "wordCount": 2000
    }
  ],
  "questionOpportunities": ["Question 1", "Question 2"],
  "entityMentions": ["Entity 1", "Entity 2"],
  "headingPatterns": ["Pattern 1", "Pattern 2"],
  "featuredSnippetOps": ["Opportunity 1"],
  "keywordVariations": ["Variation 1", "Variation 2"]
}

Focus on actionable insights that can directly inform content strategy and creation.`;
}

function parseSerpAnalysisResponse(analysisText: string): SerpAnalysisResult {
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in SERP analysis response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : [],
      competitorInsights: Array.isArray(parsed.competitorInsights) ? parsed.competitorInsights.map((insight: any) => ({
        url: insight.url || '',
        title: insight.title || '',
        strengths: Array.isArray(insight.strengths) ? insight.strengths : [],
        weaknesses: Array.isArray(insight.weaknesses) ? insight.weaknesses : [],
        uniqueAngles: Array.isArray(insight.uniqueAngles) ? insight.uniqueAngles : [],
        wordCount: insight.wordCount || 0
      })) : [],
      questionOpportunities: Array.isArray(parsed.questionOpportunities) ? parsed.questionOpportunities : [],
      entityMentions: Array.isArray(parsed.entityMentions) ? parsed.entityMentions : [],
      headingPatterns: Array.isArray(parsed.headingPatterns) ? parsed.headingPatterns : [],
      featuredSnippetOps: Array.isArray(parsed.featuredSnippetOps) ? parsed.featuredSnippetOps : [],
      keywordVariations: Array.isArray(parsed.keywordVariations) ? parsed.keywordVariations : []
    };
  } catch (error) {
    console.error('Error parsing SERP analysis response:', error);
    return {
      contentGaps: [],
      competitorInsights: [],
      questionOpportunities: [],
      entityMentions: [],
      headingPatterns: [],
      featuredSnippetOps: [],
      keywordVariations: []
    };
  }
}

/**
 * Identify content gaps by comparing competitor content
 */
export async function identifyContentGaps(
  keyword: string,
  competitorContent: string[],
  provider: AiProvider = 'openai'
): Promise<ContentGapAnalysis | null> {
  try {
    const gapAnalysisPrompt = createContentGapPrompt(keyword, competitorContent);
    
    const response = await AIServiceController.generate({
      input: gapAnalysisPrompt,
      use_case: 'strategy',
      temperature: 0.4,
      max_tokens: 1500
    });

    if (!response?.content) {
      throw new Error('No response from content gap analysis');
    }

    return parseContentGapResponse(response.content);
    
  } catch (error) {
    console.error('Error in content gap analysis:', error);
    return null;
  }
}

function createContentGapPrompt(keyword: string, competitorContent: string[]): string {
  const contentSummary = competitorContent.map((content, index) => 
    `Competitor ${index + 1} Content:\n${content.substring(0, 500)}...\n\n`
  ).join('');

  return `Analyze competitor content for "${keyword}" and identify content gaps and opportunities.

COMPETITOR CONTENT SAMPLES:
${contentSummary}

IDENTIFY:
1. MISSING TOPICS: What important subtopics are competitors not covering?
2. SHALLOW COVERAGE: What topics are mentioned but not explained in depth?
3. OPPORTUNITY AREAS: Where can we provide more value than competitors?
4. DIFFERENTIATION POINTS: How can we approach this topic uniquely?

Respond in JSON format:
{
  "missingTopics": ["Topic 1", "Topic 2"],
  "shallowCoverage": ["Topic A", "Topic B"],
  "opportunityAreas": ["Opportunity 1", "Opportunity 2"],
  "differentiationPoints": ["Angle 1", "Angle 2"]
}`;
}

function parseContentGapResponse(analysisText: string): ContentGapAnalysis {
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in content gap response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      missingTopics: Array.isArray(parsed.missingTopics) ? parsed.missingTopics : [],
      shallowCoverage: Array.isArray(parsed.shallowCoverage) ? parsed.shallowCoverage : [],
      opportunityAreas: Array.isArray(parsed.opportunityAreas) ? parsed.opportunityAreas : [],
      differentiationPoints: Array.isArray(parsed.differentiationPoints) ? parsed.differentiationPoints : []
    };
  } catch (error) {
    console.error('Error parsing content gap response:', error);
    return {
      missingTopics: [],
      shallowCoverage: [],
      opportunityAreas: [],
      differentiationPoints: []
    };
  }
}
