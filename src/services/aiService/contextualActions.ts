import { ContextualAction } from './index';

export interface ContentCreationActionData {
  keyword?: string;
  mainKeyword?: string;
  keywords?: string[];
  title?: string;
  contentType?: 'blog-post' | 'landing-page' | 'article' | 'product-page' | 'sales-page';
  location?: string;
  step?: number;
  outline?: any[];
  targetAudience?: string;
  intent?: 'informational' | 'commercial' | 'transactional';
  format?: 'how-to' | 'listicle' | 'review' | 'comparison' | 'guide';
}

export interface WorkflowActionData {
  workflowType?: string;
  nextStep?: string;
  context?: Record<string, any>;
}

// Enhanced action generators for content creation
export const createContentActions = {
  blogPost: (data: ContentCreationActionData): ContextualAction => ({
    id: `create-blog-${Date.now()}`,
    label: `Create Blog Post${data.title ? `: "${data.title}"` : ''}`,
    action: 'create-blog-post',
    type: 'card',
    variant: 'primary',
    description: data.keyword 
      ? `Start creating a blog post optimized for "${data.keyword}"`
      : 'Create an SEO-optimized blog post from scratch',
    data: {
      contentType: 'blog-post',
      step: 1,
      ...data
    }
  }),

  landingPage: (data: ContentCreationActionData): ContextualAction => ({
    id: `create-landing-${Date.now()}`,
    label: `Create Landing Page${data.title ? `: "${data.title}"` : ''}`,
    action: 'create-landing-page',
    type: 'card',
    variant: 'primary',
    description: data.keyword 
      ? `Build a high-converting landing page for "${data.keyword}"`
      : 'Create a conversion-optimized landing page',
    data: {
      contentType: 'landing-page',
      step: 1,
      ...data
    }
  }),

  article: (data: ContentCreationActionData): ContextualAction => ({
    id: `create-article-${Date.now()}`,
    label: `Write Article${data.title ? `: "${data.title}"` : ''}`,
    action: 'create-article',
    type: 'card',
    variant: 'secondary',
    description: data.keyword 
      ? `Write an in-depth article about "${data.keyword}"`
      : 'Create a comprehensive article',
    data: {
      contentType: 'article',
      step: 1,
      ...data
    }
  }),

  productPage: (data: ContentCreationActionData): ContextualAction => ({
    id: `create-product-${Date.now()}`,
    label: `Product Page${data.title ? `: "${data.title}"` : ''}`,
    action: 'create-product-page',
    type: 'card',
    variant: 'primary',
    description: data.keyword 
      ? `Create a product page optimized for "${data.keyword}"`
      : 'Build a compelling product page',
    data: {
      contentType: 'product-page',
      step: 1,
      ...data
    }
  }),

  salesPage: (data: ContentCreationActionData): ContextualAction => ({
    id: `create-sales-${Date.now()}`,
    label: `Sales Page${data.title ? `: "${data.title}"` : ''}`,
    action: 'create-sales-page',
    type: 'card',
    variant: 'primary',
    description: data.keyword 
      ? `Build a sales page targeting "${data.keyword}"`
      : 'Create a high-converting sales page',
    data: {
      contentType: 'sales-page',
      step: 1,
      ...data
    }
  })
};

// SEO and optimization actions
export const createSEOActions = {
  keywordResearch: (keyword?: string): ContextualAction => ({
    id: `keyword-research-${Date.now()}`,
    label: 'Keyword Research',
    action: 'keyword-research',
    type: 'button',
    variant: 'outline',
    description: keyword 
      ? `Find related keywords for "${keyword}"`
      : 'Research high-value keywords for your niche',
    data: { keyword }
  }),

  seoOptimization: (content?: string, keyword?: string): ContextualAction => ({
    id: `seo-optimize-${Date.now()}`,
    label: 'SEO Optimization',
    action: 'seo-optimization',
    type: 'button',
    variant: 'secondary',
    description: keyword 
      ? `Optimize content for "${keyword}"`
      : 'Analyze and improve SEO performance',
    data: { content, keyword }
  }),

  competitorAnalysis: (keyword?: string): ContextualAction => ({
    id: `competitor-analysis-${Date.now()}`,
    label: 'Competitor Analysis',
    action: 'competitor-analysis',
    type: 'button',
    variant: 'outline',
    description: keyword 
      ? `Analyze competitors for "${keyword}"`
      : 'Research your competition',
    data: { keyword }
  })
};

