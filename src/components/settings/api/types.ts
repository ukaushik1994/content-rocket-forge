
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
  subcategory?: string;
}

import { 
  Key, 
  MessageSquare, 
  Brain, 
  Search, 
  Mail, 
  BarChart3,
  TrendingUp,
  Binary,
  Image,
  Video
} from 'lucide-react';

export const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple AI models through a single API gateway',
    serviceKey: 'openrouter',
    icon: Brain,
    link: 'https://openrouter.ai/keys',
    required: false,
    category: 'AI Services'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Advanced AI models for content generation and analysis',
    serviceKey: 'openai',
    icon: Brain,
    link: 'https://platform.openai.com/api-keys',
    required: false,
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
    id: 'mistral',
    name: 'Mistral AI',
    description: 'European AI provider with advanced language models',
    serviceKey: 'mistral',
    icon: Binary,
    link: 'https://console.mistral.ai/api-keys/',
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
    id: 'resend',
    name: 'Resend',
    description: 'Modern email API for transactional and marketing emails',
    serviceKey: 'resend',
    icon: Mail,
    link: 'https://resend.com/api-keys',
    required: false,
    category: 'Communication'
  },
  // Image & Video Gen subcategory
  {
    id: 'openai_image',
    name: 'OpenAI GPT-Image',
    description: 'Generate and edit images using DALL-E and GPT-4 Vision',
    serviceKey: 'openai_image',
    icon: Image,
    link: 'https://platform.openai.com/api-keys',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  },
  {
    id: 'gemini_image',
    name: 'Google Gemini Image',
    description: 'Multimodal image generation with Gemini',
    serviceKey: 'gemini_image',
    icon: Image,
    link: 'https://aistudio.google.com/app/apikey',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  },
  {
    id: 'lmstudio_image',
    name: 'LM Studio (Image)',
    description: 'Local image generation models',
    serviceKey: 'lmstudio_image',
    icon: Image,
    link: 'https://lmstudio.ai/',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  },
  // Video Generation
  {
    id: 'runway_video',
    name: 'Runway ML',
    description: 'AI-powered video generation and editing',
    serviceKey: 'runway_video',
    icon: Video,
    link: 'https://runwayml.com/api/',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  },
  {
    id: 'kling_video',
    name: 'Kling AI',
    description: 'Advanced video generation with Kling models',
    serviceKey: 'kling_video',
    icon: Video,
    link: 'https://klingai.com/',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  },
  {
    id: 'replicate_video',
    name: 'Replicate',
    description: 'Run open-source video models via API',
    serviceKey: 'replicate_video',
    icon: Video,
    link: 'https://replicate.com/account/api-tokens',
    required: false,
    category: 'AI Services',
    subcategory: 'Image & Video Gen'
  }
];
