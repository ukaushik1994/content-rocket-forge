import { 
  FileText, 
  Mail, 
  Video, 
  Globe, 
  Layers, 
  Laugh, 
  Target,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Share2,
  MessageCircle,
  Search,
  DollarSign,
  Calendar,
  type LucideIcon 
} from 'lucide-react';

export interface PlatformConfig {
  id: string;
  name: string;
  icon?: LucideIcon;
  label?: string;
  color: string;
  bgColor?: string;
}

export const PLATFORM_ICONS: Record<string, PlatformConfig> = {
  'blog': {
    id: 'blog',
    name: 'Blog Posts',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  'blog/content': {
    id: 'blog/content',
    name: 'Blog Content',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  'content': {
    id: 'content',
    name: 'Content',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  'social': {
    id: 'social',
    name: 'Social Media',
    icon: Share2,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
  'social-media': {
    id: 'social-media',
    name: 'Social Media',
    icon: Share2,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
  'social-linkedin': {
    id: 'social-linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0077B5]',
    bgColor: 'bg-[#0077B5]/20'
  },
  'linkedin': {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0077B5]',
    bgColor: 'bg-[#0077B5]/20'
  },
  'social-twitter': {
    id: 'social-twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-foreground',
    bgColor: 'bg-foreground/20'
  },
  'twitter': {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-foreground',
    bgColor: 'bg-foreground/20'
  },
  'social-facebook': {
    id: 'social-facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/20'
  },
  'facebook': {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/20'
  },
  'social-instagram': {
    id: 'social-instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-[#E4405F]',
    bgColor: 'bg-[#E4405F]/20'
  },
  'instagram': {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-[#E4405F]',
    bgColor: 'bg-[#E4405F]/20'
  },
  'email': {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  'email-marketing': {
    id: 'email-marketing',
    name: 'Email Marketing',
    icon: Mail,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  'script': {
    id: 'script',
    name: 'Video Script',
    icon: Video,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  'video': {
    id: 'video',
    name: 'Video',
    icon: Video,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  'webinars': {
    id: 'webinars',
    name: 'Webinars',
    icon: Video,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    icon: Globe,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20'
  },
  'carousel': {
    id: 'carousel',
    name: 'Carousel',
    icon: Layers,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20'
  },
  'meme': {
    id: 'meme',
    name: 'Meme',
    icon: Laugh,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google Ads',
    icon: Target,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  'paid-ads': {
    id: 'paid-ads',
    name: 'Paid Ads',
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  'seo': {
    id: 'seo',
    name: 'SEO',
    icon: Search,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  },
  'seo/organic': {
    id: 'seo/organic',
    name: 'SEO/Organic',
    icon: Search,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  },
  'direct-outreach': {
    id: 'direct-outreach',
    name: 'Direct Outreach',
    icon: MessageCircle,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20'
  },
  'events': {
    id: 'events',
    name: 'Events',
    icon: Calendar,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  }
};

// Legacy format IDs mapping (for backward compatibility)
export const LEGACY_FORMAT_MAPPING: Record<string, string> = {
  'blog-post': 'blog',
  'social-media': 'social-linkedin',
  'email-newsletter': 'email',
  'video-script': 'script'
};

export function getPlatformConfig(formatId: string): PlatformConfig {
  // Try direct lookup
  if (PLATFORM_ICONS[formatId]) {
    return PLATFORM_ICONS[formatId];
  }
  
  // Try legacy mapping
  const mappedId = LEGACY_FORMAT_MAPPING[formatId];
  if (mappedId && PLATFORM_ICONS[mappedId]) {
    return PLATFORM_ICONS[mappedId];
  }
  
  // Fallback
  return {
    id: formatId,
    name: formatId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    icon: FileText,
    color: 'text-muted-foreground'
  };
}
