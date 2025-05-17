
import React from 'react';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tag, HelpCircle, Heading, FileSearch, FileText } from 'lucide-react';

interface SerpSelectedItemsSidebarProps {
  serpSelections: SerpSelection[];
  className?: string;
}

export const SerpSelectedItemsSidebar: React.FC<SerpSelectedItemsSidebarProps> = ({
  serpSelections,
  className = ''
}) => {
  // Filter selected items from SERP analysis
  const selectedItems = serpSelections.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-blue-900/10 to-purple-900/5 border border-white/10 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            No SERP Items Selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Select items from the SERP Analysis step to see them here.
          </p>
        </CardContent>
      </Card>
    );
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
  
  const totalCount = selectedItems.length;

  return (
    <Card className={`bg-gradient-to-br from-blue-900/10 to-purple-900/5 border border-white/10 backdrop-blur-lg sticky top-4 ${className}`}>
      <CardHeader className="pb-2 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/10">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Selected SERP Items ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-250px)] p-4">
          <div className="space-y-4">
            {/* Keywords Section */}
            {counts.keyword > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  Keywords ({counts.keyword})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {itemsByType.keyword.map((item, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                      {item.content}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Section */}
            {counts.question > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                  Questions ({counts.question})
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {itemsByType.question.map((item, i) => (
                    <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entities Section */}
            {counts.entity > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-indigo-400" />
                  Entities ({counts.entity})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {itemsByType.entity.map((item, i) => (
                    <Badge key={i} variant="outline" className="bg-indigo-900/30 border-indigo-500/30 text-xs">
                      {item.content}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Headings Section */}
            {counts.heading > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Heading className="h-3.5 w-3.5 text-teal-400" />
                  Headings ({counts.heading})
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {itemsByType.heading.map((item, i) => (
                    <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Gaps Section */}
            {counts.contentGap > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <FileSearch className="h-3.5 w-3.5 text-rose-400" />
                  Content Gaps ({counts.contentGap})
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {itemsByType.contentGap.map((item, i) => (
                    <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Ranks Section */}
            {counts.topRank > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-green-400" />
                  Top Ranks ({counts.topRank})
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {itemsByType.topRank.map((item, i) => (
                    <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
