
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit, Bar, Eye, Archive } from 'lucide-react';

interface ContentCardProps {
  item: ContentItemType;
  onEdit: () => void;
  onView: () => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onArchive: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onEdit,
  onView,
  onAnalyze,
  onPublish,
  onArchive
}) => {
  const getExcerpt = (content: string | undefined) => {
    if (!content) return '';
    return content.substring(0, 120) + (content.length > 120 ? '...' : '');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Card className="overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} />
            <ScoreBadge score={item.seo_score || 0} />
          </div>
          <h3 className="font-semibold line-clamp-1 mr-4">{item.title}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAnalyze}>
              <Bar className="mr-2 h-4 w-4" />
              <span>Analyze</span>
            </DropdownMenuItem>
            {item.status === 'draft' && (
              <DropdownMenuItem onClick={onPublish}>
                <span className="mr-2">📤</span>
                <span>Publish</span>
              </DropdownMenuItem>
            )}
            {item.status !== 'archived' && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {getExcerpt(item.content)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex flex-wrap gap-1">
          {item.keywords?.slice(0, 3).map((keyword, i) => (
            <span
              key={i}
              className="inline-flex text-xs px-1.5 py-0.5 bg-secondary/50 rounded text-secondary-foreground"
            >
              {keyword}
            </span>
          ))}
          {(item.keywords?.length || 0) > 3 && (
            <span className="inline-flex text-xs px-1.5 py-0.5 bg-secondary/30 rounded text-secondary-foreground">
              +{item.keywords!.length - 3}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(item.updated_at)}
        </div>
      </CardFooter>
    </Card>
  );
};
