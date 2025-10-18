import { LucideIcon, BookOpen, Globe } from 'lucide-react';

export interface WebsiteProvider {
  id: string;
  name: string;
  description: string;
  provider: 'wordpress' | 'wix';
  icon: LucideIcon;
  documentationLink: string;
  category: string;
}

export const WEBSITE_PROVIDERS: WebsiteProvider[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Connect your WordPress site for automatic blog publishing',
    provider: 'wordpress',
    icon: BookOpen,
    documentationLink: 'https://developer.wordpress.org/rest-api/reference/posts/',
    category: 'Content Management'
  },
  {
    id: 'wix',
    name: 'Wix',
    description: 'Connect your Wix website for seamless content publishing',
    provider: 'wix',
    icon: Globe,
    documentationLink: 'https://dev.wix.com/docs/rest/articles/getting-started',
    category: 'Content Management'
  }
];