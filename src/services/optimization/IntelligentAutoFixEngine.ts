
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { OptimizationSuggestion } from './RealTimeOptimizationEngine';

export interface AutoFixResult {
  success: boolean;
  originalText: string;
  fixedText: string;
  appliedFixes: string[];
  confidence: number;
  explanation: string;
}

export interface AutoFixContext {
  content: string;
  title: string;
  keywords: string[];
  targetAudience: string;
  preserveFormatting: boolean;
  preserveStyle: boolean;
}

export class IntelligentAutoFixEngine {
  private fixHistory: Array<{ original: string; fixed: string; timestamp: number }> = [];
  
  async applyAutoFix(
    suggestion: OptimizationSuggestion,
    context: AutoFixContext,
    provider: AiProvider = 'openai'
  ): Promise<AutoFixResult> {
    if (!suggestion.autoFixable) {
      return {
        success: false,
        originalText: context.content,
        fixedText: context.content,
        appliedFixes: [],
        confidence: 0,
        explanation: 'This suggestion requires manual intervention'
      };
    }

    const prompt = this.buildAutoFixPrompt(suggestion, context);
    
    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are an expert content editor. Apply the requested fix while preserving the original meaning and style. Return the result in JSON format.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const result = this.parseAutoFixResponse(response.choices[0].message.content, context.content);
        
        // Store in history
        this.fixHistory.push({
          original: context.content,
          fixed: result.fixedText,
          timestamp: Date.now()
        });
        
        return result;
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    }

    return {
      success: false,
      originalText: context.content,
      fixedText: context.content,
      appliedFixes: [],
      confidence: 0,
      explanation: 'Auto-fix processing failed'
    };
  }

  async applyMultipleFixes(
    suggestions: OptimizationSuggestion[],
    context: AutoFixContext,
    provider: AiProvider = 'openai'
  ): Promise<AutoFixResult> {
    const autoFixableSuggestions = suggestions.filter(s => s.autoFixable);
    
    if (autoFixableSuggestions.length === 0) {
      return {
        success: false,
        originalText: context.content,
        fixedText: context.content,
        appliedFixes: [],
        confidence: 0,
        explanation: 'No auto-fixable suggestions available'
      };
    }

    const prompt = `Apply multiple content optimizations simultaneously:

Original Content: ${context.content}
Title: ${context.title}
Keywords: ${context.keywords.join(', ')}
Target Audience: ${context.targetAudience}

Apply these fixes in order of priority:
${autoFixableSuggestions.map((s, i) => `${i + 1}. ${s.title}: ${s.suggestion}`).join('\n')}

Requirements:
- Preserve original meaning and core message
- Maintain writing style and tone
- ${context.preserveFormatting ? 'Preserve all formatting (headers, lists, etc.)' : 'Improve formatting if needed'}
- Apply fixes that don't conflict with each other
- Ensure natural flow and readability

Return JSON with:
- fixedText: the improved content
- appliedFixes: array of fix descriptions
- confidence: 0-1 score
- explanation: summary of changes made`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are an expert content optimizer. Apply multiple improvements while maintaining content integrity.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const result = this.parseAutoFixResponse(response.choices[0].message.content, context.content);
        
        this.fixHistory.push({
          original: context.content,
          fixed: result.fixedText,
          timestamp: Date.now()
        });
        
        return result;
      }
    } catch (error) {
      console.error('Multiple auto-fix failed:', error);
    }

    return {
      success: false,
      originalText: context.content,
      fixedText: context.content,
      appliedFixes: [],
      confidence: 0,
      explanation: 'Multiple auto-fix processing failed'
    };
  }

  async intelligentRewrite(
    content: string,
    improvementGoals: string[],
    context: Partial<AutoFixContext>,
    provider: AiProvider = 'openai'
  ): Promise<AutoFixResult> {
    const prompt = `Intelligently rewrite this content to achieve specific goals:

Original Content: ${content}
${context.title ? `Title: ${context.title}` : ''}
${context.keywords ? `Keywords: ${context.keywords.join(', ')}` : ''}
${context.targetAudience ? `Target Audience: ${context.targetAudience}` : ''}

Improvement Goals:
${improvementGoals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

Rewrite Requirements:
- Preserve core message and key information
- Improve based on specified goals
- Maintain natural, engaging tone
- Ensure logical flow and structure
- Optimize for target audience
- Keep roughly the same length unless specified otherwise

Return JSON with fixedText, appliedFixes array, confidence score, and explanation.`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are an expert content strategist and writer. Rewrite content to achieve specific improvement goals while maintaining quality and authenticity.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return this.parseAutoFixResponse(response.choices[0].message.content, content);
      }
    } catch (error) {
      console.error('Intelligent rewrite failed:', error);
    }

    return {
      success: false,
      originalText: content,
      fixedText: content,
      appliedFixes: [],
      confidence: 0,
      explanation: 'Intelligent rewrite failed'
    };
  }

  private buildAutoFixPrompt(suggestion: OptimizationSuggestion, context: AutoFixContext): string {
    return `Apply this specific content optimization:

Original Content: ${context.content}
Title: ${context.title}
Keywords: ${context.keywords.join(', ')}

Fix to Apply:
- Type: ${suggestion.type}
- Title: ${suggestion.title}
- Description: ${suggestion.description}
- Suggestion: ${suggestion.suggestion}
${suggestion.currentValue ? `- Current Value: ${suggestion.currentValue}` : ''}
${suggestion.suggestedValue ? `- Suggested Value: ${suggestion.suggestedValue}` : ''}

Requirements:
- Apply the specific fix mentioned
- Preserve original meaning and style
- ${context.preserveFormatting ? 'Maintain all formatting' : 'Improve formatting if needed'}
- Ensure natural flow
- Target audience: ${context.targetAudience}

Return JSON with: fixedText, appliedFixes array, confidence (0-1), explanation`;
  }

  private parseAutoFixResponse(response: string, originalContent: string): AutoFixResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          originalText: originalContent,
          fixedText: parsed.fixedText || originalContent,
          appliedFixes: parsed.appliedFixes || [],
          confidence: parsed.confidence || 0.8,
          explanation: parsed.explanation || 'Auto-fix applied successfully'
        };
      }
    } catch (error) {
      console.error('Failed to parse auto-fix response:', error);
    }

    return {
      success: false,
      originalText: originalContent,
      fixedText: originalContent,
      appliedFixes: [],
      confidence: 0,
      explanation: 'Failed to parse auto-fix result'
    };
  }

  getFixHistory(): Array<{ original: string; fixed: string; timestamp: number }> {
    return [...this.fixHistory];
  }

  clearHistory(): void {
    this.fixHistory = [];
  }

  undoLastFix(): string | null {
    if (this.fixHistory.length > 0) {
      const lastFix = this.fixHistory.pop();
      return lastFix?.original || null;
    }
    return null;
  }
}

export const autoFixEngine = new IntelligentAutoFixEngine();
