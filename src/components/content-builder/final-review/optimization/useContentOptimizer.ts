
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from './types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';
import { detectAIContent } from '@/services/aiContentDetectionService';
import { analyzeSerpUsage, integrateSerpItems } from '@/services/serpIntegrationAnalyzer';
import { humanizeContent } from '@/services/aiContentDetectionService';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

export function useContentOptimizer(content: string) {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [contentSuggestions, setContentSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [solutionSuggestions, setSolutionSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [aiDetectionSuggestions, setAiDetectionSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [serpIntegrationSuggestions, setSerpIntegrationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [analyzedContent, setAnalyzedContent] = useState('');
  const [analyzedSolutionIntegration, setAnalyzedSolutionIntegration] = useState<any>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 100) {
      toast.error('Content too short for analysis');
      return;
    }

    setIsAnalyzing(true);
    setContentSuggestions([]);
    setSolutionSuggestions([]);
    setAiDetectionSuggestions([]);
    setSerpIntegrationSuggestions([]);
    
    try {
      // Analyze content quality
      const response = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: 'You are an expert content optimizer. Analyze content and provide specific optimization suggestions.'
          },
          {
            role: 'user',
            content: `Analyze this content and provide optimization suggestions:

CONTENT:
${content}

MAIN KEYWORD: ${state.mainKeyword || 'Not specified'}
SELECTED KEYWORDS: ${state.selectedKeywords?.join(', ') || 'None'}

Provide 3-5 specific, actionable suggestions to improve content quality, SEO, and engagement.

Respond in JSON format:
{
  "suggestions": [
    {
      "id": "unique_id",
      "title": "Suggestion Title",
      "description": "Detailed description of what to improve",
      "type": "content",
      "priority": "high|medium|low"
    }
  ]
}`
          }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const result = JSON.parse(response.choices[0].message.content);
        const suggestions = result.suggestions?.map((s: any) => ({
          ...s,
          type: 'content'
        })) || [];
        setContentSuggestions(suggestions);
      }

      // AI Content Detection
      const aiDetection = await detectAIContent(content);
      if (aiDetection?.isAIWritten && aiDetection.humanizationSuggestions.length > 0) {
        const aiSuggestions: OptimizationSuggestion[] = aiDetection.humanizationSuggestions.map((suggestion, index) => ({
          id: `ai_${index}`,
          title: 'Humanize AI Content',
          description: suggestion,
          type: 'humanization',
          priority: 'high'
        }));
        setAiDetectionSuggestions(aiSuggestions);
      }

      // SERP Integration Analysis
      const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
      if (selectedSerpItems.length > 0) {
        const serpAnalysis = await analyzeSerpUsage(content, selectedSerpItems);
        if (serpAnalysis && serpAnalysis.unusedItems.length > 0) {
          const serpSuggestions: OptimizationSuggestion[] = serpAnalysis.integrationSuggestions.map((suggestion, index) => ({
            id: `serp_${index}`,
            title: 'Integrate SERP Items',
            description: suggestion,
            type: 'serp_integration',
            priority: 'medium'
          }));
          setSerpIntegrationSuggestions(serpSuggestions);
        }
      }

      // Solution Integration Analysis (existing logic)
      if (state.selectedSolution) {
        // Analyze solution integration
        const solutionMetrics = analyzeSolutionIntegration(content, state.selectedSolution);
        setAnalyzedSolutionIntegration(solutionMetrics);
        
        // Generate suggestions based on the solution metrics
        const solutionResult = await sendChatRequest('openai', {
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert in product integration for content marketing. Analyze the content and suggest improvements for better product integration.' 
            },
            { 
              role: 'user', 
              content: `
                Analyze how well this solution "${state.selectedSolution.name}" is integrated into the content.
                
                Solution details:
                - Name: ${state.selectedSolution.name}
                - Features: ${state.selectedSolution.features.join(', ')}
                ${state.selectedSolution.painPoints ? `- Pain points: ${state.selectedSolution.painPoints.join(', ')}` : ''}
                ${state.selectedSolution.targetAudience ? `- Target audience: ${state.selectedSolution.targetAudience.join(', ')}` : ''}
                
                Current integration metrics:
                - Feature incorporation: ${solutionMetrics.featureIncorporation}%
                - Name mentions: ${solutionMetrics.nameMentions}
                - Positioning score: ${solutionMetrics.positioningScore}%
                - Pain points addressed: ${solutionMetrics.painPointsAddressed}%
                - Audience alignment: ${solutionMetrics.audienceAlignment}%
                - Mentioned features: ${solutionMetrics.mentionedFeatures.join(', ') || 'None'}
                
                Content:
                ${content}
                
                Return JSON with an array of specific improvement suggestions. Each suggestion should have:
                1. id: a unique string
                2. type: always "solution"
                3. title: short title for the suggestion
                4. description: detailed description of what to improve
                5. priority: "high", "medium", or "low"
                
                Format: { "suggestions": [...] }
              `
            }
          ]
        });
        
        // Extract and parse solution suggestions
        const solutionAnalysisText = solutionResult?.choices?.[0]?.message?.content || '';
        let solutionAnalysisData = null;
        
        try {
          // Extract JSON from the potential text response
          const jsonMatch = solutionAnalysisText.match(/{[\s\S]*}/);
          if (jsonMatch) {
            solutionAnalysisData = JSON.parse(jsonMatch[0]);
          }
        } catch (error) {
          console.error('Error parsing solution analysis result:', error);
        }
        
        if (solutionAnalysisData?.suggestions) {
          setSolutionSuggestions(solutionAnalysisData.suggestions);
          
          // Pre-select high priority solution suggestions
          const highPrioritySolutionSuggestions = solutionAnalysisData.suggestions
            .filter((s: OptimizationSuggestion) => s.priority === 'high')
            .map((s: OptimizationSuggestion) => s.id);
          
          setSelectedSuggestions(prevSelected => [
            ...prevSelected,
            ...highPrioritySolutionSuggestions
          ]);
        }
      }
      
      setAnalyzedContent(content);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, state.mainKeyword, state.selectedKeywords, state.serpSelections, state.selectedSolution]);

  const optimizeContent = useCallback(async () => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion');
      return null;
    }

    setIsOptimizing(true);
    try {
      let optimizedContent = content;

      // Get selected suggestions by type
      const selectedContentSuggestions = contentSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedAISuggestions = aiDetectionSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSerpSuggestions = serpIntegrationSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSolutionSuggestions = solutionSuggestions.filter(s => selectedSuggestions.includes(s.id));

      // Apply AI humanization if selected
      if (selectedAISuggestions.length > 0) {
        const humanizationSuggestions = selectedAISuggestions.map(s => s.description);
        const humanizedContent = await humanizeContent(optimizedContent, humanizationSuggestions);
        if (humanizedContent) {
          optimizedContent = humanizedContent;
        }
      }

      // Apply SERP integration if selected
      if (selectedSerpSuggestions.length > 0) {
        const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
        const serpAnalysis = await analyzeSerpUsage(optimizedContent, selectedSerpItems);
        if (serpAnalysis && serpAnalysis.unusedItems.length > 0) {
          const integratedContent = await integrateSerpItems(
            optimizedContent, 
            serpAnalysis.unusedItems, 
            serpAnalysis.integrationSuggestions
          );
          if (integratedContent) {
            optimizedContent = integratedContent;
          }
        }
      }

      // Apply content and solution suggestions using comprehensive prompt
      if (selectedContentSuggestions.length > 0 || selectedSolutionSuggestions.length > 0) {
        const allSelectedSuggestions = [...selectedContentSuggestions, ...selectedSolutionSuggestions];
        const suggestionPrompts = allSelectedSuggestions.map(s => `- ${s.title}: ${s.description}`).join('\n');

        const response = await sendChatRequest('openai', {
          messages: [
            {
              role: 'system',
              content: 'You are an expert content optimizer. Apply the specified suggestions to improve the content while maintaining its structure and core message.'
            },
            {
              role: 'user',
              content: `Apply these optimization suggestions to the content:

SUGGESTIONS TO APPLY:
${suggestionPrompts}

CURRENT CONTENT:
${optimizedContent}

CONTEXT:
- Main Keyword: ${state.mainKeyword || 'Not specified'}
- Selected Keywords: ${state.selectedKeywords?.join(', ') || 'None'}
- Solution: ${state.selectedSolution?.name || 'None'}

Rewrite the content implementing all the suggestions while maintaining the same structure and key information.`
            }
          ]
        });

        if (response?.choices?.[0]?.message?.content) {
          optimizedContent = response.choices[0].message.content;
        }
      }

      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedSuggestions, content, contentSuggestions, aiDetectionSuggestions, serpIntegrationSuggestions, solutionSuggestions, state]);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const incorporateAllSerpItems = useCallback(() => {
    // Add all SERP integration suggestions to selected
    const serpSuggestionIds = serpIntegrationSuggestions.map(s => s.id);
    setSelectedSuggestions(prev => {
      const newSelections = [...prev];
      serpSuggestionIds.forEach(id => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      return newSelections;
    });
    
    toast.success('All SERP integration suggestions selected');
  }, [serpIntegrationSuggestions]);

  return {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    analyzedContent,
    analyzedSolutionIntegration,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
  };
}
