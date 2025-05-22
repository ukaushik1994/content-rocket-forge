import { Book, Images, Image, Twitter, Linkedin, Facebook, Mail, FileText, BarChart, Video } from 'lucide-react';
import React from 'react';
import { ContentFormat } from './index'; 

// This file now uses the ContentFormat interface from the index file
export const alternativeContentFormats: ContentFormat[] = [
  { 
    id: 'social-twitter', 
    name: 'Twitter/X Post', 
    description: 'Short-form content under 280 characters',
    icon: Twitter
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
    id: 'email', 
    name: 'Email Newsletter', 
    description: 'Email-ready content with subject line',
    icon: Mail
  },
  { 
    id: 'script', 
    name: 'Video/Podcast Script', 
    description: 'Script for audio or video content',
    icon: Video
  },
  { 
    id: 'infographic', 
    name: 'Infographic Content', 
    description: 'Structured content for visual presentation',
    icon: BarChart
  },
  { 
    id: 'blog', 
    name: 'Blog Summary', 
    description: 'Condensed version of the content',
    icon: FileText
  },
  { 
    id: 'glossary', 
    name: 'Glossary', 
    description: 'List of definitions and terminology',
    icon: Book
  },
  { 
    id: 'carousel', 
    name: 'Carousel', 
    description: 'Content split into sequential slides',
    icon: Images
  },
  { 
    id: 'meme', 
    name: 'Meme', 
    description: 'Humorous content with viral potential',
    icon: Image
  }
];

// We'll keep these functions for backwards compatibility
// but they should now return the proper ContentFormat type
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

// Changed this function to return a function that creates the icon element
// instead of returning JSX directly, since this is a .ts file not .tsx
export const getFormatIcon = (formatId: string) => {
  const IconComponent = getFormatIconComponent(formatId);
  // Return a function that when called will create the React element
  return () => React.createElement(IconComponent, { className: "h-4 w-4" });
};

// Updated to return ContentFormat type
export const getFormatByIdOrDefault = (formatId: string | undefined): ContentFormat => {
  // Handle undefined or null formatId
  if (!formatId) {
    return {
      id: 'unknown',
      name: 'Unknown Format',
      description: 'Format information not available',
      icon: FileText
    };
  }
  
  // Find the format in our predefined list
  const foundFormat = alternativeContentFormats.find(format => format.id === formatId);
  
  // Return the found format or create a default one with safe string operations
  return foundFormat || {
    id: formatId,
    name: formatId.charAt(0).toUpperCase() + formatId.slice(1),
    description: 'Custom content format',
    icon: FileText
  };
};
