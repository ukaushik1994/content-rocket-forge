import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Search,
  Bot,
  TrendingUp
} from 'lucide-react';
import { ContentHighlight, HighlightAnalysisResult } from '@/services/contentHighlightingService';
import { HighlightBatchActions } from './HighlightBatchActions';

interface HighlightedContentViewerProps {
  analysisResult: HighlightAnalysisResult;
  selectedSuggestions: string[];
  onHighlightClick?: (highlight: ContentHighlight) => void;
}

export const HighlightedContentViewer: React.FC<HighlightedContentViewerProps> = ({
  analysisResult,
  selectedSuggestions,
  onHighlightClick
}) => {
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ContentHighlight['type'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ContentHighlight['priority'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { highlights, originalContent } = analysisResult;

  // Filter highlights based on selected filters
  const filteredHighlights = highlights.filter(highlight => {
    if (filterType !== 'all' && highlight.type !== filterType) return false;
    if (filterPriority !== 'all' && highlight.priority !== filterPriority) return false;
    return true;
  });

  // Group highlights by type for the legend
  const highlightsByType = filteredHighlights.reduce((acc, highlight) => {
    if (!acc[highlight.type]) acc[highlight.type] = [];
    acc[highlight.type].push(highlight);
    return acc;
  }, {} as Record<string, ContentHighlight[]>);

  const getHighlightColor = (type: ContentHighlight['type'], priority: ContentHighlight['priority']) => {
    const baseColors = {
      'seo': 'bg-green-200 border-green-300 hover:bg-green-300',
      'structure': 'bg-orange-200 border-orange-300 hover:bg-orange-300',
      'solution': 'bg-blue-200 border-blue-300 hover:bg-blue-300',
      'ai-detection': 'bg-purple-200 border-purple-300 hover:bg-purple-300',
      'serp': 'bg-yellow-200 border-yellow-300 hover:bg-yellow-300'
    };

    const intensityClass = priority === 'high' ? 'opacity-90' : priority === 'medium' ? 'opacity-70' : 'opacity-50';
    
    return `${baseColors[type]} ${intensityClass}`;
  };

  const getTypeIcon = (type: ContentHighlight['type']) => {
    const icons = {
      'seo': Search,
      'structure': Lightbulb,
      'solution': Target,
      'ai-detection': Bot,
      'serp': TrendingUp
    };
    
    const Icon = icons[type];
    return Icon ? <Icon className="w-4 h-4" /> : <Info className="w-4 h-4" />;
  };

  const getTypeLabel = (type: ContentHighlight['type']) => {
    const labels = {
      'seo': 'SEO & Keywords',
      'structure': 'Content Structure',
      'solution': 'Solution Integration',
      'ai-detection': 'AI Humanization',
      'serp': 'SERP Integration'
    };
    
    return labels[type] || type;
  };

  const getQuickFixSuggestions = (highlight: ContentHighlight): string[] => {
    switch (highlight.type) {
      case 'seo':
        return [
          'Add relevant keywords naturally to this section',
          'Ensure keyword density is appropriate (1-3%)',
          'Consider using semantic variations of your target keywords'
        ];
      case 'structure':
        return [
          'Break long paragraphs into shorter, scannable chunks',
          'Add subheadings to improve content organization',
          'Use bullet points or numbered lists for better readability'
        ];
      case 'solution':
        return [
          'Mention your product/service naturally in this context',
          'Add a subtle call-to-action if appropriate',
          'Link to relevant product pages or features'
        ];
      case 'ai-detection':
        return [
          'Add more personal experiences or specific examples',
          'Include unique insights or opinions',
          'Use more conversational language and contractions'
        ];
      case 'serp':
        return [
          'Incorporate data from top-ranking pages',
          'Add relevant statistics or recent information',
          'Address common questions from search results'
        ];
      default:
        return ['Review and optimize this section based on the suggestion'];
    }
  };

  const renderHighlightedContent = () => {
    if (filteredHighlights.length === 0) {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{originalContent}</p>;
    }

    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    // Sort filtered highlights by start index
    const sortedHighlights = [...filteredHighlights].sort((a, b) => a.startIndex - b.startIndex);

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        const textBefore = originalContent.substring(lastIndex, highlight.startIndex);
        if (textBefore) {
          elements.push(
            <span key={`text-${index}-before`}>
              {textBefore}
            </span>
          );
        }
      }

      // Add highlighted text
      elements.push(
        <TooltipProvider key={`highlight-${highlight.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-block px-1 py-0.5 rounded-sm border cursor-pointer transition-all duration-200
                  ${getHighlightColor(highlight.type, highlight.priority)}
                  ${selectedHighlightId === highlight.id ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
                onClick={() => {
                  setSelectedHighlightId(highlight.id);
                  onHighlightClick?.(highlight);
                }}
              >
                {highlight.text}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(highlight.type)}
                  <span className="font-medium text-sm">{highlight.suggestion.title}</span>
                  <Badge variant="outline">
                    {highlight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {highlight.suggestion.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Category: {highlight.suggestion.category}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text after last highlight
    if (lastIndex < originalContent.length) {
      const textAfter = originalContent.substring(lastIndex);
      if (textAfter) {
        elements.push(
          <span key="text-after">
            {textAfter}
          </span>
        );
      }
    }

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {elements}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-primary">{highlights.length}</div>
          <div className="text-xs text-muted-foreground">Total Issues</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-red-600">{highlights.filter(h => h.priority === 'high').length}</div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-yellow-600">{highlights.filter(h => h.priority === 'medium').length}</div>
          <div className="text-xs text-muted-foreground">Medium Priority</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-blue-600">{Object.keys(highlightsByType).length}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </Card>
      </div>

      {/* Filters and Legend */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Optimization Areas ({filteredHighlights.length} of {highlights.length} shown)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              Filters
              {showFilters ? '▼' : '▶'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          {showFilters && (
            <div className="space-y-3 mb-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Filter by Type</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded"
                  >
                    <option value="all">All Types</option>
                    <option value="seo">SEO & Keywords</option>
                    <option value="structure">Content Structure</option>
                    <option value="solution">Solution Integration</option>
                    <option value="ai-detection">AI Humanization</option>
                    <option value="serp">SERP Integration</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Filter by Priority</label>
                  <select 
                    value={filterPriority} 
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { setFilterType('all'); setFilterPriority('all'); }}
                >
                  Clear Filters
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setFilterPriority('high')}
                >
                  Show High Priority Only
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {Object.entries(highlightsByType).map(([type, typeHighlights]) => (
              <button
                key={type}
                onClick={() => setFilterType(type as ContentHighlight['type'])}
                className={`flex items-center gap-2 text-xs p-2 rounded border transition-colors ${
                  filterType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <div className={`w-3 h-3 rounded ${getHighlightColor(type as ContentHighlight['type'], 'medium').split(' ')[0]}`} />
                <span>{getTypeLabel(type as ContentHighlight['type'])} ({typeHighlights.length})</span>
              </button>
            ))}
          </div>
          
          {filteredHighlights.length < highlights.length && (
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              Showing {filteredHighlights.length} of {highlights.length} highlights. Adjust filters to see more.
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Click on highlighted areas to see detailed improvement suggestions and quick fixes
          </p>
        </CardContent>
      </Card>

      {/* Highlighted Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content with Optimization Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="pr-4">
              {renderHighlightedContent()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Highlight Details */}
      {selectedHighlightId && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Improvement Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedHighlight = filteredHighlights.find(h => h.id === selectedHighlightId);
              if (!selectedHighlight) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedHighlight.type)}
                    <span className="font-medium">{selectedHighlight.suggestion.title}</span>
                    <Badge variant="outline">{selectedHighlight.priority} priority</Badge>
                    <Badge variant="secondary">{getTypeLabel(selectedHighlight.type)}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {selectedHighlight.suggestion.description}
                  </p>
                  
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs font-medium mb-1">Highlighted Text:</p>
                    <p className="text-sm italic">"{selectedHighlight.text.trim()}"</p>
                  </div>

                  {/* Quick Fix Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Quick Fix Ideas:</p>
                    <div className="bg-background border rounded-lg p-3 space-y-2">
                      {getQuickFixSuggestions(selectedHighlight).map((fix, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{fix}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedHighlightId(null)}
                    >
                      Close Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedHighlight.text);
                        // toast.success('Text copied to clipboard');
                      }}
                    >
                      Copy Text
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Batch Actions */}
      <HighlightBatchActions
        highlights={highlights}
        onHighlightToggle={(highlightId, visible) => {
          console.log('Toggle highlight:', highlightId, visible);
        }}
        onBulkAction={(action, highlightIds) => {
          console.log('Bulk action:', action, highlightIds);
        }}
      />
    </div>
  );
};