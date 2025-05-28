
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, Zap, Target, FileText, Search, Wrench } from 'lucide-react';
import { QualityCheckSuggestion } from '../hooks/useContentQualityIntegration';

interface EnhancedSuggestionSectionProps {
  title: string;
  suggestions: QualityCheckSuggestion[];
  selectedSuggestions: string[];
  onToggleSuggestion: (id: string) => void;
  showCategory?: boolean;
}

export const EnhancedSuggestionSection: React.FC<EnhancedSuggestionSectionProps> = ({
  title,
  suggestions,
  selectedSuggestions,
  onToggleSuggestion,
  showCategory = true
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structure': return <FileText className="h-3 w-3" />;
      case 'seo': return <Search className="h-3 w-3" />;
      case 'keywords': return <Target className="h-3 w-3" />;
      case 'solution': return <Zap className="h-3 w-3" />;
      case 'content': return <Info className="h-3 w-3" />;
      default: return <Wrench className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'structure': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'seo': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'keywords': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'solution': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'content': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'major': return <Info className="h-4 w-4 text-amber-500" />;
      case 'minor': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'major': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'minor': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const selectedCount = suggestions.filter(s => selectedSuggestions.includes(s.id)).length;
  const selectionPercentage = suggestions.length > 0 ? (selectedCount / suggestions.length) * 100 : 0;

  if (suggestions.length === 0) {
    return (
      <Card className="bg-background/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
            <p className="text-sm text-muted-foreground">All checks passed!</p>
            <p className="text-xs text-muted-foreground mt-1">No optimization needed in this category</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getTypeIcon(suggestions[0]?.type)}
            {title}
            <Badge variant="outline" className="ml-2">
              {suggestions.length}
            </Badge>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {selectedCount}/{suggestions.length} selected
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="space-y-1">
            <Progress value={selectionPercentage} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Selection progress: {Math.round(selectionPercentage)}%
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-40">
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-border/30 hover:bg-background/50 transition-colors"
              >
                <Checkbox
                  checked={selectedSuggestions.includes(suggestion.id)}
                  onCheckedChange={() => onToggleSuggestion(suggestion.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium text-foreground">{suggestion.title}</h4>
                    <div className="flex gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTypeColor(suggestion.type)}`}
                      >
                        {suggestion.type}
                      </Badge>
                      {showCategory && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(suggestion.category)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(suggestion.category)}
                            {suggestion.category}
                          </div>
                        </Badge>
                      )}
                      {suggestion.autoFixable && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                          Auto-fix
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                  {suggestion.checklistItem && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic">
                      Checklist: {suggestion.checklistItem}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
