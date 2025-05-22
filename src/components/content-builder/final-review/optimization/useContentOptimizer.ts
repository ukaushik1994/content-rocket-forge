
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { getImprovementType, getRewriteInstructions } from '@/utils/seo/contentRewriter';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';
import { OptimizationSuggestion } from './types';

export function useContentOptimizer(content: string) {
  const { state } = useContentBuilder();
  const { selectedSolution, mainKeyword, selectedKeywords } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [contentSuggestions, setContentSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [solutionSuggestions, setSolutionSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analyzedContent, setAnalyzedContent] = useState<any>(null);
  const [analyzedSolutionIntegration, setAnalyzedSolutionIntegration] = useState<any>(null);

  const analyzeContent = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Generate content quality suggestions
      const contentResult = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content analyzer. Analyze the following content and suggest specific improvements.' 
          },
          { 
            role: 'user', 
            content: `
              Analyze this content for quality, readability, and SEO optimization. The main keyword is "${mainKeyword}" and secondary keywords are ${selectedKeywords.join(', ')}.
              
              Content to analyze:
              ${content}
              
              Return JSON with an array of specific improvement suggestions. Each suggestion should have:
              1. id: a unique string
              2. type: always "content"
              3. title: short title for the suggestion
              4. description: detailed description of what to improve
              5. priority: "high", "medium", or "low"
              
              Format: { "suggestions": [...] }
            `
          }
        ]
      });
      
      // Extract and parse suggestions
      const contentAnalysisText = contentResult?.choices?.[0]?.message?.content || '';
      let contentAnalysisData = null;
      
      try {
        // Extract JSON from the potential text response
        const jsonMatch = contentAnalysisText.match(/{[\s\S]*}/);
        if (jsonMatch) {
          contentAnalysisData = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parsing content analysis result:', error);
      }
      
      setAnalyzedContent(contentAnalysisData);
      
      if (contentAnalysisData?.suggestions) {
        setContentSuggestions(contentAnalysisData.suggestions);
        
        // Pre-select high priority suggestions
        const highPrioritySuggestions = contentAnalysisData.suggestions
          .filter((s: OptimizationSuggestion) => s.priority === 'high')
          .map((s: OptimizationSuggestion) => s.id);
        
        setSelectedSuggestions(highPrioritySuggestions);
      }
      
      // Generate solution integration suggestions if a solution is selected
      if (selectedSolution) {
        // Analyze solution integration
        const solutionMetrics = analyzeSolutionIntegration(content, selectedSolution);
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
                Analyze how well this solution "${selectedSolution.name}" is integrated into the content.
                
                Solution details:
                - Name: ${selectedSolution.name}
                - Features: ${selectedSolution.features.join(', ')}
                ${selectedSolution.painPoints ? `- Pain points: ${selectedSolution.painPoints.join(', ')}` : ''}
                ${selectedSolution.targetAudience ? `- Target audience: ${selectedSolution.targetAudience.join(', ')}` : ''}
                
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
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, mainKeyword, selectedKeywords, selectedSolution]);

  const toggleSuggestion = useCallback((id: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(id) 
        ? prev.filter(suggestionId => suggestionId !== id)
        : [...prev, id]
    );
  }, []);

  const optimizeContent = useCallback(async (): Promise<string | null> => {
    if (selectedSuggestions.length === 0) return null;
    
    setIsOptimizing(true);
    
    try {
      // Combine all selected suggestions
      const allSuggestions = [...contentSuggestions, ...solutionSuggestions];
      const selectedSuggestionDetails = allSuggestions.filter(s => selectedSuggestions.includes(s.id));
      
      // Create a comprehensive optimization prompt
      const optimizationPrompt = `
        Optimize this content by implementing these specific suggestions:
        
        ${selectedSuggestionDetails.map((s, i) => `
        ${i + 1}. ${s.title}: ${s.description}
        `).join('\n')}
        
        Main keyword: ${mainKeyword}
        Secondary keywords: ${selectedKeywords.join(', ')}
        
        ${selectedSolution ? `
        Solution to integrate:
        - Name: ${selectedSolution.name}
        - Features: ${selectedSolution.features.join(', ')}
        ${selectedSolution.painPoints ? `- Pain points: ${selectedSolution.painPoints.join(', ')}` : ''}
        ${selectedSolution.targetAudience ? `- Target audience: ${selectedSolution.targetAudience.join(', ')}` : ''}
        ` : ''}
        
        Original content:
        ${content}
        
        Instructions:
        1. Maintain the original structure and headings.
        2. Keep the content factually accurate.
        3. Implement ALL the suggestions listed above.
        4. Return ONLY the optimized content, not explanations.
        5. Use proper markdown formatting with headings.
      `;
      
      // Send the optimization request
      const result = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content optimizer. Rewrite content based on the specific suggestions provided while maintaining the original structure and factual accuracy.' 
          },
          { role: 'user', content: optimizationPrompt }
        ]
      });
      
      // Extract the optimized content
      const optimizedContent = result?.choices?.[0]?.message?.content || '';
      
      if (optimizedContent) {
        toast.success('Content optimized successfully!');
        return optimizedContent;
      } else {
        toast.error('Failed to optimize content. Please try again.');
        return null;
      }
      
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content. Please try again.');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [content, contentSuggestions, mainKeyword, selectedKeywords, selectedSolution, selectedSuggestions, solutionSuggestions]);

  return {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    analyzedContent,
    analyzedSolutionIntegration,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion
  };
}
