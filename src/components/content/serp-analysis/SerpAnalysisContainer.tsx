
import React, { useState } from 'react';
import { Search, HelpCircle, FileText, Tag, Heading, Brain, Target, TrendingUp, DollarSign, BarChart3, Newspaper, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';
import {
  SerpSectionHeader,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpEntitiesSection,
  SerpHeadingsSection,
  SerpKnowledgeGraphSection, 
  SerpFeaturedSnippetsSection
} from './index';
import { SerpPaidAdsSection } from './SerpPaidAdsSection';
import { SerpMetricsSection } from './SerpMetricsSection';
import { SerpContentGapsSection } from './SerpContentGapsSection';
import { SerpTopStoriesSection } from './SerpTopStoriesSection';
import { SerpMultimediaSection } from './SerpMultimediaSection';

export interface SerpAnalysisContainerProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
  onSerpDataChange?: (data: SerpAnalysisResult | null) => void;
}

export function SerpAnalysisContainer({
  serpData,
  isLoading,
  mainKeyword,
  onAddToContent = () => {},
  onRetry = () => {},
  onSerpDataChange = () => {}
}: SerpAnalysisContainerProps) {
  const [expandedSections, setExpandedSections] = useState(new Set<string>(['metrics', 'keywords'])); // Default expand metrics and keywords

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

  // Add debugging for data display issues
  React.useEffect(() => {
    if (serpData) {
      console.log('🔍 SERP Data Debug:', {
        hasData: !!serpData,
        peopleAlsoAskCount: serpData.peopleAlsoAsk?.length || 0,
        featuredSnippetsCount: serpData.featuredSnippets?.length || 0,
        entitiesCount: serpData.entities?.length || 0,
        headingsCount: serpData.headings?.length || 0,
        contentGapsCount: serpData.contentGaps?.length || 0,
        keywordsCount: serpData.keywords?.length || 0,
        isMockData: serpData.isMockData
      });
      
      // Log first few items for debugging
      if (serpData.peopleAlsoAsk?.length > 0) {
        console.log('📝 People Also Ask Sample:', serpData.peopleAlsoAsk.slice(0, 2));
      }
      if (serpData.featuredSnippets?.length > 0) {
        console.log('🎯 Featured Snippets Sample:', serpData.featuredSnippets.slice(0, 2));
      }
    }
  }, [serpData]);

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          <p className="ml-3 text-white/70">Loading SERP data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!serpData) {
    return (
      <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Search className="h-8 w-8 text-white/30 mb-2" />
          <p className="text-white/50">No SERP data available</p>
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      id: 'metrics',
      title: 'SEO Metrics',
      icon: BarChart3,
      description: 'Volume, competition, and opportunity analysis',
      count: 4, // Always show 4 metrics
      variant: 'indigo' as const,
      component: (expanded: boolean) => (
        <SerpMetricsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'content-gaps',
      title: 'Content Gaps',
      icon: Target,
      description: 'Opportunities competitors are missing',
      count: serpData?.contentGaps?.length || 0,
      variant: 'rose' as const,
      component: (expanded: boolean) => (
        <SerpContentGapsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'paid-ads',
      title: 'Paid Ads',
      icon: DollarSign,
      description: 'Commercial competition analysis',
      count: serpData?.commercialSignals?.hasAds ? 2 : 0,
      variant: 'green' as const,
      component: (expanded: boolean) => (
        <SerpPaidAdsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'keywords',
      title: 'Keywords',
      icon: Tag,
      description: 'Related keywords and search terms',
      count: serpData?.keywords?.length || 0,
      variant: 'blue' as const,
      component: (expanded: boolean) => (
        <SerpKeywordsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'questions',
      title: 'Questions',
      icon: HelpCircle,
      description: 'People also ask questions',
      count: serpData?.peopleAlsoAsk?.length || 0,
      variant: 'amber' as const,
      component: (expanded: boolean) => (
        <SerpQuestionsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'featured-snippets',
      title: 'Featured Snippets',
      icon: Target,
      description: 'Snippet optimization opportunities',
      count: serpData?.featuredSnippets?.length || 0,
      variant: 'green' as const,
      component: (expanded: boolean) => (
        <SerpFeaturedSnippetsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'top-stories',
      title: 'Top Stories',
      icon: Newspaper,
      description: 'Recent news and trending content',
      count: 3, // Mock count for demo
      variant: 'blue' as const,
      component: (expanded: boolean) => (
        <SerpTopStoriesSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'multimedia',
      title: 'Multimedia',
      icon: Camera,
      description: 'Image and video opportunities',
      count: serpData?.multimediaOpportunities?.reduce((acc, m) => acc + m.count, 0) || 0,
      variant: 'purple' as const,
      component: (expanded: boolean) => (
        <SerpMultimediaSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'entities',
      title: 'Entities',
      icon: FileText,
      description: 'Key entities and concepts',
      count: serpData?.entities?.length || 0,
      variant: 'indigo' as const,
      component: (expanded: boolean) => (
        <SerpEntitiesSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'headings',
      title: 'Headings',
      icon: Heading,
      description: 'Suggested content headings',
      count: serpData?.headings?.length || 0,
      variant: 'teal' as const,
      component: (expanded: boolean) => (
        <SerpHeadingsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    },
    {
      id: 'knowledge-graph',
      title: 'Knowledge Graph',
      icon: Brain,
      description: 'Entity information and related topics',
      count: serpData?.knowledgeGraph ? 1 : 0,
      variant: 'purple' as const,
      component: (expanded: boolean) => (
        <SerpKnowledgeGraphSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    }
  ];

  return (
    <div className="space-y-1">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-medium">
              SERP Analysis: <span className="text-neon-purple">{mainKeyword}</span>
            </h3>
          </div>
          {serpData?.isMockData && (
            <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              Using mock data
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/20 border border-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-white/5 last:border-b-0">
            <SerpSectionHeader
              title={section.title}
              expanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              variant={section.variant}
              description={section.description}
              count={section.count}
            />
            {section.component(expandedSections.has(section.id))}
          </div>
        ))}
      </div>
    </div>
  );
}
