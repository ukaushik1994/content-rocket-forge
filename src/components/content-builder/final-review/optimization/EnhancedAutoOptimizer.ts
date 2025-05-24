
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { SerpSelection } from '@/contexts/content-builder/types';
import { analyzeContentHumanization, humanizeContent, HumanizationIssue } from '@/services/contentHumanizerService';
import { analyzeSerpUsage, SerpUsageAnalysis } from '@/services/serpIntegrationAnalyzer';

export interface EnhancedOptimizationSuggestion {
  id: string;
  type: 'humanization' | 'serp_integration' | 'keyword_optimization' | 'structure' | 'readability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  autoFixable: boolean;
  data?: any;
}

export interface EnhancedOptimizationResult {
  humanizationSuggestions: EnhancedOptimizationSuggestion[];
  serpIntegrationSuggestions: EnhancedOptimizationSuggestion[];
  contentSuggestions: EnhancedOptimizationSuggestion[];
  humanizationAnalysis: any;
  serpUsageAnalysis: SerpUsageAnalysis;
}

export const analyzeContentForEnhancedOptimization = async (
  content: string,
  serpSelections: SerpSelection[] = [],
  keywords: string[] = [],
  aiProvider: AiProvider = 'openai'
): Promise<EnhancedOptimizationResult> => {
  // Analyze content humanization
  const humanizationAnalysis = await analyzeContentHumanization(content, aiProvider);
  
  // Analyze SERP usage
  const serpUsageAnalysis = analyzeSerpUsage(content, serpSelections);
  
  // Generate humanization suggestions
  const humanizationSuggestions = generateHumanizationSuggestions(humanizationAnalysis);
  
  // Generate SERP integration suggestions
  const serpIntegrationSuggestions = generateSerpIntegrationSuggestions(serpUsageAnalysis);
  
  // Generate general content suggestions
  const contentSuggestions = await generateContentSuggestions(content, keywords, aiProvider);
  
  return {
    humanizationSuggestions,
    serpIntegrationSuggestions,
    contentSuggestions,
    humanizationAnalysis,
    serpUsageAnalysis
  };
};

const generateHumanizationSuggestions = (analysis: any): EnhancedOptimizationSuggestion[] => {
  if (!analysis) return [];
  
  const suggestions: EnhancedOptimizationSuggestion[] = [];
  
  if (analysis.isAiGenerated && analysis.confidence > 70) {
    suggestions.push({
      id: 'ai-detection',
      type: 'humanization',
      priority: 'high',
      title: 'AI-Generated Content Detected',
      description: `Content appears to be AI-generated with ${analysis.confidence}% confidence. Human score: ${analysis.humanizationScore}/100`,
      impact: 'Improves authenticity and reader engagement',
      autoFixable: true,
      data: { issues: analysis.issues }
    });
  }
  
  if (analysis.humanizationScore < 60) {
    const highSeverityIssues = analysis.issues?.filter((issue: HumanizationIssue) => issue.severity === 'high') || [];
    if (highSeverityIssues.length > 0) {
      suggestions.push({
        id: 'humanization-critical',
        type: 'humanization',
        priority: 'high',
        title: 'Critical Humanization Issues',
        description: `${highSeverityIssues.length} critical issues affecting content authenticity`,
        impact: 'Significantly improves reader connection and trust',
        autoFixable: true,
        data: { issues: highSeverityIssues }
      });
    }
  }
  
  return suggestions;
};

const generateSerpIntegrationSuggestions = (analysis: SerpUsageAnalysis): EnhancedOptimizationSuggestion[] => {
  const suggestions: EnhancedOptimizationSuggestion[] = [];
  
  if (analysis.totalSelected > 0 && analysis.usagePercentage < 50) {
    suggestions.push({
      id: 'serp-low-usage',
      type: 'serp_integration',
      priority: 'high',
      title: 'Low SERP Integration',
      description: `Only ${analysis.usagePercentage}% of selected SERP items are used (${analysis.totalUsed}/${analysis.totalSelected})`,
      impact: 'Better SERP integration improves search visibility and relevance',
      autoFixable: true,
      data: { unusedItems: analysis.unusedItems, suggestions: analysis.suggestions }
    });
  }
  
  if (analysis.byType.questions.selected > 0 && analysis.byType.questions.percentage < 70) {
    suggestions.push({
      id: 'serp-questions',
      type: 'serp_integration',
      priority: 'medium',
      title: 'Unused SERP Questions',
      description: `${analysis.byType.questions.selected - analysis.byType.questions.used} selected questions not addressed`,
      impact: 'Addressing user questions improves content completeness',
      autoFixable: true,
      data: { type: 'questions' }
    });
  }
  
  return suggestions;
};

