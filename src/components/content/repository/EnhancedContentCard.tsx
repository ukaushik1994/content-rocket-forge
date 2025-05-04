
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Edit, BarChart2, Archive, Trash, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedContentCardProps {
  item: ContentItemType;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const EnhancedContentCard: React.FC<EnhancedContentCardProps> = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
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
  
  // Estimate reading time based on content length (average reading speed: 200 words per minute)
  const estimateReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? `${minutes} min read` : '< 1 min read';
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
  
  // Calculate content preview (first few words of content)
  const getContentPreview = () => {
    if (!item.content) return '';
    const words = item.content.split(/\s+/).slice(0, 20).join(' ');
    return words + (item.content.split(/\s+/).length > 20 ? '...' : '');
  };
  
  return (
    <Card
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 group ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
      } animate-fade-in`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <ScoreBadge score={item.seo_score || 0} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
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
      
      <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">{item.title}</h3>
      
      {/* Content preview */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 group-hover:line-clamp-3 transition-all">
        {getContentPreview() || 'No content preview available'}
      </p>
      
      {/* Keywords section with improved styling */}
      {item.keywords && item.keywords.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {item.keywords.slice(0, 3).map((keyword, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/30 rounded hover:bg-secondary/40 transition-colors cursor-help"
                  >
                    {keyword}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Used as SEO keyword</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {item.keywords.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/10 rounded cursor-help">
                    +{item.keywords.length - 3}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{item.keywords.slice(3).join(', ')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      
      {/* Content stats with visual elements */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/30"></span>
          {item.content ? `~${item.content.split(/\s+/).length} words` : 'No content'}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary/40"></span>
          {item.content ? estimateReadingTime(item.content) : 'N/A'}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          Updated {formatDate(item.updated_at)}
        </div>
        
        {/* Quick action buttons that appear on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={(e) => { e.stopPropagation(); onAnalyze(); }}
          >
            <BarChart2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Skeleton loading state for the card
export const ContentCardSkeleton: React.FC = () => {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-18 rounded-full" />
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </Card>
  );
};
