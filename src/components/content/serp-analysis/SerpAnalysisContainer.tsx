import React, { useState, useEffect } from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpOverviewSection } from './serp-analysis/SerpOverviewSection';
import { SerpKeywordsSection } from './serp-analysis/SerpKeywordsSection';
import { SerpQuestionsSection } from './serp-analysis/SerpQuestionsSection';
import { SerpEntitiesSection } from './serp-analysis/SerpEntitiesSection';
import { SerpHeadingsSection } from './serp-analysis/SerpHeadingsSection';
import { SerpContentGapsSection } from './serp-analysis/SerpContentGapsSection';
import { SerpCompetitorsSection } from './serp-analysis/SerpCompetitorsSection';
import { SerpSectionHeader } from './serp-analysis/SerpSectionHeader';

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
  onAddToContent,
  onRetry,
  onSerpDataChange
}: SerpAnalysisContainerProps) {
  const [data, setData] = useState<SerpAnalysisResult | null>(serpData);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    keywords: false,
    questions: false,
    entities: false,
    headings: false,
    contentGaps: false,
    competitors: false
  });

  useEffect(() => {
    setData(serpData);
    if (onSerpDataChange) {
      onSerpDataChange(serpData);
    }
  }, [serpData, onSerpDataChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-lg text-muted-foreground animate-pulse">
        Analyzing search results...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-lg font-semibold text-muted-foreground mb-2">No data found</p>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Retry Analysis
          </button>
        )}
      </div>
    );
  }

  const handleToggleSection = (sectionKey: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <div className="space-y-6">
      {/* SERP Overview Section */}
      <div>
        <SerpSectionHeader 
          title="SERP Overview"
          expanded={expandedSections.overview}
          onToggle={() => handleToggleSection('overview')}
          variant="blue"
          description="Search landscape analysis"
        />
        {expandedSections.overview && (
          <SerpOverviewSection serpData={data} />
        )}
      </div>

      {/* Keywords & Related Searches */}
      <div>
        <SerpSectionHeader 
          title="Keywords & Related Searches"
          expanded={expandedSections.keywords}
          onToggle={() => handleToggleSection('keywords')}
          variant="green"
          description="Keyword opportunities"
          count={data?.keywords?.length || 0}
        />
        {expandedSections.keywords && (
          <SerpKeywordsSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>

      {/* People Also Ask (FAQs) */}
      <div>
        <SerpSectionHeader 
          title="Frequently Asked Questions"
          expanded={expandedSections.questions}
          onToggle={() => handleToggleSection('questions')}
          variant="amber"
          description="Popular questions from search results"
          count={data?.peopleAlsoAsk?.length || 0}
        />
        {expandedSections.questions && (
          <SerpQuestionsSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>

      {/* Entities & Topics */}
      <div>
        <SerpSectionHeader 
          title="Entities & Topics"
          expanded={expandedSections.entities}
          onToggle={() => handleToggleSection('entities')}
          variant="indigo"
          description="Key concepts and entities"
          count={data?.entities?.length || 0}
        />
        {expandedSections.entities && (
          <SerpEntitiesSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>

      {/* Headings & Structure */}
      <div>
        <SerpSectionHeader 
          title="Content Structure"
          expanded={expandedSections.headings}
          onToggle={() => handleToggleSection('headings')}
          variant="teal"
          description="Common heading patterns"
          count={data?.headings?.length || 0}
        />
        {expandedSections.headings && (
          <SerpHeadingsSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>

      {/* Content Gaps */}
      <div>
        <SerpSectionHeader 
          title="Content Opportunities"
          expanded={expandedSections.contentGaps}
          onToggle={() => handleToggleSection('contentGaps')}
          variant="rose"
          description="Missing content opportunities"
          count={data?.contentGaps?.length || 0}
        />
        {expandedSections.contentGaps && (
          <SerpContentGapsSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>

      {/* Top Competitors */}
      <div>
        <SerpSectionHeader 
          title="Top Competitors"
          expanded={expandedSections.competitors}
          onToggle={() => handleToggleSection('competitors')}
          variant="purple"
          description="Leading competitors analysis"
          count={data?.competitors?.length || 0}
        />
        {expandedSections.competitors && (
          <SerpCompetitorsSection 
            serpData={data} 
            expanded={true}
            onAddToContent={onAddToContent}
          />
        )}
      </div>
    </div>
  );
}
