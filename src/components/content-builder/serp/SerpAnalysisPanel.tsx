import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading?: boolean;
  mainKeyword?: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => Promise<void>;
  onSerpDataChange?: (data: SerpAnalysisResult) => void;
  proposalData?: any;
}

interface SerpSection {
  key: keyof SerpAnalysisResult;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const serpSections: SerpSection[] = [
  { key: 'keywords', title: 'Keywords', description: 'Related search terms' },
  { key: 'peopleAlsoAsk', title: 'Questions', description: 'People also ask' },
  { key: 'entities', title: 'Entities', description: 'Key topics and entities' },
  { key: 'headings', title: 'Headings', description: 'Suggested content structure' },
  { key: 'contentGaps', title: 'Content Gaps', description: 'Missing content opportunities' },
  { key: 'topResults', title: 'Top Results', description: 'Competitor analysis' },
  { key: 'relatedSearches', title: 'Related Searches', description: 'Additional keywords' }
];

export const SerpAnalysisPanel: React.FC<SerpAnalysisPanelProps> = ({
  serpData,
  isLoading = false,
  mainKeyword,
  onAddToContent,
  onRetry,
  onSerpDataChange,
  proposalData
}) => {
  const { dispatch } = useContentBuilder();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['keywords', 'peopleAlsoAsk'])
  );

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const addToSelection = (type: string, content: string) => {
    if (onAddToContent) {
      onAddToContent(content, type);
    } else {
      dispatch({
        type: 'ADD_SERP_SELECTION',
        payload: {
          type,
          content,
          selected: true,
          source: 'serp_analysis'
        }
      });
    }
  };

  const renderSectionContent = (section: SerpSection) => {
    if (!serpData) return null;

    const data = serpData[section.key];
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-muted-foreground text-sm py-4 text-center">
          No {section.title.toLowerCase()} data available
        </div>
      );
    }

    const renderItems = () => {
      if (Array.isArray(data)) {
        return data.slice(0, 10).map((item: any, index: number) => {
          let content = '';
          let metadata = {};

          switch (section.key) {
            case 'keywords':
              content = typeof item === 'string' ? item : item.query || item.keyword || String(item);
              break;
            case 'peopleAlsoAsk':
              content = item.question || String(item);
              metadata = { answer: item.answer, source: item.source };
              break;
            case 'entities':
              content = item.name || String(item);
              metadata = { type: item.type, description: item.description };
              break;
            case 'headings':
              content = item.text || String(item);
              metadata = { level: item.level, subtext: item.subtext };
              break;
            case 'contentGaps':
              content = item.topic || item.description || String(item);
              metadata = { recommendation: item.recommendation, opportunity: item.opportunity };
              break;
            case 'topResults':
              content = item.title || String(item);
              metadata = { link: item.link, snippet: item.snippet, position: item.position };
              break;
            case 'relatedSearches':
              content = item.query || item.keyword || String(item);
              metadata = { volume: item.volume };
              break;
            default:
              content = String(item);
          }

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{content}</p>
                {metadata && Object.keys(metadata).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {JSON.stringify(metadata).slice(0, 100)}...
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addToSelection(section.key, content)}
                className="ml-2 h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          );
        });
      }

      return (
        <div className="text-muted-foreground text-sm py-4">
          Unexpected data format for {section.title}
        </div>
      );
    };

    return <div className="space-y-2">{renderItems()}</div>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {serpSections.map((section) => (
          <Card key={section.key} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-5 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!serpData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No SERP analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {serpSections.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        const data = serpData[section.key];
        const itemCount = Array.isArray(data) ? data.length : data ? 1 : 0;

        return (
          <Card key={section.key} className="transition-all duration-200">
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() => toggleSection(section.key)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <h3 className="text-base font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {itemCount}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                {renderSectionContent(section)}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};