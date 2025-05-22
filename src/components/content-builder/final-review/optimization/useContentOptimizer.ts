
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { getImprovementType, getRewriteInstructions } from '@/utils/seo/contentRewriter';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';
import { OptimizationSuggestion } from './types';

export function useContentOptimizer(content: string) {
  const { state } = useContentBuilder();
  const { 
    selectedSolution, 
    mainKeyword, 
    selectedKeywords,
    serpSelections
  } = state;
  
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
      // Extract selected items from SERP for optimization context
      const selectedSerpItems = serpSelections.filter(item => item.selected);
      
      // Group items by type for better context
      const headings = selectedSerpItems.filter(item => item.type === 'heading').map(item => item.content);
      const questions = selectedSerpItems.filter(item => item.type === 'question').map(item => item.content);
      const contentGaps = selectedSerpItems.filter(item => item.type === 'contentGap').map(item => item.content);
      const entities = selectedSerpItems.filter(item => item.type === 'entity').map(item => item.content);
      
      // Generate content quality suggestions
      const contentResult = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content analyzer and SEO specialist. Analyze the following content and suggest specific improvements.' 
          },
          { 
            role: 'user', 
            content: `
              Analyze this content for quality, readability, and SEO optimization. 
              
              Main keyword: "${mainKeyword}"
              Secondary keywords: ${selectedKeywords.join(', ')}
              
              Additional SEO context:
              ${headings.length > 0 ? `Important headings: ${headings.join(', ')}` : ''}
              ${questions.length > 0 ? `Questions to address: ${questions.join(', ')}` : ''}
              ${contentGaps.length > 0 ? `Content gaps to fill: ${contentGaps.join(', ')}` : ''}
              ${entities.length > 0 ? `Key entities to include: ${entities.join(', ')}` : ''}
              
              Content to analyze:
              ${content}
              
              Return JSON with an array of specific improvement suggestions. Each suggestion should have:
              1. id: a unique string
              2. type: always "content"
              3. title: short title for the suggestion
              4. description: detailed description of what to improve, especially focusing on keyword incorporation
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
  }, [content, mainKeyword, selectedKeywords, selectedSolution, serpSelections]);

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
      
      // Extract selected items from SERP for optimization context
      const selectedSerpItems = serpSelections.filter(item => item.selected);
      
      // Group items by type for better context
      const headings = selectedSerpItems.filter(item => item.type === 'heading').map(item => item.content);
      const questions = selectedSerpItems.filter(item => item.type === 'question').map(item => item.content);
      const contentGaps = selectedSerpItems.filter(item => item.type === 'contentGap').map(item => item.content);
      const entities = selectedSerpItems.filter(item => item.type === 'entity').map(item => item.content);
      const keywords = selectedSerpItems.filter(item => item.type === 'keyword').map(item => item.content);
      
      // Create a comprehensive optimization prompt
      const optimizationPrompt = `
        Optimize this content by implementing these specific suggestions:
        
        ${selectedSuggestionDetails.map((s, i) => `
        ${i + 1}. ${s.title}: ${s.description}
        `).join('\n')}
        
        Main keyword: ${mainKeyword}
        Secondary/Related keywords: ${[...selectedKeywords, ...keywords].join(', ')}
        
        ${headings.length > 0 ? `
        Important headings to incorporate:
        ${headings.map((h, i) => `- ${h}`).join('\n')}
        ` : ''}
        
        ${questions.length > 0 ? `
        Questions to address in the content:
        ${questions.map((q, i) => `- ${q}`).join('\n')}
        ` : ''}
        
        ${contentGaps.length > 0 ? `
        Content gaps to fill:
        ${contentGaps.map((g, i) => `- ${g}`).join('\n')}
        ` : ''}
        
        ${entities.length > 0 ? `
        Key entities to incorporate:
        ${entities.map((e, i) => `- ${e}`).join('\n')}
        ` : ''}
        
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
        4. MUST incorporate ALL the secondary/related keywords in a natural way.
        5. Address ALL selected questions and content gaps.
        6. Make the content concrete with specific examples and details.
        7. Return ONLY the optimized content, not explanations.
        8. Use proper markdown formatting with headings.
      `;
      
      // Send the optimization request
      const result = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content optimizer. Rewrite content based on specific suggestions to create concrete, specific and well-optimized content that incorporates all keywords, questions, and entities provided.' 
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
  }, [content, contentSuggestions, mainKeyword, selectedKeywords, selectedSolution, selectedSuggestions, solutionSuggestions, serpSelections]);

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
