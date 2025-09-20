/**
 * Enhanced content suggestion generation service
 * Handles AI communication, response validation, and error recovery
 */

import { StructuredSuggestion, SuggestionContext, createSuggestionSystemPrompt, createContentAnalysisPrompt, validateSuggestionResponse } from './suggestionPrompts';
import AIServiceController from '@/services/aiService/AIServiceController';
import { toast } from 'sonner';

export interface SuggestionGenerationOptions {
  maxSuggestions?: number;
  focusAreas?: string[];
  includeReplacements?: boolean;
  confidenceThreshold?: 'high' | 'medium' | 'low';
}

export class SuggestionGenerator {
  private static instance: SuggestionGenerator;
  
  static getInstance(): SuggestionGenerator {
    if (!SuggestionGenerator.instance) {
      SuggestionGenerator.instance = new SuggestionGenerator();
    }
    return SuggestionGenerator.instance;
  }

  /**
   * Generates content optimization suggestions using AI
   */
  async generateSuggestions(
    content: string,
    context: SuggestionContext,
    options: SuggestionGenerationOptions = {}
  ): Promise<StructuredSuggestion[]> {
    try {
      // Validate input
      if (!content || content.trim().length < 50) {
        console.warn('⚠️ Content too short for analysis:', content.length);
        toast.error('Content must be at least 50 characters long for analysis');
        return [];
      }

      console.log('🔄 Starting enhanced suggestion generation...');
      console.log('Context:', { 
        contentLength: context.contentLength, 
        wordCount: context.wordCount, 
        mainKeyword: context.mainKeyword 
      });

      // Create specialized prompts
      const systemPrompt = createSuggestionSystemPrompt();
      const userPrompt = createContentAnalysisPrompt(content, context);

      // Call AI service with specialized prompts
      const response = await AIServiceController.generate({
        input: userPrompt,
        use_case: 'suggestion_generation',
        temperature: 0.3,
        max_tokens: 2500
      }, systemPrompt);

      if (!response || !response.content) {
        console.warn('❌ No content in AI response');
        return this.generateFallbackSuggestions(content, context);
      }

      // Parse and validate the response
      const parsedSuggestions = this.parseAIResponse(response.content);
      
      if (parsedSuggestions.length === 0) {
        console.warn('⚠️ No valid suggestions parsed, generating fallback');
        return this.generateFallbackSuggestions(content, context);
      }

      // Validate suggestions against actual content
      const validatedSuggestions = this.validateSuggestionsAgainstContent(parsedSuggestions, content);
      
      console.log(`✅ Generated ${validatedSuggestions.length} validated suggestions`);
      return validatedSuggestions;

    } catch (error: any) {
      console.error('❌ Suggestion generation failed:', error);
      toast.error('Failed to generate suggestions. Please try again.');
      
      // Return fallback suggestions
      return this.generateFallbackSuggestions(content, context);
    }
  }

