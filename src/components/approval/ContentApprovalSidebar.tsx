
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContentApprovalSidebarProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
}

export const ContentApprovalSidebar: React.FC<ContentApprovalSidebarProps> = ({
  contentItems,
  selectedContent,
  onSelectContent
}) => {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm">Pending Approval ({contentItems.length})</h3>
      </div>
      <ScrollArea className="h-[calc(100%-3rem)]">
        <CardContent className="p-0">
          {contentItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                selectedContent?.id === item.id && "bg-muted"
              )}
              onClick={() => onSelectContent(item)}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium line-clamp-2">{item.title}</h4>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>
                  {item.updated_at ? (
                    `Updated ${formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}`
                  ) : 'Recently updated'}
                </span>
                <Badge variant="outline" className="ml-2">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
          
          {contentItems.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No content items pending approval
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
