
import { Twitter, Linkedin, Facebook, Mail, FileText, BarChart, Video, Images, Image, Book, Presentation, FileAudio } from 'lucide-react';
import React from 'react';

export type FormatCategory = 'social' | 'document' | 'visual' | 'audio-video';

export interface ContentFormatDefinition {
  id: string;
  name: string;
  description: string;
  category: FormatCategory;
  icon?: React.ComponentType<any>;
}

export const formatCategories: Record<FormatCategory, { name: string; color: string }> = {
  'social': { 
    name: 'Social Media', 
    color: 'from-blue-400 to-indigo-500' 
  },
  'document': { 
    name: 'Documents', 
    color: 'from-emerald-400 to-cyan-500' 
  },
  'visual': { 
    name: 'Visual Content', 
    color: 'from-neon-purple to-neon-pink' 
  },
  'audio-video': { 
    name: 'Audio & Video', 
    color: 'from-amber-500 to-orange-600' 
  }
};

export const contentFormats: ContentFormatDefinition[] = [
  { id: 'social-twitter', name: 'Twitter/X Post', description: 'Short-form content under 280 characters', category: 'social' },
  { id: 'social-linkedin', name: 'LinkedIn Post', description: 'Professional content for LinkedIn', category: 'social' },
  { id: 'social-facebook', name: 'Facebook Post', description: 'Engaging content for Facebook', category: 'social' },
  { id: 'email', name: 'Email Newsletter', description: 'Email-ready content with subject line', category: 'document' },
  { id: 'script', name: 'Video Script', description: 'Script for video content', category: 'audio-video' },
  { id: 'podcast', name: 'Podcast Script', description: 'Script for audio content', category: 'audio-video' },
  { id: 'infographic', name: 'Infographic', description: 'Structured content for visual presentation', category: 'visual' },
  { id: 'blog', name: 'Blog Summary', description: 'Condensed version of the content', category: 'document' },
  { id: 'glossary', name: 'Glossary', description: 'List of definitions and terminology', category: 'document' },
  { id: 'carousel', name: 'Image Carousel', description: 'Content split into sequential slides', category: 'visual' },
  { id: 'meme', name: 'Social Meme', description: 'Humorous content with viral potential', category: 'visual' }
];

export const getFormatIconComponent = (formatId: string) => {
  switch (formatId) {
    case 'glossary':
      return Book;
    case 'carousel':
      return Images;
    case 'meme':
      return Image;
    case 'social-twitter':
      return Twitter;
    case 'social-linkedin':
      return Linkedin;
    case 'social-facebook': 
      return Facebook;
    case 'email':
      return Mail;
    case 'script':
      return Video;
    case 'podcast':
      return FileAudio;
    case 'infographic':
      return BarChart;
    case 'blog':
      return FileText;
    default:
      return FileText;
  }
};

// Changed this function to return a function that creates the icon element
// instead of returning JSX directly, since this is a .ts file not .tsx
export const getFormatIcon = (formatId: string) => {
  const IconComponent = getFormatIconComponent(formatId);
  // Return a function that when called will create the React element
  return () => React.createElement(IconComponent, { className: "h-4 w-4" });
};

export const getFormatByIdOrDefault = (formatId: string): ContentFormatDefinition => {
  return contentFormats.find(format => format.id === formatId) || {
    id: formatId,
    name: formatId.charAt(0).toUpperCase() + formatId.slice(1),
    description: 'Custom content format',
    category: 'document' // Default category
  };
};

export const getFormatsByCategory = (category: FormatCategory): ContentFormatDefinition[] => {
  return contentFormats.filter(format => format.category === category);
};

export const getCategoryColor = (category: FormatCategory): string => {
  return formatCategories[category]?.color || 'from-gray-400 to-gray-600';
};

export const getAllCategories = (): FormatCategory[] => {
  return Object.keys(formatCategories) as FormatCategory[];
};
