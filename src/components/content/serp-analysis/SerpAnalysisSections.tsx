
import React, { useState } from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import {
  SerpSectionHeader,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpCompetitorsSection,
  SerpEntitiesSection,
  SerpHeadingsSection,
  SerpContentGapsSection
} from './index';

interface SerpAnalysisSectionsProps {
  serpData: SerpAnalysisResult;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpAnalysisSections({ serpData, onAddToContent }: SerpAnalysisSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<{
    keywords: boolean;
    questions: boolean;
    competitors: boolean;
    entities: boolean;
    headings: boolean;
    contentGaps: boolean;
  }>({
    keywords: false,
    questions: false,
    competitors: false,
    entities: false,
    headings: false,
    contentGaps: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Related Keywords Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Related Keywords" 
          expanded={expandedSections.keywords}
          onToggle={() => toggleSection('keywords')}
          variant="blue"
          description="Select keywords to include in your content"
          count={serpData?.relatedSearches?.length || 0}
        />
        
        <SerpKeywordsSection 
          serpData={serpData}
          expanded={expandedSections.keywords}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Questions Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="People Also Ask" 
          expanded={expandedSections.questions}
          onToggle={() => toggleSection('questions')}
          variant="amber"
          description="Common questions people search about this topic"
          count={serpData?.peopleAlsoAsk?.length || 0}
        />
        
        <SerpQuestionsSection 
          serpData={serpData}
          expanded={expandedSections.questions}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Entities Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Key Entities" 
          expanded={expandedSections.entities}
          onToggle={() => toggleSection('entities')}
          variant="indigo"
          description="Important entities and concepts related to this topic"
          count={serpData?.entities?.length || 0}
        />
        
        <SerpEntitiesSection 
          serpData={serpData}
          expanded={expandedSections.entities}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Headings Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Top Headings" 
          expanded={expandedSections.headings}
          onToggle={() => toggleSection('headings')}
          variant="teal"
          description="Common headings used by top-ranking content"
          count={serpData?.headings?.length || 0}
        />
        
        <SerpHeadingsSection 
          serpData={serpData}
          expanded={expandedSections.headings}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Content Gaps Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Content Gaps" 
          expanded={expandedSections.contentGaps}
          onToggle={() => toggleSection('contentGaps')}
          variant="rose"
          description="Topics competitors are missing that you can cover"
          count={serpData?.contentGaps?.length || 0}
        />
        
        <SerpContentGapsSection 
          serpData={serpData}
          expanded={expandedSections.contentGaps}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Top Ranks Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Top Ranks" 
          expanded={expandedSections.competitors}
          onToggle={() => toggleSection('competitors')}
          variant="green"
          description="Top-ranking content for this keyword"
          count={serpData?.topResults?.length || 0}
        />
        
        <SerpCompetitorsSection 
          serpData={serpData}
          expanded={expandedSections.competitors}
          onAddToContent={onAddToContent}
        />
      </div>
    </>
  );
}
