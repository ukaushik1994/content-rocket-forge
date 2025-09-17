import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { logOptimizationActivity } from '@/services/contentOptimizationService';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const createOptimizationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  
  const saveOptimizationSelections = async (suggestions: string[], highlights: string[]) => {
    try {
      // Save selections to context state
      dispatch({ 
        type: 'SAVE_OPTIMIZATION_SELECTIONS', 
        payload: { suggestions, highlights } 
      });

      // Log to database for analytics
      await logOptimizationActivity(
        null, // contentId - could be enhanced later
        `optimization-${Date.now()}`, // sessionId
        state.content.length,
        [], // Will be populated when we have suggestion objects
        [], // Applied suggestions
        [], // Rejected suggestions  
        {},
        {
          tone: 'professional',
          audience: 'general', 
          seoFocus: 'moderate',
          contentLength: 'maintain',
          creativity: 0.7,
          preserveStructure: true,
          includeExamples: false,
          enhanceReadability: true,
          customInstructions: ''
        },
        true
      );

      toast.success(`Saved ${suggestions.length} suggestion(s) and ${highlights.length} highlight(s)`);
    } catch (error) {
      console.error('Error saving optimization selections:', error);
      toast.error('Failed to save optimization selections');
    }
  };

  const getOptimizationSelections = () => {
    return state.optimizationSelections;
  };

  const clearOptimizationSelections = () => {
    dispatch({ type: 'CLEAR_OPTIMIZATION_SELECTIONS' });
    toast.info('Optimization selections cleared');
  };

  const applyOptimizationChanges = async (selectedHighlights: string[], content: string): Promise<string> => {
    try {
      if (selectedHighlights.length === 0) {
        toast.info('No highlights selected - returning original content');
        return content;
      }

      // Use AI to apply the optimization changes based on selected highlights
      const systemPrompt = 'You are an expert content editor. Apply the requested optimizations to improve the content while maintaining its original meaning and tone.';
      
      const userPrompt = `
Apply these specific optimizations to the content:

SELECTED HIGHLIGHTS TO APPLY: ${selectedHighlights.length} improvements
- Focus on the areas that were highlighted for optimization
- Improve SEO by better incorporating keywords naturally
- Enhance readability and structure
- Strengthen solution integration where appropriate
- Make the content more engaging and valuable

ORIGINAL CONTENT:
${content}

Return ONLY the improved content (no explanations or metadata). Maintain the same overall structure and tone while applying the optimizations.
`;

      const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
      
      const response = await AIServiceController.generate(
        'content_generation',
        systemPrompt,
        userPrompt,
        { temperature: 0.3, maxTokens: 3000 }
      );

      let optimizedContent = content; // Default fallback

      if (response?.content) {
        // Clean up the response to get just the content
        let improvedContent = response.content.trim();
        
        // Remove any markdown formatting or explanations
        improvedContent = improvedContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        
        // Validate that we got meaningful content back
        if (improvedContent.length > content.length * 0.5 && 
            improvedContent.length < content.length * 2 && 
            improvedContent !== content) {
          optimizedContent = improvedContent;
          console.log('✅ Successfully applied AI optimizations');
        } else {
          console.warn('⚠️ AI optimization result seems invalid, using original content');
        }
      }
      
      // Update the main content in the context
      dispatch({ type: 'SET_CONTENT', payload: optimizedContent });
      
      // Mark the optimization step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      
      const changesMade = optimizedContent !== content;
      if (changesMade) {
        toast.success(`Applied ${selectedHighlights.length} optimization improvements!`);
      } else {
        toast.info('Content reviewed - no changes needed');
      }
      
      return optimizedContent;
    } catch (error) {
      console.error('Error applying optimization changes:', error);
      toast.error('Failed to apply optimization changes - returning original content');
      
      // Still update context and mark as completed even if optimization failed
      dispatch({ type: 'SET_CONTENT', payload: content });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      
      return content;
    }
  };

  const applyComplianceFixes = async (selectedViolations: any[], content: string): Promise<{ fixedContent: string; appliedFixes: string[] }> => {
    try {
      if (selectedViolations.length === 0) {
        toast.info('No compliance violations selected');
        return { fixedContent: content, appliedFixes: [] };
      }

      // Group violations by category for more efficient processing
      const violationsByCategory = selectedViolations.reduce((acc: Record<string, any[]>, violation: any) => {
        const category = violation.category || 'general';
        if (!acc[category]) acc[category] = [];
        acc[category].push(violation);
        return acc;
      }, {} as Record<string, any[]>);

      // Create specific fix instructions based on violation types
      const systemPrompt = 'You are an expert content compliance specialist. Fix the identified compliance violations while preserving the original content quality, tone, and meaning. Make precise, targeted changes only where needed.';
      
      const fixInstructions = Object.entries(violationsByCategory).map(([category, violations]: [string, any[]]) => {
        const violationTexts = violations.map((v: any) => `- ${v.title}: ${v.description}`).join('\n');
        return `${category.toUpperCase()} VIOLATIONS TO FIX:\n${violationTexts}`;
      }).join('\n\n');

      const userPrompt = `
Fix these specific compliance violations in the content:

${fixInstructions}

ORIGINAL CONTENT:
${content}

INSTRUCTIONS:
- Make ONLY the changes needed to address the listed violations
- Preserve the original tone, style, and overall structure
- Maintain content quality and readability
- Do not add unnecessary changes beyond fixing the violations
- Return ONLY the corrected content (no explanations or metadata)

FIXED CONTENT:`;

      const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
      
      const response = await AIServiceController.generate(
        'content_generation',
        systemPrompt,
        userPrompt,
        { temperature: 0.2, maxTokens: 4000 }
      );

      let fixedContent = content; // Default fallback
      const appliedFixes: string[] = [];

      if (response?.content) {
        // Clean up the response to get just the content
        let improvedContent = response.content.trim();
        
        // Remove any markdown formatting or explanations
        improvedContent = improvedContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        
        // Validate that we got meaningful content back
        if (improvedContent.length > content.length * 0.5 && 
            improvedContent.length < content.length * 3 && 
            improvedContent !== content) {
          fixedContent = improvedContent;
          appliedFixes.push(...selectedViolations.map((v: any) => v.title));
          console.log('✅ Successfully applied compliance fixes');
        } else {
          console.warn('⚠️ AI compliance fix result seems invalid, using original content');
        }
      }
      
      return { fixedContent, appliedFixes };
    } catch (error) {
      console.error('Error applying compliance fixes:', error);
      toast.error('Failed to apply compliance fixes');
      return { fixedContent: content, appliedFixes: [] };
    }
  };

  const previewComplianceFixes = async (selectedViolations: any[], content: string): Promise<string | null> => {
    try {
      const { fixedContent } = await applyComplianceFixes(selectedViolations, content);
      return fixedContent !== content ? fixedContent : null;
    } catch (error) {
      console.error('Error previewing compliance fixes:', error);
      return null;
    }
  };

  return {
    saveOptimizationSelections,
    getOptimizationSelections,
    clearOptimizationSelections,
    applyOptimizationChanges,
    applyComplianceFixes,
    previewComplianceFixes
  };
};