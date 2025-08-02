
import { RocketIcon, Search, BarChart3, FileText, Repeat, MessageSquare } from 'lucide-react';

export interface ModuleData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: any;
  route: string;
  cta: string;
  secondaryCta?: string;
  secondaryRoute?: string;
  theme: {
    gradient: string;
    glowColor: string;
    textGradient: string;
  };
  searchPlaceholder: string;
}

export const modules: ModuleData[] = [
  {
    id: 'content-builder',
    title: 'Content Builder',
    subtitle: 'AI-Powered Creation',
    description: 'Generate high-ranking, conversion-driven content by integrating real-time SERP data and keyword optimization.',
    features: ['SERP Integration', 'AI Writing', 'SEO Optimization', 'Content Templates'],
    icon: RocketIcon,
    route: '/content-builder',
    cta: 'Start Creating',
    secondaryCta: 'View Templates',
    secondaryRoute: '/templates',
    theme: {
      gradient: 'from-neon-purple via-neon-blue to-neon-pink',
      glowColor: 'from-neon-purple/30 via-neon-blue/20 to-neon-pink/30',
      textGradient: 'from-neon-purple to-neon-blue'
    },
    searchPlaceholder: 'What content would you like to create?'
  },
  {
    id: 'research-suite',
    title: 'Research Suite',
    subtitle: 'Keyword Intelligence',
    description: 'Discover high-value keywords and analyze competitor content strategies with advanced research tools.',
    features: ['Keyword Research', 'Competitor Analysis', 'Topic Clusters', 'Search Trends'],
    icon: Search,
    route: '/research/keyword-research',
    cta: 'Research Keywords',
    secondaryCta: 'Analyze Competitors',
    secondaryRoute: '/research/competitor-analysis',
    theme: {
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'from-emerald-400/30 via-teal-500/20 to-cyan-600/30',
      textGradient: 'from-emerald-400 to-teal-500'
    },
    searchPlaceholder: 'Search for keywords and topics...'
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    subtitle: 'Performance Insights',
    description: 'Track your content performance with detailed analytics, ranking data, and conversion metrics.',
    features: ['Ranking Tracking', 'Traffic Analytics', 'Conversion Metrics', 'ROI Reports'],
    icon: BarChart3,
    route: '/analytics',
    cta: 'View Analytics',
    secondaryCta: 'Generate Report',
    secondaryRoute: '/analytics/reports',
    theme: {
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      glowColor: 'from-purple-400/30 via-pink-500/20 to-red-500/30',
      textGradient: 'from-purple-400 to-pink-500'
    },
    searchPlaceholder: 'Search analytics and metrics...'
  },
  {
    id: 'content-repository',
    title: 'Content Repository',
    subtitle: 'Content Management',
    description: 'Organize and manage your content library with advanced filtering, tagging, and collaboration features.',
    features: ['Content Library', 'Version Control', 'Team Collaboration', 'Smart Organization'],
    icon: FileText,
    route: '/repository',
    cta: 'Manage Content',
    secondaryCta: 'Browse Library',
    secondaryRoute: '/repository/library',
    theme: {
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      glowColor: 'from-blue-500/30 via-indigo-500/20 to-purple-600/30',
      textGradient: 'from-blue-500 to-indigo-500'
    },
    searchPlaceholder: 'Search your content library...'
  },
  {
    id: 'content-repurposing',
    title: 'Content Repurposing',
    subtitle: 'Multi-Format Creation',
    description: 'Transform your content into multiple formats - from blog posts to social media, videos to infographics.',
    features: ['Format Conversion', 'Social Media Posts', 'Video Scripts', 'Email Campaigns'],
    icon: Repeat,
    route: '/content-repurposing',
    cta: 'Repurpose Content',
    secondaryCta: 'View Formats',
    secondaryRoute: '/content-repurposing/formats',
    theme: {
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      glowColor: 'from-amber-400/30 via-orange-500/20 to-red-500/30',
      textGradient: 'from-amber-400 to-orange-500'
    },
    searchPlaceholder: 'What content do you want to repurpose?'
  },
  {
    id: 'ai-chat',
    title: 'AI Chat Assistant',
    subtitle: 'Conversational AI',
    description: 'Get instant help with content strategy, writing assistance, and SEO guidance from your AI companion.',
    features: ['Content Strategy', 'Writing Help', 'SEO Guidance', '24/7 Support'],
    icon: MessageSquare,
    route: '/ai-chat',
    cta: 'Chat with AI',
    secondaryCta: 'Quick Help',
    secondaryRoute: '/ai-chat/quick-help',
    theme: {
      gradient: 'from-pink-400 via-purple-500 to-indigo-600',
      glowColor: 'from-pink-400/30 via-purple-500/20 to-indigo-600/30',
      textGradient: 'from-pink-400 to-purple-500'
    },
    searchPlaceholder: 'Ask me anything about content...'
  }
];
