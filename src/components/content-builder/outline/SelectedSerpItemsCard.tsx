import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tag, HelpCircle, Heading, FileSearch, FileText } from 'lucide-react';

interface SelectedSerpItemsCardProps {
  condensed?: boolean;
}

export function SelectedSerpItemsCard({ condensed = false }: SelectedSerpItemsCardProps) {
  const { state } = useContentBuilder();
  const { serpSelections } = state;
  
  // Filter selected items from SERP analysis
  const selectedItems = serpSelections.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    return null;
  }
  
  // Group selected items by type
  const itemsByType = {
    keyword: selectedItems.filter(item => item.type === 'keyword'),
    question: selectedItems.filter(item => item.type === 'question'),
    entity: selectedItems.filter(item => item.type === 'entity'),
    heading: selectedItems.filter(item => item.type === 'heading'),
    contentGap: selectedItems.filter(item => item.type === 'contentGap'),
    topRank: selectedItems.filter(item => item.type === 'topRank')
  };
  
  // Get counts for each type
  const counts = {
    keyword: itemsByType.keyword.length,
    question: itemsByType.question.length,
    entity: itemsByType.entity.length,
    heading: itemsByType.heading.length,
    contentGap: itemsByType.contentGap.length,
    topRank: itemsByType.topRank.length
  };

  if (condensed) {
    // Render a condensed version
    return (
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-3 space-y-2">
          {counts.keyword > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="w-full flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Tag className="h-3 w-3 text-blue-400" />
                Keywords
              </div>
              {itemsByType.keyword.slice(0, 5).map((item, i) => (
                <Badge key={i} variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                  {item.content}
                </Badge>
              ))}
              {counts.keyword > 5 && (
                <Badge variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                  +{counts.keyword - 5} more
                </Badge>
              )}
            </div>
          )}

          {counts.question > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <HelpCircle className="h-3 w-3 text-purple-400" />
                Questions
              </div>
              <div className="text-xs text-muted-foreground max-h-16 overflow-y-auto">
                {itemsByType.question.slice(0, 2).map((item, i) => (
                  <div key={i} className="truncate">
                    {item.content}
                  </div>
                ))}
                {counts.question > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{counts.question - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {counts.entity > 0 && (
            <div className="flex flex-wrap gap-1">
              <div className="w-full flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Tag className="h-3 w-3 text-indigo-400" />
                Entities
              </div>
              {itemsByType.entity.slice(0, 3).map((item, i) => (
                <Badge key={i} variant="outline" className="bg-indigo-900/30 border-indigo-500/30 text-xs">
                  {item.content}
                </Badge>
              ))}
              {counts.entity > 3 && (
                <Badge variant="outline" className="bg-indigo-900/30 border-indigo-500/30 text-xs">
                  +{counts.entity - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Otherwise, render the full version
  return (
    <Card className="border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Selected from SERP Analysis ({selectedItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            The AI will use these selected items to generate your content outline:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keywords Section */}
            {counts.keyword > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-blue-400" />
                    Keywords ({counts.keyword})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {itemsByType.keyword.map((item, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions Section */}
            {counts.question > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                    Questions ({counts.question})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.question.map((item, i) => (
                      <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                        {item.content}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entities Section */}
            {counts.entity > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    Entities ({counts.entity})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {itemsByType.entity.map((item, i) => (
                      <Badge key={i} variant="outline" className="bg-indigo-900/30 border-indigo-500/30 text-xs">
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Headings Section */}
            {counts.heading > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <Heading className="h-3.5 w-3.5 text-teal-400" />
                    Headings ({counts.heading})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.heading.map((item, i) => (
                      <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                        {item.content}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Gaps Section */}
            {counts.contentGap > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <FileSearch className="h-3.5 w-3.5 text-rose-400" />
                    Content Gaps ({counts.contentGap})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.contentGap.map((item, i) => (
                      <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                        {item.content}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Ranks Section */}
            {counts.topRank > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-green-400" />
                    Top Ranks ({counts.topRank})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.topRank.map((item, i) => (
                      <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                        {item.content}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
