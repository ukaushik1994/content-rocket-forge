import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tag, HelpCircle, Heading, FileSearch, FileText, Users, Star, Search } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';

interface RepositorySerpDisplayProps {
  serpSelections: SerpSelection[];
}

export const RepositorySerpDisplay: React.FC<RepositorySerpDisplayProps> = ({ serpSelections }) => {
  console.log('RepositorySerpDisplay - Received serpSelections:', serpSelections);
  console.log('RepositorySerpDisplay - serpSelections type:', typeof serpSelections);
  console.log('RepositorySerpDisplay - serpSelections array?:', Array.isArray(serpSelections));
  
  // Filter only selected items
  const selectedItems = serpSelections.filter(item => item.selected);
  console.log('RepositorySerpDisplay - Filtered selected items:', selectedItems);
  console.log('RepositorySerpDisplay - Selected items count:', selectedItems.length);
  
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
    <Card className="glass-card bg-background/40 backdrop-blur-sm border-white/10 rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          SERP Analysis Results ({selectedItems.length} items)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Selected research data used to create this content
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keywords Section */}
          {counts.keyword > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Keywords ({counts.keyword})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemsByType.keyword.map((item, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 text-xs">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {counts.question > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Questions ({counts.question})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.question.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-purple-500/10 border border-purple-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entities Section */}
          {counts.entity > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium">Entities ({counts.entity})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemsByType.entity.map((item, i) => (
                  <Badge key={i} variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Headings Section */}
          {counts.heading > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heading className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium">Headings ({counts.heading})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.heading.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-teal-500/10 border border-teal-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Gaps Section */}
          {counts.contentGap > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-rose-400" />
                <span className="text-sm font-medium">Content Gaps ({counts.contentGap})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.contentGap.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-rose-500/10 border border-rose-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Snippets Section */}
          {counts.snippet > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">Snippets ({counts.snippet})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.snippet.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Ranks/Stories Section */}
          {counts.topRank > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Top Content ({counts.topRank})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.topRank.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-green-500/10 border border-green-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multimedia Section */}
          {counts.multimedia > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium">Multimedia ({counts.multimedia})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {itemsByType.multimedia.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-cyan-500/10 border border-cyan-500/20 rounded p-2">
                    {typeof item.content === 'string' ? item.content : String(item.content)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};