const generateContentSuggestions = async (
  content: string,
  keywords: string[],
  aiProvider: AiProvider
): Promise<EnhancedOptimizationSuggestion[]> => {
  // Basic content analysis suggestions
  const suggestions: EnhancedOptimizationSuggestion[] = [];
  
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    suggestions.push({
      id: 'content-length',
      type: 'structure',
      priority: 'medium',
      title: 'Content Too Short',
      description: `Content is only ${wordCount} words. Consider expanding for better depth.`,
      impact: 'Longer content typically performs better in search results',
      autoFixable: false
    });
  }
  
  return suggestions;
};

export const applyEnhancedOptimizations = async (
  content: string,
  selectedSuggestions: string[],
  optimizationData: EnhancedOptimizationResult,
  serpSelections: SerpSelection[] = [],
  keywords: string[] = [],
  aiProvider: AiProvider = 'openai'
): Promise<string | null> => {
  let optimizedContent = content;
  
  try {
    // Apply humanization if selected
    const humanizationSuggestions = optimizationData.humanizationSuggestions.filter(s => 
      selectedSuggestions.includes(s.id)
    );
    
    if (humanizationSuggestions.length > 0 && optimizationData.humanizationAnalysis?.issues) {
      const humanizedContent = await humanizeContent(
        optimizedContent, 
        optimizationData.humanizationAnalysis.issues,
        aiProvider
      );
      if (humanizedContent) {
        optimizedContent = humanizedContent;
      }
    }
    
    // Apply SERP integration if selected
    const serpSuggestions = optimizationData.serpIntegrationSuggestions.filter(s => 
      selectedSuggestions.includes(s.id)
    );
    
    if (serpSuggestions.length > 0 && optimizationData.serpUsageAnalysis.unusedItems.length > 0) {
      const serpIntegratedContent = await integrateSerpItems(
        optimizedContent,
        optimizationData.serpUsageAnalysis.unusedItems,
        keywords,
        aiProvider
      );
      if (serpIntegratedContent) {
        optimizedContent = serpIntegratedContent;
      }
    }
    
    return optimizedContent;
  } catch (error) {
    console.error('Error applying enhanced optimizations:', error);
    return null;
  }
};

const integrateSerpItems = async (
  content: string,
  unusedItems: SerpSelection[],
  keywords: string[],
  aiProvider: AiProvider
): Promise<string | null> => {
  if (unusedItems.length === 0) return content;
  
  try {
    const itemsToIntegrate = unusedItems.slice(0, 5); // Limit to avoid overwhelming the content
    
    const itemsList = itemsToIntegrate.map(item => 
      `- ${item.type}: "${item.content}"${item.source ? ` (from ${item.source})` : ''}`
    ).join('\n');
    
    const keywordsList = keywords.join(', ');
    
    const prompt = `Please integrate these SERP elements naturally into the content while maintaining its flow and readability:

SERP Items to Integrate:
${itemsList}

Target Keywords: ${keywordsList}

Current Content:
"${content}"

Instructions:
1. Integrate the SERP items naturally within the existing content structure
2. Don't add new major sections unless absolutely necessary
3. Use questions to create subheadings or FAQ sections
4. Incorporate entities and concepts naturally in the text
5. Use headings to improve content structure
6. Maintain the original tone and style
7. Ensure keywords are naturally distributed
8. Keep the content length similar (within 20% of original)

Return only the optimized content with integrated SERP items.`;

    const response = await sendChatRequest(aiProvider, {
      messages: [
        { role: 'system', content: 'You are an expert SEO content optimizer specializing in natural SERP integration while maintaining content quality and readability.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI service');
    }

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error integrating SERP items:', error);
    return null;
  }
};
