
import { Book, Images, Image, Twitter, Linkedin, Facebook, Mail, FileText, BarChart, Video } from 'lucide-react';
import React from 'react';

export interface ContentFormatDefinition {
  id: string;
  name: string;
  description: string;
  icon?: React.ComponentType<any>;
}

export const contentFormats: ContentFormatDefinition[] = [
  { id: 'social-twitter', name: 'Twitter/X Post', description: 'Short-form content under 280 characters' },
  { id: 'social-linkedin', name: 'LinkedIn Post', description: 'Professional content for LinkedIn' },
  { id: 'social-facebook', name: 'Facebook Post', description: 'Engaging content for Facebook' },
  { id: 'email', name: 'Email Newsletter', description: 'Email-ready content with subject line' },
  { id: 'script', name: 'Video/Podcast Script', description: 'Script for audio or video content' },
  { id: 'infographic', name: 'Infographic Content', description: 'Structured content for visual presentation' },
  { id: 'blog', name: 'Blog Summary', description: 'Condensed version of the content' },
  { id: 'glossary', name: 'Glossary', description: 'List of definitions and terminology' },
  { id: 'carousel', name: 'Carousel', description: 'Content split into sequential slides' },
  { id: 'meme', name: 'Meme', description: 'Humorous content with viral potential' }
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
    case 'infographic':
      return BarChart;
    case 'blog':
    default:
      return FileText;
  }
};

export const getFormatIcon = (formatId: string) => {
  const IconComponent = getFormatIconComponent(formatId);
  return <IconComponent className="h-4 w-4" />;
};

export const getFormatByIdOrDefault = (formatId: string): ContentFormatDefinition => {
  return contentFormats.find(format => format.id === formatId) || {
    id: formatId,
    name: formatId.charAt(0).toUpperCase() + formatId.slice(1),
    description: 'Custom content format'
  };
};