  /**
   * Parses AI response with multiple fallback strategies
   */
  private parseAIResponse(content: string): StructuredSuggestion[] {
    console.log('🔍 Parsing AI response...');
    
    // Strategy 1: Try to parse as direct JSON
    try {
      const parsed = JSON.parse(content.trim());
      const validation = validateSuggestionResponse(parsed);
      
      if (validation.isValid) {
        console.log('✅ Successfully parsed direct JSON response');
        return validation.suggestions;
      } else {
        console.warn('⚠️ JSON response validation failed:', validation.errors);
      }
    } catch (error) {
      console.log('⚠️ Direct JSON parsing failed, trying extraction...');
    }

    // Strategy 2: Extract JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validation = validateSuggestionResponse(parsed);
        
        if (validation.isValid) {
          console.log('✅ Successfully extracted and parsed JSON');
          return validation.suggestions;
        }
      }
    } catch (error) {
      console.log('⚠️ JSON extraction failed, trying fallback format...');
    }

    // Strategy 3: Parse fallback format
    const fallbackSuggestions = this.parseFallbackFormat(content);
    if (fallbackSuggestions.length > 0) {
      console.log('✅ Successfully parsed fallback format');
      return fallbackSuggestions;
    }

    // Strategy 4: Extract basic suggestions from text
    const basicSuggestions = this.extractBasicSuggestions(content);
    if (basicSuggestions.length > 0) {
      console.log('✅ Successfully extracted basic suggestions from text');
      return basicSuggestions;
    }

    console.error('❌ All parsing strategies failed');
    return [];
  }

  /**
   * Parses the fallback format when JSON fails
   */
  private parseFallbackFormat(content: string): StructuredSuggestion[] {
    const suggestions: StructuredSuggestion[] = [];
    const suggestionBlocks = content.split('SUGGESTION_START').slice(1);

    suggestionBlocks.forEach((block, index) => {
      const endIndex = block.indexOf('SUGGESTION_END');
      if (endIndex === -1) return;

      const suggestionText = block.substring(0, endIndex).trim();
      const lines = suggestionText.split('\n').map(line => line.trim());

      const suggestion: Partial<StructuredSuggestion> = {
        id: `fallback_${index + 1}`,
        type: 'content',
        priority: 'medium',
        category: 'content',
        autoFixable: true,
        impact: 'medium',
        effort: 'medium'
      };

      lines.forEach(line => {
        if (line.startsWith('Title:')) {
          suggestion.title = line.substring(6).trim();
        } else if (line.startsWith('Description:')) {
          suggestion.description = line.substring(12).trim();
        } else if (line.startsWith('Type:')) {
          const type = line.substring(5).trim();
          if (['content', 'seo', 'structure', 'keywords', 'readability'].includes(type)) {
            suggestion.type = type as any;
          }
        } else if (line.startsWith('Priority:')) {
          const priority = line.substring(9).trim();
          if (['high', 'medium', 'low'].includes(priority)) {
            suggestion.priority = priority as any;
          }
        } else if (line.startsWith('Reasoning:')) {
          suggestion.reasoning = line.substring(10).trim();
        }
      });

      if (suggestion.title && suggestion.description) {
        suggestions.push(suggestion as StructuredSuggestion);
      }
    });

    return suggestions;
  }

  /**
   * Extracts basic suggestions from plain text when structured parsing fails
   */
  private extractBasicSuggestions(content: string): StructuredSuggestion[] {
    const suggestions: StructuredSuggestion[] = [];
    
    // Look for numbered lists or bullet points that might be suggestions
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    let suggestionCount = 0;

    lines.forEach((line, index) => {
      // Look for patterns like "1.", "-", "*", or other suggestion indicators
      if (/^[\d\-\*\•]/.test(line.trim()) && line.length > 20) {
        suggestionCount++;
        const cleanLine = line.replace(/^[\d\-\*\•\s]+/, '').trim();
        
        if (cleanLine.length > 10) {
          suggestions.push({
            id: `extracted_${suggestionCount}`,
            title: cleanLine.substring(0, 60),
            description: cleanLine,
            reasoning: 'Extracted from AI response',
            type: 'content',
            priority: 'medium',
            category: 'content',
            autoFixable: false,
            impact: 'medium',
            effort: 'medium'
          });
        }
      }
    });

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  /**
   * Validates suggestions against actual content to ensure text exists
   */
  private validateSuggestionsAgainstContent(
    suggestions: StructuredSuggestion[], 
    content: string
  ): StructuredSuggestion[] {
    return suggestions.map(suggestion => {
      if (!suggestion.replacements || suggestion.replacements.length === 0) {
        return suggestion;
      }

      // Validate each replacement
      const validReplacements = suggestion.replacements.filter(replacement => {
        if (!replacement.originalText) return false;
        
        // Check if the original text exists in content (with some fuzzy matching)
        const exists = this.findTextInContent(content, replacement.originalText);
        if (!exists.found) {
          console.warn(`⚠️ Original text not found in content: "${replacement.originalText}"`);
          return false;
        }

        return true;
      });

      return {
        ...suggestion,
        replacements: validReplacements,
        autoFixable: validReplacements.length > 0
      };
    });
  }

  /**
   * Finds text in content with fuzzy matching
   */
  private findTextInContent(content: string, searchText: string): {
    found: boolean;
    location?: { start: number; end: number; similarity: number };
  } {
    // Exact match first
    const exactIndex = content.indexOf(searchText);
    if (exactIndex !== -1) {
      return {
        found: true,
        location: {
          start: exactIndex,
          end: exactIndex + searchText.length,
          similarity: 1.0
        }
      };
    }

    // Fuzzy match (simple similarity check)
    const words = searchText.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    // Check if at least 70% of words exist in content
    const foundWords = words.filter(word => contentLower.includes(word));
    const similarity = foundWords.length / words.length;
    
    if (similarity >= 0.7) {
      return {
        found: true,
        location: {
          start: 0,
          end: 0,
          similarity
        }
      };
    }

    return { found: false };
  }

  /**
   * Generates fallback suggestions when AI fails
   */
  private generateFallbackSuggestions(
    content: string, 
    context: SuggestionContext
  ): StructuredSuggestion[] {
    console.log('🔄 Generating fallback suggestions...');
    
    const suggestions: StructuredSuggestion[] = [];
    const wordCount = content.split(' ').length;

    // Basic content length suggestion
    if (wordCount < 300) {
      suggestions.push({
        id: 'fallback_length',
        title: 'Expand Content Length',
        description: `Content is ${wordCount} words. Consider adding more detailed information.`,
        reasoning: 'Longer content typically performs better for SEO and provides more value to readers.',
        type: 'content',
        priority: 'medium',
        category: 'content',
        autoFixable: false,
        impact: 'medium',
        effort: 'medium'
      });
    }

    // Keyword usage suggestion
    if (context.mainKeyword && !content.toLowerCase().includes(context.mainKeyword.toLowerCase())) {
      suggestions.push({
        id: 'fallback_keyword',
        title: 'Include Main Keyword',
        description: `The main keyword "${context.mainKeyword}" is not found in the content.`,
        reasoning: 'Including the main keyword helps search engines understand the content topic.',
        type: 'seo',
        priority: 'high',
        category: 'keywords',
        autoFixable: false,
        impact: 'high',
        effort: 'low'
      });
    }

    // Structure suggestion
    if (!content.includes('#') && !content.includes('<h')) {
      suggestions.push({
        id: 'fallback_structure',
        title: 'Add Headings for Structure',
        description: 'Content lacks clear headings and structure.',
        reasoning: 'Well-structured content with headings improves readability and SEO.',
        type: 'structure',
        priority: 'medium',
        category: 'structure',
        autoFixable: false,
        impact: 'medium',
        effort: 'low'
      });
    }

    return suggestions;
  }
}