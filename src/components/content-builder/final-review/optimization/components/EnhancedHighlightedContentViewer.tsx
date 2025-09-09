import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { ContentHighlight, HighlightAnalysisResult } from '@/services/contentHighlightingService';

interface EnhancedHighlightedContentViewerProps {
  analysisResult: HighlightAnalysisResult;
  selectedHighlights: string[];
  onHighlightToggle: (highlightId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const EnhancedHighlightedContentViewer: React.FC<EnhancedHighlightedContentViewerProps> = ({
  analysisResult,
  selectedHighlights,
  onHighlightToggle,
  onSelectAll,
  onClearAll
}) => {
  const [filterType, setFilterType] = useState<ContentHighlight['type'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ContentHighlight['priority'] | 'all'>('all');
  const [showLegend, setShowLegend] = useState(true);
  
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

  const getHighlightColor = (type: ContentHighlight['type'], priority: ContentHighlight['priority'], isSelected: boolean) => {
    const baseColors = {
      'seo': 'bg-green-200 border-green-300 hover:bg-green-300',
      'structure': 'bg-orange-200 border-orange-300 hover:bg-orange-300',
      'solution': 'bg-blue-200 border-blue-300 hover:bg-blue-300',
      'ai-detection': 'bg-purple-200 border-purple-300 hover:bg-purple-300',
      'serp': 'bg-yellow-200 border-yellow-300 hover:bg-yellow-300'
    };

    const intensityClass = priority === 'high' ? 'opacity-90' : priority === 'medium' ? 'opacity-70' : 'opacity-50';
    const selectedClass = isSelected ? 'ring-2 ring-primary ring-offset-1' : '';
    
    return `${baseColors[type]} ${intensityClass} ${selectedClass}`;
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

      const isSelected = selectedHighlights.includes(highlight.id);

      // Add highlighted text
      elements.push(
        <TooltipProvider key={`highlight-${highlight.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-flex items-center gap-1 px-1 py-0.5 rounded-sm border cursor-pointer transition-all duration-200
                  ${getHighlightColor(highlight.type, highlight.priority, isSelected)}
                `}
                onClick={() => onHighlightToggle(highlight.id)}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                <span>{highlight.text}</span>
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
                  Click to {isSelected ? 'deselect' : 'select'} this improvement
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
      {/* Selection Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedHighlights.length} of {highlights.length} improvements selected
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onSelectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={onClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Legend */}
      {showLegend && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Content Improvements ({filteredHighlights.length} shown)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className="gap-1"
              >
                {showLegend ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showLegend ? 'Hide' : 'Show'} Legend
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Type</label>
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
                <label className="text-xs font-medium mb-1 block">Priority</label>
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

            {/* Type Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(highlightsByType).map(([type, typeHighlights]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as ContentHighlight['type'])}
                  className={`flex items-center gap-2 text-xs p-2 rounded border transition-colors ${
                    filterType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <div className={`w-3 h-3 rounded ${getHighlightColor(type as ContentHighlight['type'], 'medium', false).split(' ')[0]}`} />
                  <span>{getTypeLabel(type as ContentHighlight['type'])}</span>
                  <Badge variant="outline" className="text-xs">
                    {typeHighlights.length}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlighted Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content with Interactive Highlights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on highlighted areas to select them for optimization. Selected highlights will show a checkmark.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <div className="pr-4">
              {renderHighlightedContent()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};