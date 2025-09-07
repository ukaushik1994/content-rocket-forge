import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Eye, FileText, BookOpen, Mail, Globe, MessageSquare, Edit, MoreHorizontal, BarChart2, Archive, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RepositoryListItemProps {
  content: ContentItemType;
  onView: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  onAnalyze?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const RepositoryListItem: React.FC<RepositoryListItemProps> = ({ 
  content, 
  onView,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'blog': return Edit;
      case 'glossary': return BookOpen;
      case 'email': return Mail;
      case 'landing_page': return Globe;
      case 'social_post': return MessageSquare;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-600';
      case 'draft': return 'bg-yellow-500/20 text-yellow-600';
      case 'archived': return 'bg-gray-500/20 text-gray-600';
      default: return 'bg-blue-500/20 text-blue-600';
    }
  };

  const ContentIcon = getContentTypeIcon(content.content_type);

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={item}
      className="glass-panel bg-background/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Content Type Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-neon-blue/20 flex items-center justify-center">
            <ContentIcon className="h-5 w-5 text-primary" />
          </div>

          {/* Content Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-foreground truncate">{content.title}</h3>
              <CustomBadge className={`flex-shrink-0 ${getStatusColor(content.status)}`}>
                {content.status}
              </CustomBadge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize">{content.content_type.replace('_', ' ')}</span>
              <span>•</span>
              <span>
                Updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
              </span>
              {content.metadata?.solution?.name && (
                <>
                  <span>•</span>
                  <span className="text-primary font-medium">{content.metadata.solution.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 px-2"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="glass-panel bg-background/95 backdrop-blur-sm border-white/10"
            >
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onPreview && (
                <DropdownMenuItem onClick={onPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              {onAnalyze && (
                <DropdownMenuItem onClick={onAnalyze}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Analyze
                </DropdownMenuItem>
              )}
              {onPublish && content.status === 'draft' && (
                <DropdownMenuItem onClick={onPublish}>
                  <span className="text-xs mr-2">📤</span>
                  Publish
                </DropdownMenuItem>
              )}
              {onArchive && content.status !== 'archived' && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              {(onEdit || onPreview || onAnalyze || onPublish || onArchive) && onDelete && (
                <DropdownMenuSeparator />
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};