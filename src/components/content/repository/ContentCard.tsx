import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';
import { OptimizationBadge } from './card/OptimizationBadge';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Edit, BarChart2, Archive, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ContentCardProps {
  item: ContentItemType;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select the card if clicking on a button or dropdown
    if (
      e.target instanceof Element && 
      (e.target.closest('button') || e.target.closest('[role="menu"]'))
    ) {
      return;
    }
    onSelect();
  };
  
  return (
    <TooltipProvider>
      <Card
        className={`p-4 cursor-pointer hover:shadow-md transition-all ${
          isSelected ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={item.status} />
            <ScoreBadge score={item.seo_score || 0} />
            {(item as any).pending_optimizations_count > 0 && (
              <OptimizationBadge count={(item as any).pending_optimizations_count} />
            )}
          </div>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAnalyze}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Analyze
            </DropdownMenuItem>
            {item.status === 'draft' && (
              <DropdownMenuItem onClick={onPublish}>
                <span className="text-xs mr-2">📤</span>
                Publish
              </DropdownMenuItem>
            )}
            {item.status !== 'archived' && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h3 className="font-medium text-base mb-1 line-clamp-2">{item.title}</h3>
      
      {item.keywords && item.keywords.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {item.keywords.slice(0, 3).map((keyword, i) => (
            <span
              key={i}
              className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/30 rounded"
            >
              {keyword}
            </span>
          ))}
          {item.keywords.length > 3 && (
            <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/10 rounded">
              +{item.keywords.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        Updated {formatDate(item.updated_at)}
      </div>
      </Card>
    </TooltipProvider>
  );
};
