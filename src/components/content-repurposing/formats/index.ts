
import {
  FileText,
  Bird,
  Linkedin,
  Facebook,
  Instagram,
  Film,
  Mail,
  Ticket,
  Radio,
  ListTree,
  LucideIcon
} from 'lucide-react';

// Content format definitions
export interface ContentFormat {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const contentFormats: ContentFormat[] = [
  {
    id: 'blog',
    name: 'Blog Post',
    description: 'Long-form article optimized for SEO',
    icon: FileText
  },
  {
    id: 'social-twitter',
    name: 'Twitter Post',
    description: 'Short-form content for Twitter (X)',
    icon: Bird
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn Post',
    description: 'Professional content for LinkedIn',
    icon: Linkedin
  },
  {
    id: 'social-facebook',
    name: 'Facebook Post',
    description: 'Engaging content for Facebook',
    icon: Facebook
  },
  {
    id: 'social-instagram',
    name: 'Instagram Caption',
    description: 'Captivating captions for Instagram',
    icon: Instagram
  },
  {
    id: 'script',
    name: 'Video Script',
    description: 'Script for videos or podcasts',
    icon: Film
  },
  {
    id: 'email',
    name: 'Email Newsletter',
    description: 'Content formatted for email campaigns',
    icon: Mail
  },
  {
    id: 'meme',
    name: 'Meme',
    description: 'Humorous content format',
    icon: Ticket
  },
  {
    id: 'carousel',
    name: 'Carousel Post',
    description: 'Multi-slide content for social platforms',
    icon: ListTree
  }
];

export const getFormatByIdOrDefault = (id: string): ContentFormat => {
  return contentFormats.find(format => format.id === id) || {
    id: 'generic',
    name: 'Generic Content',
    description: 'Standard content format',
    icon: FileText
  };
};

// Function to get the icon component for a format
export const getFormatIconComponent = (formatId: string): LucideIcon => {
  const format = getFormatByIdOrDefault(formatId);
  return format.icon;
};
