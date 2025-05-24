import React, { useState } from 'react';
import { Search, HelpCircle, FileText, Tag, Heading, Brain, Target } from 'lucide-react';
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
  SerpKnowledgeGraphSection, SerpFeaturedSnippetsSection
} from './index';

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
  const [expandedSections, setExpandedSections] = useState(new Set<string>());

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

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
      id: 'keywords',
      title: 'Keywords',
      icon: Tag,
      description: 'Related keywords and search terms',
      count: serpData?.keywords?.length || 0,
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
      component: (expanded: boolean) => (
        <SerpQuestionsSection
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
      component: (expanded: boolean) => (
        <SerpHeadingsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    }
  ];

  const enhancedSections = [
    {
      id: 'knowledge-graph',
      title: 'Knowledge Graph',
      icon: Brain,
      description: 'Entity information and related topics',
      count: serpData?.knowledgeGraph ? 1 : 0,
      component: (expanded: boolean) => (
        <SerpKnowledgeGraphSection
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
      component: (expanded: boolean) => (
        <SerpFeaturedSnippetsSection
          serpData={serpData}
          expanded={expanded}
          onAddToContent={onAddToContent}
        />
      )
    }
  ];

  const allSections = [...sections, ...enhancedSections];

  return (
    <div className="space-y-6">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-medium">
              SERP Analysis: <span className="text-neon-purple">{mainKeyword}</span>
            </h3>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0">
          <TabsTrigger value="analysis" className="w-full rounded-none data-[state=active]:bg-white/5">
            Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4">
            {allSections.map((section) => (
              <SerpSectionHeader
                key={section.id}
                {...section}
                expanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
