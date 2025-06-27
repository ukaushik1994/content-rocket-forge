
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tag, HelpCircle, Heading, FileSearch, FileText, Users, Star } from 'lucide-react';

export function SelectedSerpItemsCard() {
  const { state } = useContentBuilder();
  const { serpSelections } = state;
  
  // Filter only selected items from SERP analysis
  const selectedItems = serpSelections.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    return null;
  }
  
  // Group selected items by type - handle all possible types
  const itemsByType = {
    keyword: selectedItems.filter(item => 
      item.type === 'keyword' || 
      item.type === 'keywords' || 
      item.type === 'relatedSearch' ||
      item.type === 'relatedKeyword'
    ),
    question: selectedItems.filter(item => 
      item.type === 'question' || 
      item.type === 'questions' ||
      item.type === 'peopleAlsoAsk'
    ),
    entity: selectedItems.filter(item => 
      item.type === 'entity' || 
      item.type === 'entities' ||
      item.type === 'knowledgeEntity'
    ),
    heading: selectedItems.filter(item => 
      item.type === 'heading' || 
      item.type === 'headings'
    ),
    contentGap: selectedItems.filter(item => 
      item.type === 'contentGap' || 
      item.type === 'contentGaps'
    ),
    topRank: selectedItems.filter(item => 
      item.type === 'topRank' || 
      item.type === 'competitor' ||
      item.type === 'topStories' ||
      item.type === 'topStory'
    ),
    snippet: selectedItems.filter(item => 
      item.type === 'snippet' || 
      item.type === 'featuredSnippet' ||
      item.type === 'featuredSnippets'
    ),
    multimedia: selectedItems.filter(item => 
      item.type === 'multimedia' || 
      item.type === 'image' ||
      item.type === 'video'
    )
  };
  
  // Get counts for each type
  const counts = {
    keyword: itemsByType.keyword.length,
    question: itemsByType.question.length,
    entity: itemsByType.entity.length,
    heading: itemsByType.heading.length,
    contentGap: itemsByType.contentGap.length,
    topRank: itemsByType.topRank.length,
    snippet: itemsByType.snippet.length,
    multimedia: itemsByType.multimedia.length
  };

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
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
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
                    <Star className="h-3.5 w-3.5 text-rose-400" />
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

            {/* Snippets Section */}
            {counts.snippet > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    Snippets ({counts.snippet})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.snippet.map((item, i) => (
                      <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                        {item.content}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Ranks/Stories Section */}
            {counts.topRank > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <FileSearch className="h-3.5 w-3.5 text-green-400" />
                    Top Content ({counts.topRank})
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

            {/* Multimedia Section */}
            {counts.multimedia > 0 && (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    Multimedia ({counts.multimedia})
                  </p>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                    {itemsByType.multimedia.map((item, i) => (
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
