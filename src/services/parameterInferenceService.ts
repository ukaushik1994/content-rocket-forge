
import { FunctionDefinition, validateFunctionParameters } from './functionRegistry';
import { PlatformContext } from './platformContextService';

export interface ParameterSuggestion {
  parameter: string;
  suggestedValue: any;
  confidence: number;
  source: string;
}

export interface InferenceResult {
  parameters: Record<string, any>;
  suggestions: ParameterSuggestion[];
  missingRequired: string[];
  clarificationQuestions: string[];
}

class ParameterInferenceService {
  inferParameters(
    functionDef: FunctionDefinition,
    userMessage: string,
    context: PlatformContext,
    providedParams: any = {}
  ): InferenceResult {
    const result: InferenceResult = {
      parameters: { ...providedParams },
      suggestions: [],
      missingRequired: [],
      clarificationQuestions: []
    };

    // Infer parameters based on function type and context
    for (const param of functionDef.parameters) {
      if (result.parameters[param.name] !== undefined) {
        continue; // Already provided
      }

      const suggestion = this.inferParameter(param, userMessage, context, functionDef);
      if (suggestion) {
        result.suggestions.push(suggestion);
        if (suggestion.confidence > 0.7) {
          result.parameters[param.name] = suggestion.suggestedValue;
        }
      }

      // Check if required parameter is missing
      if (param.required && result.parameters[param.name] === undefined) {
        result.missingRequired.push(param.name);
        result.clarificationQuestions.push(
          `What should be the ${param.name}? ${param.description} (Example: ${param.example})`
        );
      }
    }

    return result;
  }

  private inferParameter(
    param: any,
    userMessage: string,
    context: PlatformContext,
    functionDef: FunctionDefinition
  ): ParameterSuggestion | null {
    const messageLower = userMessage.toLowerCase();

    switch (functionDef.name) {
      case 'createContent':
        return this.inferContentCreationParams(param, messageLower, context);
      
      case 'analyzeKeyword':
        return this.inferKeywordAnalysisParams(param, messageLower, context);
      
      case 'navigateToPage':
        return this.inferNavigationParams(param, messageLower, context);
      
      case 'listContent':
        return this.inferContentListParams(param, messageLower, context);
      
      default:
        return null;
    }
  }

  private inferContentCreationParams(
    param: any,
    message: string,
    context: PlatformContext
  ): ParameterSuggestion | null {
    if (param.name === 'title') {
      // Extract title from various patterns
      const patterns = [
        /create.*?(?:content|article|post).*?(?:about|on|titled?)\s+"([^"]+)"/i,
        /create.*?(?:content|article|post).*?(?:about|on|titled?)\s+(.+)/i,
        /write.*?(?:about|on)\s+"([^"]+)"/i,
        /write.*?(?:about|on)\s+(.+)/i,
        /"([^"]+)"/i // Any quoted text
      ];

      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          return {
            parameter: 'title',
            suggestedValue: match[1].trim(),
            confidence: 0.8,
            source: 'extracted from message'
          };
        }
      }

      // Fallback: suggest based on context
      if (context.currentPage === '/content-builder') {
        return {
          parameter: 'title',
          suggestedValue: 'New Content Article',
          confidence: 0.3,
          source: 'default for content builder'
        };
      }
    }

    return null;
  }

  private inferKeywordAnalysisParams(
    param: any,
    message: string,
    context: PlatformContext
  ): ParameterSuggestion | null {
    if (param.name === 'keyword') {
      const patterns = [
        /analyze.*?keyword\s+"([^"]+)"/i,
        /analyze.*?"([^"]+)"/i,
        /keyword\s+"([^"]+)"/i,
        /serp.*?(?:for|analysis)\s+"([^"]+)"/i,
        /"([^"]+)"/i
      ];

      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          return {
            parameter: 'keyword',
            suggestedValue: match[1].trim(),
            confidence: 0.9,
            source: 'extracted from message'
          };
        }
      }
    }

    return null;
  }

  private inferNavigationParams(
    param: any,
    message: string,
    context: PlatformContext
  ): ParameterSuggestion | null {
    if (param.name === 'page') {
      const navigationMap: Record<string, string> = {
        'content builder': '/content-builder',
        'content creation': '/content-builder',
        'builder': '/content-builder',
        'analytics': '/analytics',
        'dashboard': '/',
        'home': '/',
        'solutions': '/solutions',
        'settings': '/settings',
        'drafts': '/drafts',
        'ai assistant': '/ai-assistant',
        'chat': '/ai-assistant'
      };

      for (const [keyword, page] of Object.entries(navigationMap)) {
        if (message.includes(keyword)) {
          return {
            parameter: 'page',
            suggestedValue: page,
            confidence: 0.9,
            source: `matched "${keyword}"`
          };
        }
      }
    }

    return null;
  }

  private inferContentListParams(
    param: any,
    message: string,
    context: PlatformContext
  ): ParameterSuggestion | null {
    if (param.name === 'status') {
      if (message.includes('published')) {
        return {
          parameter: 'status',
          suggestedValue: 'published',
          confidence: 0.8,
          source: 'matched "published"'
        };
      }
      if (message.includes('draft')) {
        return {
          parameter: 'status',
          suggestedValue: 'draft',
          confidence: 0.8,
          source: 'matched "draft"'
        };
      }
    }

    if (param.name === 'limit') {
      const match = message.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > 0 && num <= 100) {
          return {
            parameter: 'limit',
            suggestedValue: num,
            confidence: 0.7,
            source: `extracted number ${num}`
          };
        }
      }
    }

    return null;
  }

  generateParameterPrompt(functionDef: FunctionDefinition, inference: InferenceResult): string {
    if (inference.missingRequired.length === 0) {
      return '';
    }

    const prompts = [];
    
    prompts.push(`To use the ${functionDef.name} function, I need some additional information:`);
    
    for (const question of inference.clarificationQuestions) {
      prompts.push(`• ${question}`);
    }

    if (inference.suggestions.length > 0) {
      prompts.push('\nSuggestions based on your message:');
      for (const suggestion of inference.suggestions) {
        if (suggestion.confidence < 0.7) {
          prompts.push(`• ${suggestion.parameter}: "${suggestion.suggestedValue}" (${suggestion.source})`);
        }
      }
    }

    return prompts.join('\n');
  }
}

export const parameterInferenceService = new ParameterInferenceService();
