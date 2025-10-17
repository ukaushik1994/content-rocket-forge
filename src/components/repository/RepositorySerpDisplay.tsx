import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tag, HelpCircle, Heading, FileSearch, FileText, Users, Star, Search } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';

interface RepositorySerpDisplayProps {
  serpSelections: SerpSelection[];
}

export const RepositorySerpDisplay: React.FC<RepositorySerpDisplayProps> = ({ serpSelections }) => {
  // Safety check: ensure serpSelections is an array
  if (!Array.isArray(serpSelections)) {
    return null;
  }
  
  // Filter only selected items
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedItems.length} items selected from research
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keywords Section */}
        {counts.keyword > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Keywords ({counts.keyword})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {itemsByType.keyword.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
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
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Questions ({counts.question})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.question.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
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
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Entities ({counts.entity})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {itemsByType.entity.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
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
              <Heading className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Headings ({counts.heading})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.heading.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
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
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Content Gaps ({counts.contentGap})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.contentGap.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
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
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Snippets ({counts.snippet})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.snippet.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
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
              <FileSearch className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Top Content ({counts.topRank})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.topRank.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
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
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Multimedia ({counts.multimedia})</span>
            </div>
            <div className="space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
              {itemsByType.multimedia.map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded p-2">
                  {typeof item.content === 'string' ? item.content : String(item.content)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};