
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { toast } from 'sonner';
import { humanizeContent } from '@/services/aiContentDetectionService';
import { analyzeSerpUsage, integrateSerpItems } from '@/services/serpIntegrationAnalyzer';
import { OptimizationSuggestion } from '../types';
import { logOptimizationActivity, generateOptimizationReasoning, generateOptimizationSessionId } from '@/services/contentOptimizationService';

export function useContentOptimization() {
  const { state } = useContentBuilder();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeContent = useCallback(async (
    content: string,
    selectedSuggestions: string[],
    contentSuggestions: OptimizationSuggestion[],
    aiDetectionSuggestions: OptimizationSuggestion[],
    serpIntegrationSuggestions: OptimizationSuggestion[],
    solutionSuggestions: OptimizationSuggestion[]
  ) => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion');
      return null;
    }

    const sessionId = generateOptimizationSessionId();
    const originalLength = content.length;
    const startTime = Date.now();
    
    setIsOptimizing(true);
    try {
      // Get selected suggestions by type
      const selectedContentSuggestions = contentSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedAISuggestions = aiDetectionSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSerpSuggestions = serpIntegrationSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSolutionSuggestions = solutionSuggestions.filter(s => selectedSuggestions.includes(s.id));

      let optimizedContent = content;
      const appliedSuggestions: OptimizationSuggestion[] = [];

      // Phase 1: Apply AI humanization if selected
      if (selectedAISuggestions.length > 0) {
        const humanizationSuggestions = selectedAISuggestions.map(s => s.description);
        const humanizedContent = await humanizeContent(optimizedContent, humanizationSuggestions);
        if (humanizedContent && validateContentChange(optimizedContent, humanizedContent)) {
          optimizedContent = humanizedContent;
          appliedSuggestions.push(...selectedAISuggestions);
        }
      }

      // Phase 2: Apply SERP integration if selected
      if (selectedSerpSuggestions.length > 0) {
        const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
        const serpAnalysis = await analyzeSerpUsage(optimizedContent, selectedSerpItems);
        if (serpAnalysis && serpAnalysis.unusedItems.length > 0) {
          const integratedContent = await integrateSerpItems(
            optimizedContent, 
            serpAnalysis.unusedItems, 
            serpAnalysis.integrationSuggestions
          );
          if (integratedContent && validateContentChange(optimizedContent, integratedContent)) {
            optimizedContent = integratedContent;
            appliedSuggestions.push(...selectedSerpSuggestions);
          }
        }
      }

      // Phase 3: Apply content and solution suggestions with enhanced prompts
      if (selectedContentSuggestions.length > 0 || selectedSolutionSuggestions.length > 0) {
        const allSelectedSuggestions = [...selectedContentSuggestions, ...selectedSolutionSuggestions];
        optimizedContent = await applySpecificOptimizations(
          optimizedContent, 
          allSelectedSuggestions, 
          state
        );
        appliedSuggestions.push(...allSelectedSuggestions);
      }

      // Validate that meaningful changes were made
      if (!validateContentChange(content, optimizedContent)) {
        toast.error('No meaningful changes were applied. Try selecting different suggestions.');
        return null;
      }

      // Generate optimization reasoning
      const reasoning = generateOptimizationReasoning(
        appliedSuggestions, 
        content, 
        {
          tone: 'professional',
          audience: 'general',
          seoFocus: 'moderate',
          contentLength: 'maintain',
          creativity: 0.6,
          preserveStructure: true,
          includeExamples: false,
          enhanceReadability: true,
          customInstructions: ''
        }
      );

      // Log optimization activity
      const optimizedLength = optimizedContent.length;
      const processingTime = Date.now() - startTime;
      
      await logOptimizationActivity(
        null, // contentId - we don't have this in the current state
        sessionId,
        originalLength,
        appliedSuggestions,
        appliedSuggestions,
        [],
        reasoning,
        {
          tone: 'professional',
          audience: 'general',
          seoFocus: 'moderate',
          contentLength: 'maintain',
          creativity: 0.6,
          preserveStructure: true,
          includeExamples: false,
          enhanceReadability: true,
          customInstructions: ''
        },
        true,
        optimizedLength,
        {
          processingTimeMs: processingTime,
          suggestionCount: appliedSuggestions.length,
          contentChangePercentage: Math.round(((optimizedLength - originalLength) / originalLength) * 100),
          mainKeyword: state.mainKeyword,
          selectedKeywords: state.selectedKeywords,
          solution: state.selectedSolution?.name
        }
      );

      toast.success(`Content optimized successfully! Applied ${appliedSuggestions.length} improvements.`);
      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content');
      
      // Log failed optimization
      await logOptimizationActivity(
        null, // contentId - we don't have this in the current state
        sessionId,
        originalLength,
        [...contentSuggestions, ...aiDetectionSuggestions, ...serpIntegrationSuggestions, ...solutionSuggestions].filter(s => selectedSuggestions.includes(s.id)),
        [],
        [],
        {},
        {
          tone: 'professional',
          audience: 'general',
          seoFocus: 'moderate',
          contentLength: 'maintain',
          creativity: 0.6,
          preserveStructure: true,
          includeExamples: false,
          enhanceReadability: true,
          customInstructions: ''
        },
        false,
        undefined,
        { 
          processingTimeMs: Date.now() - startTime, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      );
      
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [state]);

  // Validate that content has meaningful changes
  const validateContentChange = (original: string, optimized: string): boolean => {
    if (original === optimized) return false;
    
    // Check if at least 5% of content changed
    const similarity = calculateSimilarity(original, optimized);
    return similarity < 0.95;
  };

  // Calculate similarity between two texts
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  // Apply specific optimizations based on suggestion type
  const applySpecificOptimizations = async (
    content: string,
    suggestions: OptimizationSuggestion[],
    contextState: any
  ): Promise<string> => {
    // Group suggestions by category for more targeted optimization
    const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
      const category = suggestion.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(suggestion);
      return groups;
    }, {} as Record<string, OptimizationSuggestion[]>);

    let optimizedContent = content;

    // Apply optimizations by category with specific prompts
    for (const [category, categorySuggestions] of Object.entries(groupedSuggestions)) {
      const categoryPrompt = getCategorySpecificPrompt(category, categorySuggestions, contextState);
      
      const response = await AIServiceController.generate({
        input: categoryPrompt.replace('{{CONTENT}}', optimizedContent),
        use_case: 'content_generation',
        temperature: 0.5,
        max_tokens: 3000
      });

      if (response?.content && validateContentChange(optimizedContent, response.content)) {
        optimizedContent = response.content;
      }
    }

    return optimizedContent;
  };

  // Get category-specific optimization prompts
  const getCategorySpecificPrompt = (
    category: string, 
    suggestions: OptimizationSuggestion[], 
    contextState: any
  ): string => {
    const suggestionDetails = suggestions.map(s => 
      `• ${s.title}: ${s.description} (Priority: ${s.priority}, Impact: ${s.impact})`
    ).join('\n');

    const baseContext = `
CONTEXT:
- Main Keyword: ${contextState.mainKeyword || 'Not specified'}
- Target Keywords: ${contextState.selectedKeywords?.join(', ') || 'None'}
- Solution/Product: ${contextState.selectedSolution?.name || 'None'}
`;

    switch (category) {
      case 'structure':
        return `You are an expert content structuring specialist. Improve the structure and organization of this content:

${baseContext}

SPECIFIC IMPROVEMENTS TO MAKE:
${suggestionDetails}

CURRENT CONTENT:
{{CONTENT}}

INSTRUCTIONS:
1. Restructure headings and subheadings for better flow
2. Improve paragraph organization and transitions
3. Add bullet points, lists, or formatting where beneficial
4. Ensure logical content progression
5. Maintain all original information while improving readability

Return the restructured content with clear improvements:`;

      case 'seo':
        return `You are an SEO optimization expert. Enhance this content for better search engine performance:

${baseContext}

SPECIFIC SEO IMPROVEMENTS TO MAKE:
${suggestionDetails}

CURRENT CONTENT:
{{CONTENT}}

INSTRUCTIONS:
1. Naturally integrate target keywords without keyword stuffing
2. Improve meta-relevant elements (title tags, descriptions)
3. Add semantic keywords and related terms
4. Optimize headings (H1, H2, H3) for SEO
5. Improve internal linking opportunities
6. Ensure keyword density is optimal (1-3% for main keyword)

Return the SEO-optimized content:`;

      case 'keywords':
        return `You are a keyword optimization specialist. Improve keyword integration and density in this content:

${baseContext}

SPECIFIC KEYWORD IMPROVEMENTS TO MAKE:
${suggestionDetails}

CURRENT CONTENT:
{{CONTENT}}

INSTRUCTIONS:
1. Naturally integrate the main keyword "${contextState.mainKeyword}" throughout the content
2. Add related keywords and semantic variations
3. Improve keyword placement in strategic positions (headings, first paragraph, conclusion)
4. Maintain natural language flow while optimizing keyword usage
5. Add long-tail keyword variations where relevant

Return the keyword-optimized content:`;

      case 'solution':
        return `You are a solution integration expert. Better integrate the company's solution/product into this content:

${baseContext}

SPECIFIC SOLUTION IMPROVEMENTS TO MAKE:
${suggestionDetails}

CURRENT CONTENT:
{{CONTENT}}

INSTRUCTIONS:
1. Naturally mention and integrate "${contextState.selectedSolution?.name}" where relevant
2. Add use cases, benefits, or examples related to the solution
3. Include subtle calls-to-action or solution positioning
4. Demonstrate how the solution solves problems mentioned in the content
5. Maintain editorial balance - don't make it overly promotional

Return the solution-integrated content:`;

      case 'content':
      default:
        return `You are a content optimization expert. Improve the overall quality and engagement of this content:

${baseContext}

SPECIFIC CONTENT IMPROVEMENTS TO MAKE:
${suggestionDetails}

CURRENT CONTENT:
{{CONTENT}}

INSTRUCTIONS:
1. Enhance readability and engagement
2. Add examples, case studies, or practical applications where relevant
3. Improve sentence variety and flow
4. Strengthen conclusions and takeaways
5. Add actionable insights or tips
6. Ensure the content provides clear value to readers

Return the improved content:`;
    }
  };

  return {
    isOptimizing,
    optimizeContent
  };
}
