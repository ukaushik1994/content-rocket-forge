
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Target, FileText, Tag, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface SerpAnalysisDetailsProps {
  serpData: any;
  draft: any;
  expandedSections: any;
  toggleSection: (section: string) => void;
}

export const SerpAnalysisDetails = ({ serpData, draft, expandedSections, toggleSection }: SerpAnalysisDetailsProps) => {
  const savedSerpSelections = draft.metadata?.serpSelections;
  const primaryKeywords = draft.metadata?.primaryKeywords || [];
  const secondaryKeywords = draft.metadata?.secondaryKeywords || [];
  const mainKeyword = draft.metadata?.mainKeyword;
  
  if (!serpData && !savedSerpSelections) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">SERP Analysis</h3>
          </div>
          <p className="text-muted-foreground">No SERP data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">SERP Analysis Details</h3>
          {mainKeyword && (
            <Badge variant="outline" className="ml-auto">
              Main: {mainKeyword}
            </Badge>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Primary Keywords Section */}
          {primaryKeywords.length > 0 && (
            <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-foreground">Primary Keywords ({primaryKeywords.length})</span>
                </div>
                {expandedSections.keywords ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-blue-500/10 rounded-lg p-4 space-y-3 border border-blue-500/20">
                  {primaryKeywords.map((keyword: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-500/20 rounded-md border border-blue-500/30">
                      <span className="font-medium text-foreground">{keyword}</span>
                      <Badge variant="secondary" className="bg-blue-500/30 text-blue-100">
                        Primary
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Secondary Keywords Section */}
          {secondaryKeywords.length > 0 && (
            <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-foreground">Secondary Keywords ({secondaryKeywords.length})</span>
                </div>
                {expandedSections.keywords ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-purple-500/10 rounded-lg p-4 space-y-3 border border-purple-500/20">
                  {secondaryKeywords.map((keyword: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-purple-500/20 rounded-md border border-purple-500/30">
                      <span className="font-medium text-foreground">{keyword}</span>
                      <Badge variant="secondary" className="bg-purple-500/30 text-purple-100">
                        Secondary
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Additional SERP Keywords from selections */}
          {savedSerpSelections?.keywords && savedSerpSelections.keywords.length > 0 && (
            <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-foreground">SERP Selected Keywords ({savedSerpSelections.keywords.length})</span>
                </div>
                {expandedSections.keywords ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-green-500/10 rounded-lg p-4 space-y-3 border border-green-500/20">
                  {savedSerpSelections.keywords.map((keyword: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-500/20 rounded-md border border-green-500/30">
                      <span className="font-medium text-foreground">{keyword}</span>
                      <Badge variant="secondary" className="bg-green-500/30 text-green-100">
                        SERP Selected
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Questions Section */}
          {savedSerpSelections?.questions && savedSerpSelections.questions.length > 0 && (
            <Collapsible open={expandedSections.questions} onOpenChange={() => toggleSection('questions')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-foreground">Selected Questions ({savedSerpSelections.questions.length})</span>
                </div>
                {expandedSections.questions ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-orange-500/10 rounded-lg p-4 space-y-3 border border-orange-500/20">
                  {savedSerpSelections.questions.map((question: string, idx: number) => (
                    <div key={idx} className="p-3 bg-orange-500/20 rounded-md border border-orange-500/30">
                      <p className="font-medium text-foreground">{question}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Entities Section */}
          {savedSerpSelections?.entities && savedSerpSelections.entities.length > 0 && (
            <Collapsible open={expandedSections.entities} onOpenChange={() => toggleSection('entities')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-cyan-500" />
                  <span className="font-medium text-foreground">Selected Entities ({savedSerpSelections.entities.length})</span>
                </div>
                {expandedSections.entities ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedSerpSelections.entities.map((entity: string, idx: number) => (
                      <div key={idx} className="p-3 bg-cyan-500/20 rounded-md border border-cyan-500/30">
                        <span className="font-medium text-foreground">{entity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Content Gaps Section */}
          {savedSerpSelections?.contentGaps && savedSerpSelections.contentGaps.length > 0 && (
            <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-pink-500" />
                  <span className="font-medium text-foreground">Selected Content Gaps ({savedSerpSelections.contentGaps.length})</span>
                </div>
                {expandedSections.gaps ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-pink-500/10 rounded-lg p-4 space-y-3 border border-pink-500/20">
                  {savedSerpSelections.contentGaps.map((gap: string, idx: number) => (
                    <div key={idx} className="p-3 bg-pink-500/20 rounded-md border border-pink-500/30">
                      <p className="font-medium text-foreground">{gap}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
