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
  type LucideIcon 
} from 'lucide-react';

export interface PlatformConfig {
  id: string;
  name: string;
  icon?: LucideIcon;
  label?: string;
  color: string;
}

export const PLATFORM_ICONS: Record<string, PlatformConfig> = {
  'blog': {
    id: 'blog',
    name: 'Blog Posts',
    icon: FileText,
    color: 'text-blue-400'
  },
  'social-linkedin': {
    id: 'social-linkedin',
    name: 'LinkedIn',
    label: 'in',
    color: 'text-[#0077B5]'
  },
  'social-twitter': {
    id: 'social-twitter',
    name: 'Twitter',
    label: '𝕏',
    color: 'text-foreground'
  },
  'social-facebook': {
    id: 'social-facebook',
    name: 'Facebook',
    label: 'f',
    color: 'text-[#1877F2]'
  },
  'social-instagram': {
    id: 'social-instagram',
    name: 'Instagram',
    label: 'ig',
    color: 'text-[#E4405F]'
  },
  'email': {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'text-purple-400'
  },
  'script': {
    id: 'script',
    name: 'Video Script',
    icon: Video,
    color: 'text-red-400'
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    icon: Globe,
    color: 'text-cyan-400'
  },
  'carousel': {
    id: 'carousel',
    name: 'Carousel',
    icon: Layers,
    color: 'text-amber-400'
  },
  'meme': {
    id: 'meme',
    name: 'Meme',
    icon: Laugh,
    color: 'text-pink-400'
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google Ads',
    icon: Target,
    color: 'text-green-400'
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
