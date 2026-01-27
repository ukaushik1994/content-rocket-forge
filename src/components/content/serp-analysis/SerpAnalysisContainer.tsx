import React, { useState } from 'react';
import { Search, HelpCircle, FileText, Tag, Heading, Brain, Target, TrendingUp, DollarSign, BarChart3, Newspaper, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';
import {
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
import { EnhancedSerpSectionHeader } from './enhanced/EnhancedSerpSectionHeader';
import { EnhancedSerpKeywordsSection } from './enhanced/EnhancedSerpKeywordsSection';
import { FloatingSelectionToolbar } from './enhanced/FloatingSelectionToolbar';
import { SelectionPreviewPanel } from './enhanced/SelectionPreviewPanel';

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
  const [expandedSections, setExpandedSections] = useState(new Set<string>(['metrics', 'keywords']));
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

  const handleToggleSelection = (content: string, type: string) => {
    const key = `${type}:${content}`;
    const newSelectedItems = new Set(selectedItems);
    
    if (newSelectedItems.has(key)) {
      newSelectedItems.delete(key);
    } else {
      newSelectedItems.add(key);
    }
    
    setSelectedItems(newSelectedItems);
  };

  const handleLoadMore = async (sectionId: string) => {
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }));
    
    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoadingStates(prev => ({ ...prev, [sectionId]: false }));
  };

  const handleRefreshSection = async (sectionId: string) => {
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }));
    
    // Simulate refresh - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoadingStates(prev => ({ ...prev, [sectionId]: false }));
  };

  const getSelectedItemsArray = () => {
    return Array.from(selectedItems).map(key => {
      const [type, ...contentParts] = key.split(':');
      const content = contentParts.join(':');
      return { content, type, source: 'SerpAPI' };
    });
  };

  const handleAddAllSelected = () => {
    getSelectedItemsArray().forEach(item => {
      onAddToContent(item.content, item.type);
    });
    setSelectedItems(new Set());
  };

  const handleClearSelected = () => {
    setSelectedItems(new Set());
  };

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
      count: 4,
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
      id: 'keywords',
      title: 'Keywords',
      icon: Tag,
      description: 'Related keywords and search terms',
      count: serpData?.keywords?.length || 0,
      variant: 'blue' as const,
      hasMore: true,
      component: (expanded: boolean) => (
        <EnhancedSerpKeywordsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
          onToggleSelection={handleToggleSelection}
          selectedItems={selectedItems}
          onLoadMore={() => handleLoadMore('keywords')}
          isLoading={loadingStates.keywords}
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
      hasMore: true,
      component: (expanded: boolean) => (
        <SerpContentGapsSection
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
      hasMore: true,
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
      count: (serpData as any)?.topStories?.length || (serpData as any)?.top_stories?.length || 0,
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

  const getSelectedCountForSection = (sectionId: string) => {
    return Array.from(selectedItems).filter(key => 
      key.startsWith(`${sectionId}:`) || 
      (sectionId === 'keywords' && key.startsWith('keyword:'))
    ).length;
  };

  return (
    <div className="space-y-1 relative">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-medium">
              SERP Analysis: <span className="text-neon-purple">{mainKeyword}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {serpData?.isMockData && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                Using mock data
              </div>
            )}
            {selectedItems.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewPanel(true)}
                className="border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
              >
                Preview ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/20 border border-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-white/5 last:border-b-0">
            <EnhancedSerpSectionHeader
              title={section.title}
              expanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              variant={section.variant}
              description={section.description}
              count={section.count}
              isLoading={loadingStates[section.id]}
              hasMore={section.hasMore}
              onLoadMore={() => handleLoadMore(section.id)}
              onRefresh={() => handleRefreshSection(section.id)}
              apiSource="SerpAPI"
              dataFreshness={serpData?.isMockData ? 'cached' : 'fresh'}
              selectedCount={getSelectedCountForSection(section.id)}
            />
            {section.component(expandedSections.has(section.id))}
          </div>
        ))}
      </div>

      {/* Floating Toolbar */}
      <FloatingSelectionToolbar
        selectedCount={selectedItems.size}
        onAddAllSelected={handleAddAllSelected}
        onClearSelected={handleClearSelected}
        onPreviewSelected={() => setShowPreviewPanel(true)}
        onExportSelected={() => console.log('Export selected')}
        onClose={() => setSelectedItems(new Set())}
        isVisible={selectedItems.size > 0}
      />

      {/* Preview Panel */}
      <SelectionPreviewPanel
        selections={getSelectedItemsArray()}
        isOpen={showPreviewPanel}
        onClose={() => setShowPreviewPanel(false)}
        onRemoveItem={(content, type) => {
          const key = `${type}:${content}`;
          const newSelectedItems = new Set(selectedItems);
          newSelectedItems.delete(key);
          setSelectedItems(newSelectedItems);
        }}
        onGenerateOutline={() => {
          handleAddAllSelected();
          setShowPreviewPanel(false);
          // Navigate to outline generation
        }}
      />
    </div>
  );
}
