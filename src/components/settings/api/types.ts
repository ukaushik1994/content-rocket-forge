import { ReactNode } from 'react';

export type ApiProvider = {
  id: string;
  name: string;
  description: string;
  serviceKey: string;
  link: string;
  icon: ReactNode;
  required?: boolean;
  autoDetectable?: boolean;
};

export const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Power AI-assisted content generation, writing assistance, and keyword suggestions.',
    serviceKey: 'openai',
    link: 'https://platform.openai.com/api-keys',
    icon: null, // We'll add icons in the component
    autoDetectable: true
  },
  {
    id: 'serp',
    name: 'SERP API',
    description: 'Access competitor content analysis, keyword data, and search volume metrics.',
    serviceKey: 'serp',
    link: 'https://serpapi.com/dashboard',
    required: true,
    icon: null, // We'll add icons in the component
    autoDetectable: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Leverage Google\'s AI for enhanced content creation.',
    serviceKey: 'gemini',
    link: 'https://aistudio.google.com/app/apikey',
    icon: null, // We'll add icons in the component
    autoDetectable: true
  }
];
