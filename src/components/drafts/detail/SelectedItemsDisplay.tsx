
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, HelpCircle, Target, Search, User, Lightbulb } from 'lucide-react';
import { SerpSelectionStats } from '@/types/serp-metrics';

interface SelectedItemsDisplayProps {
  selectionStats: SerpSelectionStats;
}

export const SelectedItemsDisplay = ({ selectionStats }: SelectedItemsDisplayProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'featuredSnippet': return <Target className="h-4 w-4" />;
      case 'relatedSearch': return <Search className="h-4 w-4" />;
      case 'entity': return <User className="h-4 w-4" />;
      case 'heading': return <Lightbulb className="h-4 w-4" />;
      case 'contentGap': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-amber-500/20 text-amber-300';
      case 'featuredSnippet': return 'bg-green-500/20 text-green-300';
      case 'relatedSearch': return 'bg-blue-500/20 text-blue-300';
      case 'entity': return 'bg-purple-500/20 text-purple-300';
      case 'heading': return 'bg-orange-500/20 text-orange-300';
      case 'contentGap': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const categoryItems = [
    { type: 'questions', label: 'Questions', count: selectionStats.byType.questions },
    { type: 'featuredSnippets', label: 'Featured Snippets', count: selectionStats.byType.featuredSnippets },
    { type: 'relatedSearches', label: 'Related Searches', count: selectionStats.byType.relatedSearches },
    { type: 'entities', label: 'Entities', count: selectionStats.byType.entities },
    { type: 'headings', label: 'Headings', count: selectionStats.byType.headings },
    { type: 'contentGaps', label: 'Content Gaps', count: selectionStats.byType.contentGaps }
  ];

  const getSelectionsForType = (type: string) => {
    const typeMap: Record<string, string> = {
      'questions': 'question',
      'featuredSnippets': 'featuredSnippet', 
      'relatedSearches': 'relatedSearch',
      'entities': 'entity',
      'headings': 'heading',
      'contentGaps': 'contentGap'
    };
    
    return selectionStats.selections.filter(s => s.type === typeMap[type]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SERP Selected Items</span>
          <Badge variant="outline">
            {selectionStats.totalSelected} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {categoryItems.filter(item => item.count > 0).map((item) => (
            <div key={item.type} className="bg-muted/50 p-2 rounded text-center">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="font-semibold">{item.count}</div>
            </div>
          ))}
        </div>

        {/* Detailed Selections by Category */}
        {categoryItems.filter(item => item.count > 0).map((category) => {
          const selections = getSelectionsForType(category.type);
          const isExpanded = expandedCategories.has(category.type);
          
          return (
            <div key={category.type} className="border rounded-lg">
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => toggleCategory(category.type)}
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(category.type.slice(0, -1))}
                  <span>{category.label}</span>
                  <Badge className={getTypeColor(category.type.slice(0, -1))}>
                    {category.count}
                  </Badge>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {selections.map((selection, index) => (
                    <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                      <div className="font-medium truncate">{selection.content}</div>
                      {selection.source && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Source: {selection.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {selectionStats.totalSelected === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No SERP items were selected during analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
};
