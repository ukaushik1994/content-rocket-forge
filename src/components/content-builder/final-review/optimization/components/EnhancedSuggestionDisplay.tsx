import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { OptimizationSuggestion } from '../types';

interface EnhancedSuggestionDisplayProps {
  suggestions: OptimizationSuggestion[];
  selectedSuggestions: string[];
  onToggleSuggestion: (suggestionId: string) => void;
  reasoning?: Record<string, string>;
  showDetailedReasoning?: boolean;
}

export const EnhancedSuggestionDisplay: React.FC<EnhancedSuggestionDisplayProps> = ({
  suggestions,
  selectedSuggestions,
  onToggleSuggestion,
  reasoning = {},
  showDetailedReasoning = false
}) => {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());

  const toggleExpanded = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId);
    } else {
      newExpanded.add(suggestionId);
    }
    setExpandedSuggestions(newExpanded);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'bg-orange-50 text-orange-700';
      case 'medium':
        return 'bg-blue-50 text-blue-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const category = suggestion.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(suggestion);
    return groups;
  }, {} as Record<string, OptimizationSuggestion[]>);

  const categoryIcons = {
    structure: <Target className="h-4 w-4" />,
    seo: <TrendingUp className="h-4 w-4" />,
    keywords: <Target className="h-4 w-4" />,
    solution: <Lightbulb className="h-4 w-4" />,
    content: <CheckCircle className="h-4 w-4" />
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-muted-foreground">No optimization suggestions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedSuggestions).map(([category, categorySuggestions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {categoryIcons[category as keyof typeof categoryIcons]}
              {category.charAt(0).toUpperCase() + category.slice(1)} Optimization
              <Badge variant="outline">{categorySuggestions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySuggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedSuggestions.includes(suggestion.id)}
                    onCheckedChange={() => onToggleSuggestion(suggestion.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(suggestion.priority)}
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          {suggestion.autoFixable && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {suggestion.impact && (
                          <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {suggestion.impact}
                          </Badge>
                        )}
                        {suggestion.effort && (
                          <Badge variant="outline" className={`text-xs ${getEffortColor(suggestion.effort)}`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {suggestion.effort}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Detailed Reasoning (Collapsible) */}
                    {(showDetailedReasoning && reasoning[suggestion.id]) && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 p-1 text-xs"
                            onClick={() => toggleExpanded(suggestion.id)}
                          >
                            {expandedSuggestions.has(suggestion.id) ? (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 mr-1" />
                            )}
                            View Reasoning
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                            <strong>Why this helps:</strong>
                            <p className="mt-1">{reasoning[suggestion.id]}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};