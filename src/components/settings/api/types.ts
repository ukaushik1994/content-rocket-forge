
import { LucideIcon } from 'lucide-react';

export interface ApiProvider {
  id: string;
  name: string;
  description: string;
  serviceKey: string;
  icon: LucideIcon;
  link: string;
  required: boolean;
  category?: string;
}

import { 
  Key, 
  MessageSquare, 
  Brain, 
  Search, 
  Mail, 
  Phone, 
  CreditCard, 
  BarChart3,
  TrendingUp 
} from 'lucide-react';

export const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Advanced AI models for content generation and analysis',
    serviceKey: 'openai',
    icon: Brain,
    link: 'https://platform.openai.com/api-keys',
    required: true,
    category: 'AI Services'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Constitutional AI for safe and helpful content creation',
    serviceKey: 'anthropic',
    icon: MessageSquare,
    link: 'https://console.anthropic.com/account/keys',
    required: false,
    category: 'AI Services'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI for diverse content tasks',
    serviceKey: 'gemini',
    icon: Brain,
    link: 'https://aistudio.google.com/app/apikey',
    required: false,
    category: 'AI Services'
  },
  {
    id: 'serp',
    name: 'SERP API',
    description: 'Search Engine Results Page data for SEO analysis',
    serviceKey: 'serp',
    icon: Search,
    link: 'https://serpapi.com/manage-api-key',
    required: true,
    category: 'SEO & Analytics'
  },
  {
    id: 'serpstack',
    name: 'Serpstack',
    description: 'Alternative SERP data provider for comprehensive search analysis',
    serviceKey: 'serpstack',
    icon: Search,
    link: 'https://serpstack.com/dashboard',
    required: false,
    category: 'SEO & Analytics'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website traffic and user behavior analytics',
    serviceKey: 'google-analytics',
    icon: BarChart3,
    link: 'https://console.cloud.google.com/apis/credentials',
    required: false,
    category: 'SEO & Analytics'
  },
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    description: 'Search performance and indexing data',
    serviceKey: 'google-search-console',
    icon: TrendingUp,
    link: 'https://console.cloud.google.com/apis/credentials',
    required: false,
    category: 'SEO & Analytics'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    serviceKey: 'sendgrid',
    icon: Mail,
    link: 'https://app.sendgrid.com/settings/api_keys',
    required: false,
    category: 'Communication'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS, voice, and video communication APIs',
    serviceKey: 'twilio',
    icon: Phone,
    link: 'https://console.twilio.com/project/api-keys',
    required: false,
    category: 'Communication'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    serviceKey: 'stripe',
    icon: CreditCard,
    link: 'https://dashboard.stripe.com/apikeys',
    required: false,
    category: 'Payments'
  }
];
