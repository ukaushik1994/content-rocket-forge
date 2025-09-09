import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Bot, 
  TrendingUp, 
  Lightbulb, 
  Target,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface SuggestionCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact?: 'high' | 'medium' | 'low';
    category: string;
  }>;
}

interface OptimizationSuggestionsPanelProps {
  suggestionCategories: SuggestionCategory[];
  selectedSuggestions: string[];
  onToggleSuggestion: (suggestionId: string) => void;
  onSelectAllInCategory: (categoryId: string) => void;
  onSelectAllHighPriority: () => void;
  onClearAll: () => void;
  totalSuggestionCount: number;
}

export const OptimizationSuggestionsPanel: React.FC<OptimizationSuggestionsPanelProps> = ({
  suggestionCategories,
  selectedSuggestions,
  onToggleSuggestion,
  onSelectAllInCategory,
  onSelectAllHighPriority,
  onClearAll,
  totalSuggestionCount
}) => {

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const selectionProgress = totalSuggestionCount > 0 ? (selectedSuggestions.length / totalSuggestionCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Selection Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedSuggestions.length} / {totalSuggestionCount}
              </span>
            </div>
            <Progress value={selectionProgress} className="h-2" />
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onSelectAllHighPriority}>
                Select High Priority
              </Button>
              <Button size="sm" variant="outline" onClick={onClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions by Category */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {suggestionCategories.map((category) => (
            <Card key={category.id} className="border-l-4 border-l-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {category.suggestions.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {category.suggestions.filter(s => selectedSuggestions.includes(s.id)).length} selected
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectAllInCategory(category.id)}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.suggestions.map((suggestion) => {
                  const isSelected = selectedSuggestions.includes(suggestion.id);
                  
                  return (
                    <div 
                      key={suggestion.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/50 border-border'
                      }`}
                      onClick={() => onToggleSuggestion(suggestion.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSuggestion(suggestion.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </Badge>
                          {suggestion.impact && (
                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                              {suggestion.impact} impact
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {suggestionCategories.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No optimization suggestions available. Your content looks great!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};