// Strategy and planning actions
export const createStrategyActions = {
  contentStrategy: (data?: Partial<ContentCreationActionData>): ContextualAction => ({
    id: `content-strategy-${Date.now()}`,
    label: 'Content Strategy',
    action: 'content-strategy',
    type: 'card',
    variant: 'secondary',
    description: 'Develop a comprehensive content marketing strategy',
    data
  }),

  contentCalendar: (data?: Partial<ContentCreationActionData>): ContextualAction => ({
    id: `content-calendar-${Date.now()}`,
    label: 'Content Calendar',
    action: 'content-calendar',
    type: 'button',
    variant: 'outline',
    description: 'Plan your content publishing schedule',
    data
  })
};

// Smart action generator based on conversation context
export const generateContextualActions = (
  context: {
    keywords?: string[];
    contentType?: string;
    userIntent?: string;
    conversationHistory?: any[];
  }
): ContextualAction[] => {
  const actions: ContextualAction[] = [];
  const { keywords, contentType, userIntent } = context;

  // Extract main keyword
  const mainKeyword = keywords?.[0];

  // Generate content creation actions based on context
  if (mainKeyword) {
    // Always suggest blog post as it's most versatile
    actions.push(createContentActions.blogPost({
      mainKeyword,
      keywords: keywords?.slice(0, 5),
      title: `${capitalizeFirst(mainKeyword)} - Complete Guide`
    }));

    // Add landing page if commercial intent detected
    if (userIntent?.includes('commercial') || userIntent?.includes('buy')) {
      actions.push(createContentActions.landingPage({
        mainKeyword,
        keywords: keywords?.slice(0, 3),
        title: `Best ${capitalizeFirst(mainKeyword)} Solutions`
      }));
    }

    // Add article for informational content
    if (userIntent?.includes('informational') || userIntent?.includes('learn')) {
      actions.push(createContentActions.article({
        mainKeyword,
        keywords: keywords?.slice(0, 4),
        title: `Everything You Need to Know About ${capitalizeFirst(mainKeyword)}`
      }));
    }

    // Add SEO actions
    actions.push(createSEOActions.keywordResearch(mainKeyword));
    actions.push(createSEOActions.competitorAnalysis(mainKeyword));
  }

  // Add strategy actions for general queries
  if (!mainKeyword || actions.length < 2) {
    actions.push(createStrategyActions.contentStrategy());
    actions.push(createSEOActions.keywordResearch());
  }

  return actions.slice(0, 4); // Limit to 4 actions for clean UI
};

// Utility function to capitalize first letter
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Action handlers for workflow integration
export const handleWorkflowAction = (action: string, data?: any) => {
  console.log('🔄 Handling workflow action:', action, data);
  
  switch (action) {
    case 'keyword-research':
      return {
        nextStep: 'content-planning',
        message: `Starting keyword research${data?.keyword ? ` for "${data.keyword}"` : ''}...`,
        context: { currentWorkflow: 'keyword-research', ...data }
      };
      
    case 'content-strategy':
      return {
        nextStep: 'strategy-development',
        message: 'Developing your content strategy...',
        context: { currentWorkflow: 'content-strategy', ...data }
      };
      
    case 'seo-optimization':
      return {
        nextStep: 'seo-analysis',
        message: `Analyzing SEO opportunities${data?.keyword ? ` for "${data.keyword}"` : ''}...`,
        context: { currentWorkflow: 'seo-optimization', ...data }
      };
      
    default:
      return {
        nextStep: 'general-assistance',
        message: 'Processing your request...',
        context: { currentWorkflow: 'general', action, ...data }
      };
  }
};