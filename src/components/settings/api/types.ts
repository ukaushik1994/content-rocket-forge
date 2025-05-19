
export interface ApiProviderConfig {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'oauth' | 'credentials';
  docsUrl?: string;
  signupUrl?: string;
  required?: boolean;
  serviceKey?: string;
  autoDetectable?: boolean;
}

export interface ApiProviderWithCategory extends ApiProviderConfig {
  category: 'ai' | 'serp' | 'other';
}

export const API_PROVIDERS: ApiProviderWithCategory[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo, and more',
    required: true,
    type: 'standard',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    signupUrl: 'https://platform.openai.com/signup',
    serviceKey: 'openai',
    category: 'ai',
    autoDetectable: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude and Claude Instant models',
    type: 'standard',
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    signupUrl: 'https://console.anthropic.com/signup',
    serviceKey: 'anthropic',
    category: 'ai',
    autoDetectable: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI models and services',
    type: 'standard',
    docsUrl: 'https://ai.google.dev/docs',
    signupUrl: 'https://makersuite.google.com/app/apikey',
    serviceKey: 'gemini',
    category: 'ai',
    autoDetectable: true
  },
  {
    id: 'serpapi',
    name: 'SERP API',
    description: 'Search engine results data',
    type: 'standard',
    docsUrl: 'https://serpapi.com/docs',
    signupUrl: 'https://serpapi.com/users/sign_up',
    serviceKey: 'serpapi',
    category: 'serp',
    autoDetectable: true
  },
  {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'Enterprise SEO data platform',
    type: 'credentials',
    docsUrl: 'https://dataforseo.com/apis',
    signupUrl: 'https://app.dataforseo.com/register',
    serviceKey: 'dataforseo',
    category: 'serp',
    autoDetectable: false
  },
  {
    id: 'ahrefs',
    name: 'Ahrefs',
    description: 'SEO toolset for backlinks and site audits',
    type: 'standard',
    docsUrl: 'https://ahrefs.com/api/documentation',
    signupUrl: 'https://ahrefs.com/api/pricing',
    serviceKey: 'ahrefs',
    category: 'other',
    autoDetectable: false
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'Competitive research and keyword analysis',
    type: 'standard',
    docsUrl: 'https://developer.semrush.com/api/',
    signupUrl: 'https://www.semrush.com/apis/',
    serviceKey: 'semrush',
    category: 'other',
    autoDetectable: false
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Website traffic and user behavior analytics',
    type: 'oauth',
    docsUrl: 'https://developers.google.com/analytics/devguides/reporting/core/v4',
    serviceKey: 'google_analytics',
    category: 'other',
    autoDetectable: false
  }
];
