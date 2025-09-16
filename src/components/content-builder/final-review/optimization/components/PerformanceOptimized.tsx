import React, { memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  type: string;
}

interface PerformanceOptimizedSuggestionProps {
  suggestion: OptimizationSuggestion;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

// Memoized suggestion item to prevent unnecessary re-renders
export const PerformanceOptimizedSuggestion = memo<PerformanceOptimizedSuggestionProps>(({ 
  suggestion, 
  isSelected, 
  onToggle 
}) => {
  const handleToggle = useCallback(() => {
    onToggle(suggestion.id);
  }, [onToggle, suggestion.id]);

  const priorityIcon = useMemo(() => {
    switch (suggestion.priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  }, [suggestion.priority]);

  const priorityColor = useMemo(() => {
    switch (suggestion.priority) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }, [suggestion.priority]);

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
      onClick={handleToggle}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {priorityIcon}
            <CardTitle className="text-sm font-medium">{suggestion.title}</CardTitle>
          </div>
          <Badge variant="secondary" className={priorityColor}>
            {suggestion.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {suggestion.category}
          </Badge>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceOptimizedSuggestion.displayName = 'PerformanceOptimizedSuggestion';

interface VirtualizedSuggestionListProps {
  suggestions: OptimizationSuggestion[];
  selectedSuggestions: string[];
  onToggleSuggestion: (id: string) => void;
  maxVisible?: number;
}

// Virtualized suggestion list for large datasets
export const VirtualizedSuggestionList = memo<VirtualizedSuggestionListProps>(({ 
  suggestions, 
  selectedSuggestions, 
  onToggleSuggestion,
  maxVisible = 10 
}) => {
  const [visibleCount, setVisibleCount] = React.useState(maxVisible);

  const visibleSuggestions = useMemo(() => 
    suggestions.slice(0, visibleCount), 
    [suggestions, visibleCount]
  );

  const hasMore = suggestions.length > visibleCount;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + maxVisible, suggestions.length));
  }, [maxVisible, suggestions.length]);

  const handleToggle = useCallback((id: string) => {
    onToggleSuggestion(id);
  }, [onToggleSuggestion]);

  return (
    <div className="space-y-3">
      {visibleSuggestions.map((suggestion) => (
        <PerformanceOptimizedSuggestion
          key={suggestion.id}
          suggestion={suggestion}
          isSelected={selectedSuggestions.includes(suggestion.id)}
          onToggle={handleToggle}
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="text-sm"
          >
            Load More ({suggestions.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
});

VirtualizedSuggestionList.displayName = 'VirtualizedSuggestionList';