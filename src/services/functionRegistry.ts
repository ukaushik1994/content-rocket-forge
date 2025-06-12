
export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
  validation?: (value: any) => boolean | string;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  category: 'content' | 'serp' | 'analytics' | 'workflow' | 'navigation' | 'conversation';
  parameters: FunctionParameter[];
  examples: string[];
  requiredContext?: string[];
  workflow?: string;
}

export const FUNCTION_REGISTRY: Record<string, FunctionDefinition> = {
  createContent: {
    name: 'createContent',
    description: 'Creates a new content item with title and optional content',
    category: 'content',
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'The title for the new content item',
        example: 'How to Optimize SEO for E-commerce',
        validation: (value) => value && value.length > 0 ? true : 'Title cannot be empty'
      },
      {
        name: 'content',
        type: 'string',
        required: false,
        description: 'The content body (optional, can be added later)',
        example: 'This comprehensive guide covers...'
      }
    ],
    examples: [
      'Create a new article titled "Best SEO Practices for 2024"',
      'Create content about "Content Marketing Strategy"',
      'Start a new piece on "Digital Marketing Trends"'
    ],
    workflow: 'Can be used at any stage to create new content'
  },
  
  analyzeKeyword: {
    name: 'analyzeKeyword',
    description: 'Performs SERP analysis for a given keyword',
    category: 'serp',
    parameters: [
      {
        name: 'keyword',
        type: 'string',
        required: true,
        description: 'The keyword to analyze',
        example: 'best coffee shops nyc',
        validation: (value) => value && value.length > 0 ? true : 'Keyword cannot be empty'
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh of SERP data',
        example: false
      }
    ],
    examples: [
      'Analyze the keyword "digital marketing trends"',
      'Do SERP analysis for "best productivity apps"',
      'Research competitors for "content management tools"'
    ],
    workflow: 'Best used in Content Builder SERP Analysis step'
  },

  listContent: {
    name: 'listContent',
    description: 'Lists user content items with optional filtering',
    category: 'content',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of items to return',
        example: 10
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by content status',
        example: 'published'
      }
    ],
    examples: [
      'Show me my recent content',
      'List all published articles',
      'Display my draft content'
    ],
    workflow: 'Useful for content management and review'
  },

  navigateToPage: {
    name: 'navigateToPage',
    description: 'Navigate to a specific page in the application',
    category: 'navigation',
    parameters: [
      {
        name: 'page',
        type: 'string',
        required: true,
        description: 'The page route to navigate to',
        example: '/content-builder',
        validation: (value) => {
          const validPages = ['/', '/content-builder', '/analytics', '/solutions', '/settings', '/drafts', '/ai-assistant'];
          return validPages.includes(value) ? true : `Invalid page. Valid pages: ${validPages.join(', ')}`;
        }
      }
    ],
    examples: [
      'Take me to the content builder',
      'Go to analytics dashboard',
      'Navigate to settings'
    ],
    workflow: 'Navigation helper for any workflow'
  },

  getAnalytics: {
    name: 'getAnalytics',
    description: 'Retrieve analytics data for content performance',
    category: 'analytics',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of analytics records to fetch',
        example: 10
      },
      {
        name: 'contentId',
        type: 'string',
        required: false,
        description: 'Specific content ID to get analytics for',
        example: 'uuid-string'
      }
    ],
    examples: [
      'Show me content analytics',
      'Get performance data for my articles',
      'Display traffic metrics'
    ],
    workflow: 'Best used for performance review and optimization'
  }
};

export function getFunctionDefinition(functionName: string): FunctionDefinition | null {
  return FUNCTION_REGISTRY[functionName] || null;
}

export function validateFunctionParameters(functionName: string, parameters: any): { valid: boolean; errors: string[]; suggestions?: string[] } {
  const definition = getFunctionDefinition(functionName);
  if (!definition) {
    return { valid: false, errors: [`Function '${functionName}' not found`] };
  }

  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check required parameters
  for (const param of definition.parameters) {
    if (param.required && (!parameters || parameters[param.name] === undefined || parameters[param.name] === null)) {
      errors.push(`Missing required parameter: ${param.name} - ${param.description}`);
      if (param.example) {
        suggestions.push(`Example ${param.name}: "${param.example}"`);
      }
    }

    // Validate parameter values if they exist
    if (parameters && parameters[param.name] !== undefined && param.validation) {
      const validationResult = param.validation(parameters[param.name]);
      if (validationResult !== true) {
        errors.push(`Invalid ${param.name}: ${validationResult}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

export function getFunctionsByCategory(category: string): FunctionDefinition[] {
  return Object.values(FUNCTION_REGISTRY).filter(func => func.category === category);
}

export function suggestFunctions(intent: string, currentContext?: any): FunctionDefinition[] {
  const intentLower = intent.toLowerCase();
  const suggestions: FunctionDefinition[] = [];

  // Content creation keywords
  if (intentLower.includes('create') || intentLower.includes('write') || intentLower.includes('new content')) {
    suggestions.push(FUNCTION_REGISTRY.createContent);
  }

  // SERP/keyword analysis keywords
  if (intentLower.includes('keyword') || intentLower.includes('serp') || intentLower.includes('analyze') || intentLower.includes('research')) {
    suggestions.push(FUNCTION_REGISTRY.analyzeKeyword);
  }

  // Navigation keywords
  if (intentLower.includes('go to') || intentLower.includes('navigate') || intentLower.includes('take me')) {
    suggestions.push(FUNCTION_REGISTRY.navigateToPage);
  }

  // Analytics keywords
  if (intentLower.includes('analytics') || intentLower.includes('performance') || intentLower.includes('metrics')) {
    suggestions.push(FUNCTION_REGISTRY.getAnalytics);
  }

  // Content management keywords
  if (intentLower.includes('show') || intentLower.includes('list') || intentLower.includes('my content')) {
    suggestions.push(FUNCTION_REGISTRY.listContent);
  }

  return suggestions;
}
