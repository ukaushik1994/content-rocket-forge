
import { ApiProviderConfig } from '@/components/api-credentials/types';

export const API_PROVIDERS: ApiProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other AI models',
    required: true,
    isPrimary: true,
    category: 'ai',
    type: 'standard',
    docsUrl: 'https://platform.openai.com/docs',
    signupUrl: 'https://platform.openai.com/signup'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude AI models',
    required: false,
    category: 'ai',
    type: 'standard',
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    signupUrl: 'https://console.anthropic.com/signup'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s AI models',
    required: false,
    category: 'ai',
    type: 'standard',
    docsUrl: 'https://ai.google.dev/docs',
    signupUrl: 'https://makersuite.google.com/app/apikey'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral AI models',
    required: false,
    category: 'ai',
    type: 'standard',
    docsUrl: 'https://docs.mistral.ai/',
    signupUrl: 'https://console.mistral.ai/user/sign-up/'
  },
  {
    id: 'serpapi',
    name: 'SERP API',
    description: 'Search engine results data',
    required: false,
    category: 'serp',
    type: 'standard',
    docsUrl: 'https://serpapi.com/docs',
    signupUrl: 'https://serpapi.com/users/sign_up'
  },
  {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'Enterprise SEO data platform',
    required: false,
    category: 'serp',
    type: 'credentials',
    docsUrl: 'https://dataforseo.com/apis',
    signupUrl: 'https://app.dataforseo.com/register'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing',
    required: false,
    category: 'other',
    type: 'standard',
    docsUrl: 'https://stripe.com/docs/api',
    signupUrl: 'https://dashboard.stripe.com/register'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery service',
    required: false,
    category: 'other',
    type: 'standard',
    docsUrl: 'https://docs.sendgrid.com/api-reference',
    signupUrl: 'https://signup.sendgrid.com/'
  }
];
