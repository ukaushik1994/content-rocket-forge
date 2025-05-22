
import { useState, useCallback, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Types for recommendations
export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'quality' | 'solution';
  impact: 'high' | 'medium' | 'low';
  changes: string;
}

/**
 * Custom hook for content optimization functionality
 */
export const useContentOptimizer = (initialContent: string) => {
  const { state } = useContentBuilder();
  const { mainKeyword, selectedKeywords, selectedSolution, solutionIntegrationMetrics } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  
  // Toggle a recommendation selection
  const toggleOptimization = useCallback((id: string) => {
    setSelectedOptimizations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);
  
  // Select all recommendations of a specific category
  const selectAllOptimizations = useCallback((category: 'quality' | 'solution') => {
    const categoryIds = recommendations
      .filter(rec => rec.category === category)
      .map(rec => rec.id);
      
    setSelectedOptimizations(prev => {
      const existingFromOtherCategories = prev.filter(id => 
        !recommendations.find(rec => rec.id === id && rec.category === category)
      );
      return [...existingFromOtherCategories, ...categoryIds];
    });
  }, [recommendations]);
  
  // Deselect all recommendations of a specific category
  const deselectAllOptimizations = useCallback((category: 'quality' | 'solution') => {
    setSelectedOptimizations(prev => 
      prev.filter(id => 
        !recommendations.find(rec => rec.id === id && rec.category === category)
      )
    );
  }, [recommendations]);
  
  // Analyze content and generate recommendations
  const analyzeContent = useCallback(async () => {
    if (!initialContent) {
      toast.error('No content available to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Call AI to analyze content quality
      const qualityResponse = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: `You are a content optimization expert. Analyze the given content and provide specific improvement suggestions.
                      Focus on readability, structure, engagement, and SEO optimization.
                      For each suggestion, include a clear title, detailed description, and the specific changes to make.
                      Respond with a JSON array of recommendations.`
          },
          { 
            role: 'user', 
            content: `
              CONTENT: ${initialContent.substring(0, 5000)}
              
              MAIN KEYWORD: ${mainKeyword}
              SECONDARY KEYWORDS: ${selectedKeywords.join(', ')}
              
              Analyze this content and provide up to 5 specific improvements for quality.
              For each recommendation, provide:
              1. A short, descriptive title
              2. A detailed explanation of what should be improved
              3. The impact level (high, medium, low)
              4. The specific changes to make (provide the actual text to add or modify)
              
              Format your response as a JSON array with objects containing "title", "description", "impact", and "changes" properties.
            `
          }
        ],
        temperature: 0.7
      });
      
      // Process quality recommendations
      let qualityRecommendations: ContentRecommendation[] = [];
      
      if (qualityResponse?.choices?.[0]?.message?.content) {
        try {
          // Extract JSON from the response
          const contentText = qualityResponse.choices[0].message.content;
          const jsonMatch = contentText.match(/\[[\s\S]*\]/);
          
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            qualityRecommendations = jsonData.map((item: any) => ({
              id: uuidv4(),
              title: item.title,
              description: item.description,
              category: 'quality',
              impact: item.impact || 'medium',
              changes: item.changes
            }));
          }
        } catch (error) {
          console.error('Error parsing quality recommendations:', error);
          toast.error('Failed to parse quality recommendations');
        }
      }
      
      // Process solution recommendations if a solution is selected
      let solutionRecommendations: ContentRecommendation[] = [];
      
      if (selectedSolution) {
        const solutionResponse = await sendChatRequest('openai', {
          messages: [
            { 
              role: 'system', 
              content: `You are a solution integration expert. Analyze the content and provide suggestions
                        to better integrate a specific solution or product into the content. Focus on
                        value proposition, features, and calls to action.`
            },
            { 
              role: 'user', 
              content: `
                CONTENT: ${initialContent.substring(0, 5000)}
                
                SOLUTION NAME: ${selectedSolution.name}
                SOLUTION FEATURES: ${selectedSolution.features.join(', ')}
                PAIN POINTS: ${selectedSolution.painPoints ? selectedSolution.painPoints.join(', ') : 'Not specified'}
                
                Analyze this content and provide up to 3 specific improvements for better integration of this solution.
                For each recommendation, provide:
                1. A short, descriptive title
                2. A detailed explanation of what should be improved
                3. The impact level (high, medium, low)
                4. The specific changes to make (provide the actual text to add or modify)
                
                Format your response as a JSON array with objects containing "title", "description", "impact", and "changes" properties.
              `
            }
          ],
          temperature: 0.7
        });
        
        // Process solution recommendations
        if (solutionResponse?.choices?.[0]?.message?.content) {
          try {
            // Extract JSON from the response
            const contentText = solutionResponse.choices[0].message.content;
            const jsonMatch = contentText.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[0]);
              solutionRecommendations = jsonData.map((item: any) => ({
                id: uuidv4(),
                title: item.title,
                description: item.description,
                category: 'solution',
                impact: item.impact || 'medium',
                changes: item.changes
              }));
            }
          } catch (error) {
            console.error('Error parsing solution recommendations:', error);
            toast.error('Failed to parse solution recommendations');
          }
        }
      }
      
      // Combine recommendations
      setRecommendations([...qualityRecommendations, ...solutionRecommendations]);
      
      // Auto-select high impact recommendations
      const highImpactIds = [...qualityRecommendations, ...solutionRecommendations]
        .filter(rec => rec.impact === 'high')
        .map(rec => rec.id);
        
      setSelectedOptimizations(highImpactIds);
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  }, [initialContent, mainKeyword, selectedKeywords, selectedSolution]);
  
  // Apply selected optimizations
  const applyOptimizations = useCallback(() => {
    if (selectedOptimizations.length === 0) {
      return null;
    }
    
    // Get selected recommendations
    const selected = recommendations.filter(rec => selectedOptimizations.includes(rec.id));
    
    if (selected.length === 0) {
      return null;
    }
    
    // Generate optimized content using AI
    let contentToOptimize = initialContent;
    
    // Apply each optimization sequentially
    selected.forEach(optimization => {
      contentToOptimize = applyOptimization(contentToOptimize, optimization);
    });
    
    setOptimizedContent(contentToOptimize);
    return contentToOptimize;
  }, [initialContent, recommendations, selectedOptimizations]);
  
  // Helper function to apply a single optimization
  const applyOptimization = (content: string, optimization: ContentRecommendation): string => {
    // For now, we'll just use the AI-provided changes directly
    // In a more sophisticated implementation, we might use regex patterns to find and replace content
    return optimization.changes || content;
  };
  
  return {
    isAnalyzing,
    recommendations,
    optimizedContent,
    selectedOptimizations,
    toggleOptimization,
    analyzeContent,
    applyOptimizations,
    selectAllOptimizations,
    deselectAllOptimizations
  };
};
